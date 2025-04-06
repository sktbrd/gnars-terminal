'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Address, formatEther, parseEther } from 'viem';
import {
  useReadContract,
  useSimulateContract,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
} from '@chakra-ui/react';
import Image from 'next/image';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { safeParseJson } from '@/utils/zora';
import FormattedAddress from '@/components/utils/names';
interface TokenMetadata {
  name: string;
  description: string;
  image: string;
  animation_url?: string;
  properties?: {
    number: number;
    name: string;
  };
  attributes?: Array<{ trait_type: string; value: string }>;
}

// Add interface for aggregated holders
interface AggregatedHolder {
  address: string;
  tokenCount: number;
  tokenIds: bigint[];
}

const processBase64TokenUri = (tokenUri: string): TokenMetadata => {
  const base64Data = tokenUri.split(',')[1];
  const base64Decoded = atob(base64Data);
  const bytes = new Uint8Array(base64Decoded.length);
  for (let i = 0; i < base64Decoded.length; i++) {
    bytes[i] = base64Decoded.charCodeAt(i);
  }
  const jsonString = new TextDecoder('utf-8').decode(bytes);
  console.log('Decoded JSON string:', jsonString);
  return safeParseJson(jsonString);
};

const processDirectJsonUri = (tokenUri: string): TokenMetadata => {
  const jsonString = tokenUri.substring(
    tokenUri.indexOf('{'),
    tokenUri.lastIndexOf('}') + 1
  );
  return JSON.parse(jsonString);
};

const fetchUriMetadata = async (uri: string): Promise<TokenMetadata> => {
  const formattedUri = uri.startsWith('ipfs://')
    ? `https://ipfs.io/ipfs/${uri.slice(7)}`
    : uri;

  const response = await fetch(formattedUri);
  if (!response.ok) {
    throw new Error(`Failed to fetch metadata: ${response.statusText}`);
  }
  return await response.json();
};

const validateMetadata = (metadata: any): TokenMetadata => {
  if (!metadata.name || !metadata.image) {
    throw new Error('Invalid metadata: Missing required fields');
  }
  return metadata;
};

export default function DroposalPage() {
  const params = useParams();
  const contractAddress = params?.contractAddress;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);

  // Update minters state to store raw token data
  const [rawMinters, setRawMinters] = useState<
    { address: string; tokenId: bigint }[]
  >([]);

  // Add new state for aggregated holders
  const [aggregatedHolders, setAggregatedHolders] = useState<
    AggregatedHolder[]
  >([]);
  const [visibleHolders, setVisibleHolders] = useState<AggregatedHolder[]>([]);
  const [loadingMinters, setLoadingMinters] = useState(false);
  const [hasMoreHolders, setHasMoreHolders] = useState(true);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Ensure contractAddress is properly formatted
  const formattedContractAddress = Array.isArray(contractAddress)
    ? (contractAddress[0] as Address)
    : (contractAddress as Address);

  // Read sales configuration
  const { data: salesConfigData } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'salesConfig',
    args: [],
  });
  const [isPending, setIsPending] = useState(false);
  const [showSimulationResults, setShowSimulationResults] = useState(false);
  const [simulationValue, setSimulationValue] = useState<bigint | undefined>(
    undefined
  );

  // Fix: Correct function name and add quantity parameter
  const zoraFeeData = useReadContract({
    address: contractAddress as Address,
    abi: zoraMintAbi,
    functionName: 'zoraFeeForAmount',
    args: [BigInt(quantity)],
  });

  // Fix: Use state for simulation parameters
  const simulateMint = useSimulateContract({
    address: contractAddress as Address,
    abi: zoraMintAbi,
    functionName: 'purchaseWithComment',
    args: [BigInt(quantity), comment],
    value: simulationValue,
  });

  const isSimulating = simulateMint.isLoading;
  const isSimulated = simulateMint.isSuccess;
  const simulationError = simulateMint.error;
  const simulationData = simulateMint.data;
  const isSimulatedError = simulationError && !isSimulated;

  // Parse sales configuration
  const salesConfig = salesConfigData
    ? {
        publicSalePrice: salesConfigData[0]
          ? Number(formatEther(salesConfigData[0] as bigint))
          : 0,
        maxSalePurchasePerAddress: Number(salesConfigData[1]),
        publicSaleStart: Number(salesConfigData[2]),
        publicSaleEnd: Number(salesConfigData[3]),
        presaleStart: Number(salesConfigData[4]),
        presaleEnd: Number(salesConfigData[5]),
        presaleMerkleRoot: salesConfigData[6] as string,
      }
    : undefined;

  // Get tokenURI for tokenId 1
  const { data: tokenUri } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'tokenURI',
    args: [1n], // Using tokenId 1
  });

  // Get total supply
  const { data: totalSupplyData } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'totalSupply',
    args: [],
  });

  // Effect to set total supply when data is available
  useEffect(() => {
    if (totalSupplyData) {
      setTotalSupply(totalSupplyData as bigint);
    }
  }, [totalSupplyData]);

  // Function to get token owner
  const getTokenOwner = async (tokenId: bigint) => {
    try {
      console.log(`Fetching owner for token #${tokenId}`);
      const response = await fetch(
        `/api/zora?contractAddress=${formattedContractAddress}&tokenId=${tokenId.toString()}`
      );

      const data = await response.json();

      // Check for special case of internal error contract
      if (data.isInternalErrorContract) {
        console.log(
          'Contract returns internal error for standard calls, skipping further requests'
        );
        // Return special value to indicate we shouldn't try more requests
        return 'INTERNAL_ERROR_CONTRACT';
      }

      // Check if the token exists
      if (!response.ok || !data.exists) {
        console.log(`Token #${tokenId} does not exist or has no owner`);
        return null;
      }

      console.log(`Owner for token #${tokenId}:`, data.owner);
      return data.owner;
    } catch (err) {
      console.error(`Error fetching owner for token ${tokenId}:`, err);
      return null;
    }
  };

  // New function to aggregate and rank holders
  const aggregateAndRankHolders = (
    minters: { address: string; tokenId: bigint }[]
  ): AggregatedHolder[] => {
    // Create a map to aggregate holders
    const holdersMap = new Map<string, { count: number; tokens: bigint[] }>();

    // Count tokens per address
    minters.forEach(({ address, tokenId }) => {
      if (holdersMap.has(address)) {
        const data = holdersMap.get(address)!;
        data.count += 1;
        data.tokens.push(tokenId);
      } else {
        holdersMap.set(address, { count: 1, tokens: [tokenId] });
      }
    });

    // Convert map to array and sort by token count (descending)
    const sorted = Array.from(holdersMap.entries())
      .map(([address, data]) => ({
        address,
        tokenCount: data.count,
        tokenIds: data.tokens,
      }))
      .sort((a, b) => b.tokenCount - a.tokenCount);

    return sorted;
  };

  // Function to load more holders
  const loadMoreHolders = () => {
    const nextPage = page + 1;
    const start = (nextPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const nextBatch = aggregatedHolders.slice(start, end);

    if (nextBatch.length > 0) {
      setVisibleHolders((prev) => [...prev, ...nextBatch]);
      setPage(nextPage);
    }

    // Check if we've loaded all holders
    if (end >= aggregatedHolders.length) {
      setHasMoreHolders(false);
    }
  };

  // Fetch all minters recursively with improved error handling
  useEffect(() => {
    const fetchMinters = async () => {
      if (!totalSupply && totalSupply !== 0n) {
        console.log('Total supply not available yet');
        return;
      }

      setLoadingMinters(true);

      try {
        const mintersArray: { address: string; tokenId: bigint }[] = [];
        const addressSet = new Set<string>(); // To track unique addresses

        // Try token #1 first to detect issues early
        const firstTokenOwner = await getTokenOwner(1n);

        // If contract returns internal errors, don't try to fetch more tokens
        if (firstTokenOwner === 'INTERNAL_ERROR_CONTRACT') {
          console.log('Skipping minter fetching for internal error contract');
          setLoadingMinters(false);
          return;
        }

        // If totalSupply is 0 or we couldn't get it, try a few token IDs anyway
        const maxTokensToFetch =
          !totalSupply || totalSupply === 0n
            ? 5n
            : totalSupply > 50n
              ? 50n
              : totalSupply;

        // Start from the latest tokens which are more likely to exist
        const startTokenId =
          totalSupply && totalSupply > maxTokensToFetch
            ? totalSupply - maxTokensToFetch + 1n
            : 1n;

        console.log(
          `Fetching owners for tokens ${startTokenId} to ${totalSupply || 'unknown'}`
        );

        // Process tokens in smaller batches (5 at a time)
        for (
          let i = startTokenId;
          i <= (totalSupply || startTokenId + maxTokensToFetch - 1n);
          i += 5n
        ) {
          const batchPromises = [];

          for (
            let j = 0n;
            j < 5n &&
            i + j <= (totalSupply || startTokenId + maxTokensToFetch - 1n);
            j++
          ) {
            const tokenId = i + j;
            batchPromises.push(
              getTokenOwner(tokenId).then((owner) => ({ owner, tokenId }))
            );
          }

          // Wait between batches to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));

          const results = await Promise.allSettled(batchPromises);

          let shouldBreak = false;

          results.forEach((result) => {
            if (result.status === 'fulfilled') {
              if (result.value.owner === 'INTERNAL_ERROR_CONTRACT') {
                shouldBreak = true;
                return;
              }

              if (result.value.owner) {
                const { owner, tokenId } = result.value;
                mintersArray.push({ address: owner, tokenId });
              }
            }
          });

          if (shouldBreak) {
            break;
          }

          // Process and update results every batch to show progress
          if (mintersArray.length > 0) {
            setRawMinters([...mintersArray]);

            // Aggregate and update visible holders
            const aggregated = aggregateAndRankHolders(mintersArray);
            setAggregatedHolders(aggregated);

            // Set initial visible holders for the first page
            const initialVisible = aggregated.slice(0, ITEMS_PER_PAGE);
            setVisibleHolders(initialVisible);

            // Check if we have more holders beyond initial page
            setHasMoreHolders(aggregated.length > ITEMS_PER_PAGE);
          }
        }

        if (mintersArray.length === 0) {
          console.log(
            'No token owners found. Contract might be newly deployed or not have any mints yet.'
          );
        }
      } catch (err) {
        console.error('Error fetching minters:', err);
      } finally {
        setLoadingMinters(false);
      }
    };

    fetchMinters();
  }, [totalSupply, formattedContractAddress]);

  // Fetch metadata when URI is available
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!tokenUri) return;

      try {
        setLoading(true);
        console.log('Raw tokenURI:', tokenUri);

        let parsedMetadata: TokenMetadata;

        if (typeof tokenUri === 'string') {
          if (tokenUri.startsWith('data:application/json;base64,')) {
            parsedMetadata = processBase64TokenUri(tokenUri);
          } else if (tokenUri.startsWith('data:application/json')) {
            parsedMetadata = processDirectJsonUri(tokenUri);
          } else {
            parsedMetadata = await fetchUriMetadata(tokenUri);
          }

          setMetadata(validateMetadata(parsedMetadata));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch token metadata';
        setError(errorMessage);
        console.error('Error fetching metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenUri]);

  // Handle quantity change
  const handleIncreaseQuantity = () => {
    if (
      salesConfig?.maxSalePurchasePerAddress &&
      quantity >= salesConfig.maxSalePurchasePerAddress
    ) {
      return; // Don't exceed max purchase limit
    }
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // Handle comment change
  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setComment(e.target.value);
  };

  const { address } = useAccount();
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null
  );

  // Set up contract writing
  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
    data: hash,
  } = useWriteContract();

  // Track transaction status
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Combined loading state
  const isLoading = isWritePending || isConfirming || isPending;

  // Calculate the total price including protocol fee
  const calculateTotalPrice = () => {
    if (!salesConfig || !zoraFeeData.data) return null;

    // Get price per token from salesConfig
    const pricePerTokenInWei = salesConfig.publicSalePrice
      ? parseEther(salesConfig.publicSalePrice.toString())
      : 0n;

    // Calculate mint price (price per token * quantity)
    const mintPrice = pricePerTokenInWei * BigInt(quantity);

    // Get Zora protocol fee
    const zoraProtocolFee = zoraFeeData.data[1] as bigint;

    // Calculate total (mint price + protocol fee)
    const totalValue = mintPrice + zoraProtocolFee;

    return {
      pricePerTokenInWei,
      mintPrice,
      zoraProtocolFee,
      totalValue,
      totalInEth: Number(totalValue) / 1e18, // For display
    };
  };

  // Handle mint action
  const handleMint = async () => {
    if (!formattedContractAddress || !address) {
      console.warn('Cannot mint: missing contract address or user address');
      return;
    }

    if (!salesConfig) {
      console.warn('Cannot mint: salesConfig not available');
      return;
    }

    if (!zoraFeeData.data) {
      console.warn('Cannot mint: Zora fee data not loaded yet');
      return;
    }

    const priceInfo = calculateTotalPrice();
    if (!priceInfo) {
      console.warn('Cannot mint: price information not available');
      return;
    }

    console.log('Starting mint process:', {
      contractAddress: formattedContractAddress,
      quantity,
      comment,
      totalValue: priceInfo.totalValue.toString(),
      totalInEth: priceInfo.totalInEth,
    });

    setIsPending(true);
    try {
      writeContract({
        address: formattedContractAddress,
        abi: zoraMintAbi,
        functionName: 'purchaseWithComment',
        args: [BigInt(quantity), comment],
        value: priceInfo.totalValue,
      });
    } catch (err) {
      console.error('Exception during mint:', err);
    } finally {
      setIsPending(false);
    }
  };

  // Log when hash is received
  useEffect(() => {
    if (hash) {
      console.log('Transaction hash received:', hash);
      setTransactionHash(hash);
    }
  }, [hash]);

  // Handle loading states
  if (loading) {
    return (
      <Container maxW='container.xl' py={10}>
        <Flex justify='center' align='center' minH='50vh'>
          <Spinner size='xl' />
          <Text ml={4}>Loading token data...</Text>
        </Flex>
      </Container>
    );
  }

  // Handle errors
  if (error) {
    return (
      <Container maxW='container.xl' py={10}>
        <Box bg='red.50' p={5} borderRadius='md'>
          <Heading size='md' color='red.500'>
            Error Loading Token
          </Heading>
          <Text mt={2}>{error}</Text>
        </Box>
      </Container>
    );
  }

  // Get image URL with IPFS handling
  const getImageUrl = (imageUri?: string) => {
    if (!imageUri) return '/images/logo.png';
    if (imageUri.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${imageUri.slice(7)}`;
    }
    return imageUri;
  };

  return (
    <Container maxW='container.xl' py={10}>
      <Flex gap={10} flexDirection={{ base: 'column', md: 'row' }}>
        {/* Left Section: Media (Video or Image) */}
        <Box flex='1' minW={{ base: '100%', md: '60%' }}>
          {metadata?.animation_url ? (
            // Render video if animation_url exists
            <Box
              borderRadius='lg'
              overflow='hidden'
              position='relative'
              height={{ base: '300px', md: 'auto' }}
              mb={6}
            >
              <video
                src={getImageUrl(metadata.animation_url)}
                controls
                autoPlay
                loop
                muted
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
          ) : metadata?.image ? (
            // Fall back to image if no animation_url
            <Box
              borderRadius='lg'
              overflow='hidden'
              position='relative'
              height='500px'
              mb={6}
            >
              <Image
                src={getImageUrl(metadata.image)}
                alt={metadata?.name || 'Token Image'}
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          ) : null}
        </Box>

        {/* Right Section: Details and Actions */}
        <Box flex='1'>
          <Box>
            <Heading size='4xl' mb={4}>
              {metadata?.name || 'Unknown Token'}
            </Heading>
            <Text color='gray.500' mb={4}>
              {metadata?.description || 'No description available.'}
            </Text>
          </Box>
          <VStack align='stretch' gap={6}>
            {/* Quantity Selector */}
            <Box>
              <Text fontWeight='bold' mb={2}>
                Quantity
              </Text>
              <Flex align='center'>
                <Button
                  onClick={handleDecreaseQuantity}
                  disabled={quantity <= 1}
                  size='sm'
                >
                  -
                </Button>
                <Text mx={4} fontWeight='bold'>
                  {quantity}
                </Text>
                <Button
                  onClick={handleIncreaseQuantity}
                  disabled={
                    salesConfig?.maxSalePurchasePerAddress
                      ? quantity >= salesConfig.maxSalePurchasePerAddress
                      : false
                  }
                  size='sm'
                >
                  +
                </Button>
              </Flex>
            </Box>

            {/* Comment Input */}
            <Box>
              <Text fontWeight='bold' mb={2}>
                Comment (optional)
              </Text>
              <input
                type='text'
                value={comment}
                onChange={handleCommentChange}
                placeholder='Add a comment to your mint transaction...'
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #E2E8F0',
                }}
              />
            </Box>

            {/* Mint Button */}
            <Box>
              <Button
                colorScheme='blue'
                size='lg'
                width='100%'
                onClick={handleMint}
                disabled={!address || isLoading || !salesConfig}
              >
                {isConfirmed
                  ? 'Collected!'
                  : `Collect for ${
                      salesConfig?.publicSalePrice
                        ? `${(salesConfig.publicSalePrice * quantity).toFixed(3)} ETH${zoraFeeData.data ? ' + fees' : ''}`
                        : ''
                    }`}
              </Button>

              {/* {writeError && (
                <Text color='red.500' fontSize='sm' mt={2}>
                  Error: {writeError.message}
                </Text>
              )} */}

              {confirmError && (
                <Text color='red.500' fontSize='sm' mt={2}>
                  Transaction failed: {confirmError.message}
                </Text>
              )}

              {isConfirmed && (
                <Text color='green.500' fontSize='sm' mt={2}>
                  Successfully minted!
                  {transactionHash && (
                    <a
                      href={`https://basescan.org/tx/${transactionHash}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{ marginLeft: '4px', textDecoration: 'underline' }}
                    >
                      View on BaseScan
                    </a>
                  )}
                </Text>
              )}
            </Box>

            {/* Supporters Section - Updated to show aggregated holders */}
            <Box>
              <Heading size='md' mb={4}>
                Supporters
              </Heading>
              {loadingMinters && visibleHolders.length === 0 ? (
                <Flex justify='center' my={4}>
                  <Spinner size='sm' mr={2} />
                  <Text>Loading supporters...</Text>
                </Flex>
              ) : visibleHolders.length > 0 ? (
                <VStack align='stretch' gap={2}>
                  {visibleHolders.map((holder, index) => (
                    <Flex
                      key={index}
                      justify='space-between'
                      p={2}
                      borderRadius='md'
                    >
                      <Flex align='center'>
                        <FormattedAddress address={holder.address} />
                        <Text
                          fontSize='sm'
                          color='blue.500'
                          ml={2}
                          fontWeight='bold'
                        >
                          {holder.tokenCount > 1
                            ? `(${holder.tokenCount} tokens)`
                            : ''}
                        </Text>
                      </Flex>
                      <Text fontSize='sm' color='gray.500'>
                        Latest: #{holder.tokenIds[0].toString()}
                      </Text>
                    </Flex>
                  ))}

                  {/* Load More Button */}
                  {hasMoreHolders && (
                    <Button
                      onClick={loadMoreHolders}
                      mt={2}
                      size='sm'
                      variant='outline'
                    >
                      Load More Supporters
                    </Button>
                  )}
                </VStack>
              ) : (
                <Text>No supporters found</Text>
              )}

              {/* Loading indicator when fetching more data */}
              {loadingMinters && visibleHolders.length > 0 && (
                <Flex justify='center' mt={2}>
                  <Spinner size='sm' mr={2} />
                  <Text fontSize='sm'>Fetching more tokens...</Text>
                </Flex>
              )}
            </Box>

            <hr />

            {/* Details Section */}
            <Box>
              {/* <Heading size='md' mb={4}>
                Details
              </Heading> */}
              <Text>
                <strong>Contract Address:</strong> {contractAddress}
              </Text>
              <Text>
                <strong>Total Supply:</strong>{' '}
                {totalSupply ? totalSupply.toString() : 'Loading...'}
              </Text>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
}
