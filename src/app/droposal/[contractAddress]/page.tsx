'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Address, formatEther } from 'viem';
import { useReadContract } from 'wagmi';
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import Image from 'next/image';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
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

// More robust utility function to sanitize and safely parse JSON
const safeParseJson = (jsonString: string): any => {
  try {
    // First attempt: Direct parsing
    try {
      return JSON.parse(jsonString);
    } catch (directError) {
      console.log('Direct JSON parsing failed, attempting to fix JSON...');

      // Second attempt: Manual find and replace of the problematic section
      const fixedJson = jsonString.replace(
        /This proposal mints the "([^"]*?)" NFT video/g,
        'This proposal mints the \\"$1\\" NFT video'
      );

      try {
        return JSON.parse(fixedJson);
      } catch (fixError) {
        console.log(
          'JSON fix attempt failed, falling back to manual extraction...'
        );

        // Third attempt: Manual extraction of fields with improved description extraction
        const name =
          jsonString.match(/"name"\s*:\s*"([^"]*)"/)?.[1] || 'Unknown';

        // Extract description more carefully
        let description = '';
        const descMatch = jsonString.match(
          /"description"\s*:\s*"(.*?)(?<!\\)",/
        );
        if (descMatch && descMatch[1]) {
          description = descMatch[1].replace(/\\"/g, '"');
        }

        const image = jsonString.match(/"image"\s*:\s*"([^"]*)"/)?.[1] || '';
        const animation_url = jsonString.match(
          /"animation_url"\s*:\s*"([^"]*)"/
        )?.[1];

        // Extract properties
        let properties = {};
        try {
          const propsMatch = jsonString.match(/"properties"\s*:\s*(\{[^}]*\})/);
          if (propsMatch && propsMatch[1]) {
            const propsJson = propsMatch[1]
              .replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3') // Ensure property names are quoted
              .replace(/:\s*'([^']*)'/g, ': "$1"'); // Replace single quotes with double quotes
            properties = JSON.parse(propsJson);
          }
        } catch (e) {
          console.error('Failed to parse properties:', e);
          properties = { number: 1, name: 'Unknown' };
        }

        return {
          name,
          description,
          image,
          animation_url,
          properties,
        };
      }
    }
  } catch (error) {
    console.error('Failed to parse JSON by any method:', error);
  }
};

export default function DroposalPage() {
  const params = useParams();
  const contractAddress = params?.contractAddress;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

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
      try {
        setLoading(true);

        if (tokenUri) {
          console.log('Raw tokenURI:', tokenUri);

          if (
            typeof tokenUri === 'string' &&
            tokenUri.startsWith('data:application/json;base64,')
          ) {
            try {
              const base64Data = tokenUri.split(',')[1];
              const base64Decoded = atob(base64Data);
              const bytes = new Uint8Array(base64Decoded.length);
              for (let i = 0; i < base64Decoded.length; i++) {
                bytes[i] = base64Decoded.charCodeAt(i);
              }
              const jsonString = new TextDecoder('utf-8').decode(bytes);
              console.log('Decoded JSON string:', jsonString);

              // Safely parse JSON
              const parsedMetadata = safeParseJson(jsonString);

              // Validate metadata
              if (!parsedMetadata.name || !parsedMetadata.image) {
                throw new Error('Invalid metadata: Missing required fields');
              }

              console.log('Parsed metadata:', parsedMetadata);
              setMetadata(parsedMetadata);
            } catch (parseError) {
              console.error('JSON parsing error:', parseError);
              setError(
                `Failed to parse metadata: ${parseError instanceof Error ? parseError.message : String(parseError)}`
              );
            }
          }
          // Handle direct JSON data
          else if (
            typeof tokenUri === 'string' &&
            tokenUri.startsWith('data:application/json')
          ) {
            try {
              const jsonString = tokenUri.substring(
                tokenUri.indexOf('{'),
                tokenUri.lastIndexOf('}') + 1
              );
              console.log('Extracted JSON string:', jsonString);
              const parsedMetadata = JSON.parse(jsonString);
              console.log('Parsed metadata:', parsedMetadata);
              setMetadata(parsedMetadata);
            } catch (parseError) {
              console.error('JSON parsing error:', parseError);
              setError(
                `Failed to parse direct JSON metadata: ${parseError instanceof Error ? parseError.message : String(parseError)}`
              );
            }
          }
          // Handle HTTP or IPFS URI
          else if (typeof tokenUri === 'string') {
            // Fetch metadata from URI
            const response = await fetch(
              tokenUri.startsWith('ipfs://')
                ? `https://ipfs.io/ipfs/${tokenUri.slice(7)}`
                : tokenUri
            );
            if (response.ok) {
              const data = await response.json();
              setMetadata(data);
            } else {
              throw new Error('Failed to fetch metadata from URI');
            }
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch token metadata'
        );
        console.error('Error fetching metadata:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenUri]);

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

  // Process description text to handle special characters
  const processDescription = (desc?: string) => {
    if (!desc) return 'No description available';
    // Format description by unescaping quotes and replacing special characters
    return desc
      .replace(/\\"/g, '"')
      .replace(/\\m\//g, '\\m/')
      .replace(/\\n/g, '\n');
  };

  return (
    <Container maxW='container.xl' py={10}>
      <Flex gap={10} flexDirection={{ base: 'column', md: 'row' }}>
        {/* Left Section: Image and Description */}
        <Box flex='1'>
          {metadata?.image && (
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
            {/* Mint Button */}
            <Box>
              <Button colorScheme='blue' size='lg' width='100%'>
                Collect for {}
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
