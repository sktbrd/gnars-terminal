'use client';

// --- Imports ---
import { useState, useEffect, useMemo } from 'react';
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
import React from 'react';

// --- Types ---
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

// --- Utility Functions ---
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
    ? `https://ipfs.skatehive.app/ipfs/${uri.slice(7)}`
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

const INITIAL_BATCH_SIZE = 20; // Only fetch 20 owners initially
const ITEMS_PER_PAGE = 8; // Keep as before

// --- Cheerful ETH Volume Display ---
const CheerfulEthVolume = React.memo(function CheerfulEthVolume({ netVolume, totalSupply, pricePerMint }: { netVolume: string | null, totalSupply: bigint | null, pricePerMint: number | null }) {
  if (netVolume === null) return null;
  return (
    <Box
      mt={4}
      mb={2}
      p={4}
      borderRadius={16}
      bg='primary'
      color='secondary'
      textAlign='center'
      fontWeight={700}
      fontSize={['lg', '2xl']}
      boxShadow='md'
    >
      🎉 This droposal has generated{' '}
      <span style={{ color: 'secondary', filter: 'brightness(1.1)' }}>
        {netVolume} ETH
      </span>{' '}
      so far!
      <br />
      <span style={{ fontSize: 16, fontWeight: 400 }}>
        ( {totalSupply?.toString()} mints × {pricePerMint ?? '?'} ETH per mint, minus Zora fees)
      </span>
    </Box>
  );
});

// --- Main Component ---
export default function DroposalPage({
  initialMetadata,
}: {
  initialMetadata: TokenMetadata;
}) {
  // --- State ---
  const params = useParams();
  const contractAddress = params?.contractAddress;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(
    initialMetadata
  );
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState('');
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [rawMinters, setRawMinters] = useState<
    { address: string; tokenId: bigint }[]
  >([]);
  const [aggregatedHolders, setAggregatedHolders] = useState<
    AggregatedHolder[]
  >([]);
  const [visibleHolders, setVisibleHolders] = useState<AggregatedHolder[]>([]);
  const [loadingMinters, setLoadingMinters] = useState(false);
  const [hasMoreHolders, setHasMoreHolders] = useState(true);
  const [nextTokenIdToFetch, setNextTokenIdToFetch] = useState<bigint>(1n);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [transactionHash, setTransactionHash] = useState<`0x${string}` | null>(
    null
  );
  const { address } = useAccount();

  // Ensure contractAddress is properly formatted
  const formattedContractAddress = Array.isArray(contractAddress)
    ? (contractAddress[0] as Address)
    : (contractAddress as Address);

  // NOTE: Use 'saleDetails' for broader Zora drop compatibility
  const { data: saleDetailsData } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi, // <-- correct ABI for reads
    functionName: 'saleDetails',
    args: [],
  });

  // Fix: Correct function name and add quantity parameter
  const zoraFeeData = useReadContract({
    address: contractAddress as Address,
    abi: zoraMintAbi,
    functionName: 'zoraFeeForAmount',
    args: [BigInt(quantity)],
  });

  // --- ETH Volume Calculation: decoupled from mint quantity ---
  // Always use quantity 1 for fee calculation
  const zoraFeeDataForVolume = useReadContract({
    address: contractAddress as Address,
    abi: zoraMintAbi,
    functionName: 'zoraFeeForAmount',
    args: [1n],
  });

  // Parse sale details
  const salesConfig = saleDetailsData
    ? {
        publicSalePrice: saleDetailsData.publicSalePrice
          ? Number(formatEther(saleDetailsData.publicSalePrice))
          : 0,
        maxSalePurchasePerAddress: Number(
          saleDetailsData.maxSalePurchasePerAddress
        ),
        publicSaleStart: Number(saleDetailsData.publicSaleStart),
        publicSaleEnd: Number(saleDetailsData.publicSaleEnd),
        presaleStart: Number(saleDetailsData.presaleStart),
        presaleEnd: Number(saleDetailsData.presaleEnd),
        presaleMerkleRoot: saleDetailsData.presaleMerkleRoot,
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

  // Read contract owner (move up with other hooks)
  const { data: contractOwner } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'owner',
    args: [],
  });

  // --- Volume Calculation (decoupled from mint quantity) ---
  // Memoize so it only updates when relevant data changes
  const ethVolumeInfo = useMemo(() => {
    if (
      totalSupply !== null &&
      saleDetailsData &&
      zoraFeeDataForVolume.data &&
      saleDetailsData.publicSalePrice
    ) {
      const pricePerMint = Number(formatEther(saleDetailsData.publicSalePrice));
      const totalMintRevenue = Number(totalSupply) * pricePerMint;
      // Zora fee for 1 mint, multiply by totalSupply
      const zoraFeePerMint = Number(formatEther(zoraFeeDataForVolume.data[1] as bigint));
      const totalZoraFee = zoraFeePerMint * Number(totalSupply);
      const netVolume = (totalMintRevenue - totalZoraFee).toFixed(4);
      return {
        netVolume,
        totalSupply,
        pricePerMint,
      };
    }
    return {
      netVolume: null,
      totalSupply: totalSupply ?? null,
      pricePerMint: saleDetailsData?.publicSalePrice
        ? Number(formatEther(saleDetailsData.publicSalePrice))
        : null,
    };
  }, [totalSupply, saleDetailsData, zoraFeeDataForVolume.data]);

  // All hooks must be called before any return!
  // Move all useState, useEffect, useMemo, and helper functions above any return

  // Get image URL with IPFS handling and fallback
  const getImageUrl = (imageUri?: string) => {
    const FALLBACK_IMAGE = '/images/gnars.webp';
    if (!imageUri || typeof imageUri !== 'string') return FALLBACK_IMAGE;
    if (imageUri.startsWith('ipfs://')) {
      return `https://ipfs.skatehive.app/ipfs/${imageUri.slice(7)}`;
    }
    if (!imageUri.startsWith('http')) return FALLBACK_IMAGE;
    return imageUri;
  };

  // Memoize media (video/image) so it doesn't re-render on unrelated state changes
  const mediaElement = useMemo(() => {
    if (metadata?.animation_url) {
      return (
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
      );
    } else if (metadata?.image) {
      return (
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
      );
    }
    return null;
  }, [metadata?.animation_url, metadata?.image, metadata?.name]);

  // Set up contract writing (single instance for both mint and withdraw)
  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
    data: hash,
  } = useWriteContract();
  // Track which action is pending: 'mint' | 'withdraw' | null
  const [pendingAction, setPendingAction] = useState<null | 'mint' | 'withdraw'>(null);
  // --- Withdraw-specific state ---
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | null>(null);
  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawConfirmed,
    error: withdrawConfirmError,
  } = useWaitForTransactionReceipt({ hash: withdrawHash ?? undefined });
  // Track transaction status
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });
  // Combined loading state
  const isLoading = isWritePending || isConfirming || isPending;

  // All useEffect hooks must come after all state/hooks are declared
  useEffect(() => {
    if (hash) {
      console.log('Transaction hash received:', hash);
      setTransactionHash(hash);
    }
  }, [hash]);

  useEffect(() => {
    if (pendingAction === 'withdraw' && hash) {
      setWithdrawHash(hash);
    }
  }, [pendingAction, hash]);

  useEffect(() => {
    if (totalSupplyData) {
      setTotalSupply(totalSupplyData as bigint);
    }
  }, [totalSupplyData]);

  useEffect(() => {
    if (!tokenUri || initialMetadata) return;
    const fetchMetadata = async () => {
      try {
        setLoading(true);
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
  }, [tokenUri, initialMetadata]);

  useEffect(() => {
    if (initialMetadata) {
      setLoading(false);
    }
  }, [initialMetadata]);

  useEffect(() => {
    if (!totalSupply && totalSupply !== 0n) return;

    let cancelled = false;
    setLoadingMinters(true);

    (async () => {
      try {
        // Only fetch up to totalSupply or INITIAL_BATCH_SIZE
        const maxTokenId =
          totalSupply && totalSupply > 0n
            ? totalSupply < BigInt(INITIAL_BATCH_SIZE)
              ? totalSupply
              : BigInt(INITIAL_BATCH_SIZE)
            : 1n;
        const owners = await fetchTokenOwnersBatch(1n, maxTokenId);

        if (!cancelled) {
          setRawMinters(owners); // owners is now { address, tokenId }[]
          const aggregated = aggregateAndRankHolders(owners);
          setAggregatedHolders(aggregated);
          setVisibleHolders(aggregated.slice(0, ITEMS_PER_PAGE));
          setHasMoreHolders(
            (totalSupply && maxTokenId < totalSupply) ||
              aggregated.length > ITEMS_PER_PAGE
          );
          setNextTokenIdToFetch(maxTokenId + 1n);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to fetch supporters');
      } finally {
        if (!cancelled) setLoadingMinters(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [totalSupply, formattedContractAddress]);

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

  // Function to fetch a batch of token owners using the new batch API
  const fetchTokenOwnersBatch = async (
    startTokenId: bigint,
    endTokenId: bigint
  ) => {
    // Add a delay to avoid spamming the RPC
    await new Promise((resolve) => setTimeout(resolve, 400)); // 400ms delay between batch requests
    try {
      const response = await fetch(
        `/api/zora?contractAddress=${formattedContractAddress}&startTokenId=${startTokenId.toString()}&endTokenId=${endTokenId.toString()}`
      );
      const data = await response.json();
      if (data.isInternalErrorContract) {
        return [];
      }
      if (!response.ok || !data.owners) {
        return [];
      }
      // Map to { address, tokenId }
      return data.owners
        .filter((o: any) => o.exists && o.owner)
        .map((o: any) => ({ address: o.owner, tokenId: BigInt(o.tokenId) }));
    } catch (err) {
      console.error('Error fetching owners batch:', err);
      return [];
    }
  };

  // Load more holders (fetch next batch)
  const loadMoreHolders = async () => {
    if (!totalSupply || loadingMore) return;
    setLoadingMore(true);

    try {
      // Fetch next batch, but not past totalSupply
      const endTokenId =
        nextTokenIdToFetch + BigInt(INITIAL_BATCH_SIZE) - 1n > totalSupply
          ? totalSupply
          : nextTokenIdToFetch + BigInt(INITIAL_BATCH_SIZE) - 1n;
      const owners = await fetchTokenOwnersBatch(
        nextTokenIdToFetch,
        endTokenId
      );

      // Merge with previous minters
      const newRawMinters = [...rawMinters, ...owners]; // both are { address, tokenId }[]
      setRawMinters(newRawMinters);

      // Aggregate and update holders
      const aggregated = aggregateAndRankHolders(newRawMinters);
      setAggregatedHolders(aggregated);

      // Add next page of holders to visible
      setVisibleHolders(
        aggregated.slice(0, visibleHolders.length + ITEMS_PER_PAGE)
      );

      // Update next token id to fetch
      setNextTokenIdToFetch(endTokenId + 1n);

      // Check if more holders exist
      setHasMoreHolders(endTokenId < totalSupply);
    } catch (err) {
      setError('Failed to load more supporters');
    } finally {
      setLoadingMore(false);
    }
  };

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

    setPendingAction('mint');
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
      setPendingAction(null);
    }
  };

  // Withdraw contract write (reuse writeContract)
  const handleWithdraw = async () => {
    setPendingAction('withdraw');
    try {
      if (!formattedContractAddress) {
        console.error('No contract address for withdraw');
        setPendingAction(null);
        return;
      }
      console.log('Withdrawing funds from contract:', formattedContractAddress);
      console.log('Pending action:', pendingAction);

      writeContract({
        address: formattedContractAddress,
        abi: zoraMintAbi,
        functionName: 'withdraw',
        args: [],
      });
    } catch (err) {
      console.error('Error in handleWithdraw:', err);
      setPendingAction(null);
    }
  };

  return (
    <Container maxW='container.xl' py={10}>
      <Flex gap={10} flexDirection={{ base: 'column', md: 'row' }}>
        {/* Left Section: Media (Video or Image) */}
        <Box flex='1' minW={{ base: '100%', md: '60%' }}>
          {mediaElement}
          {/* Cheerful ETH volume display (now decoupled from mint quantity) */}
          <CheerfulEthVolume netVolume={ethVolumeInfo.netVolume} totalSupply={ethVolumeInfo.totalSupply} pricePerMint={ethVolumeInfo.pricePerMint} />
          {/* Withdraw Section (simple, for contract owner/manager) */}
          {typeof contractOwner === 'string' &&
            address &&
            contractOwner.toLowerCase() === address.toLowerCase() && (
              <Box
                mt={8}
                p={4}
                borderRadius={8}
                bg='primary'
                color='secondary'
                boxShadow='md'
              >
                <Heading size='md' mb={2} color='secondary'>
                  Withdraw Funds
                </Heading>
                <Button
                  colorScheme='orange'
                  bg='secondary'
                  color='primary'
                  _hover={{ bg: 'secondary', opacity: 0.9 }}
                  onClick={handleWithdraw}
                  _loading={
                    pendingAction === 'withdraw' || isWithdrawConfirming
                      ? {}
                      : undefined
                  }
                  disabled={
                    pendingAction === 'withdraw' || isWithdrawConfirming
                  }
                >
                  {isWithdrawConfirmed ? 'Withdrawn!' : 'Withdraw'}
                </Button>
                {writeError && pendingAction === 'withdraw' && (
                  <Text color='red.400'>Error: {writeError.message}</Text>
                )}
                {withdrawConfirmError && (
                  <Text color='red.400'>
                    Transaction failed: {withdrawConfirmError.message}
                  </Text>
                )}
                {isWithdrawConfirmed && withdrawHash && (
                  <Text color='green.400' fontSize='sm' mt={2}>
                    Successfully withdrawn!
                    <a
                      href={`https://basescan.org/tx/${withdrawHash}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{
                        marginLeft: '4px',
                        textDecoration: 'underline',
                        color: 'inherit',
                      }}
                    >
                      View on BaseScan
                    </a>
                  </Text>
                )}
              </Box>
            )}
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
                      _loading={loadingMore ? {} : undefined}
                    >
                      Load More Supporters
                    </Button>
                  )}
                </VStack>
              ) : (
                <Text>No supporters found</Text>
              )}

              {/* Loading indicator when fetching more data */}
              {loadingMore && visibleHolders.length > 0 && (
                <Flex justify='center' mt={2}>
                  <Spinner size='sm' mr={2} />
                  <Text fontSize='sm'>Fetching more tokens...</Text>
                </Flex>
              )}
            </Box>

            <hr />

            {/* Details Section */}
            <Box>
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
