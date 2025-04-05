'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Address, formatEther } from 'viem';
import { useReadContract, useSimulateContract } from 'wagmi';
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

  const { data: name } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'name',
    args: [],
  });

  // Get tokenURI for tokenId 1
  const { data: tokenUri } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'tokenURI',
    args: [1n], // Using tokenId 1
  });

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
        <Box flex='1'>
          {metadata?.animation_url ? (
            // Render video if animation_url exists
            <Box
              borderRadius='lg'
              overflow='hidden'
              position='relative'
              height='500px'
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
                <Text ml={4} fontSize='sm' color='gray.500'>
                  {salesConfig?.maxSalePurchasePerAddress
                    ? `Max ${salesConfig.maxSalePurchasePerAddress} per wallet`
                    : ''}
                </Text>
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
              <Button colorScheme='blue' size='lg' width='100%'>
                Collect for{' '}
                {salesConfig?.publicSalePrice
                  ? `${(salesConfig.publicSalePrice * quantity).toFixed(3)} ETH`
                  : ''}
              </Button>
            </Box>

            {/* Offers Section */}
            <Box>
              <Heading size='md' mb={2}>
                Offers
              </Heading>
              <Text>No active offers for this token.</Text>
            </Box>

            <hr />

            {/* Details Section */}
            <Box>
              <Heading size='md' mb={4}>
                Details
              </Heading>
              <Text>
                <strong>Contract Address:</strong> {contractAddress}
              </Text>
              <Text>
                <strong>Token ID:</strong>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
}
