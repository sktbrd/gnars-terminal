'use client';

import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { Box, Container, Flex } from '@chakra-ui/react';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Address, formatEther } from 'viem';
import { useAccount, useReadContract } from 'wagmi';

// Import custom components
import { MediaSection } from './MediaSection';
import { MintSection } from './MintSection';
import { SupportersSection } from './SupportersSection';
import { TokenDetailsSection } from './TokenDetailsSection';
import { WithdrawSection } from './WithdrawSection';

// Import types and utilities
import { CheerfulEthVolume } from './CheerfulEthVolume';
import {
  fetchUriMetadata,
  processBase64TokenUri,
  processDirectJsonUri,
  validateMetadata,
} from './droposalUtils';
import { TokenMetadata } from './types';

interface DroposalPageProps {
  initialMetadata?: TokenMetadata;
}

export default function DroposalPage({ initialMetadata }: DroposalPageProps) {
  // --- Basic state ---
  const params = useParams();
  const contractAddress = params?.contractAddress;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(
    initialMetadata || null
  );
  const [totalSupply, setTotalSupply] = useState<bigint | null>(null);
  const [mintQuantity, setMintQuantity] = useState(1);
  const { address } = useAccount();

  // Ensure contractAddress is properly formatted
  const formattedContractAddress = Array.isArray(contractAddress)
    ? (contractAddress[0] as Address)
    : (contractAddress as Address);

  // --- Contract interaction hooks ---
  // Get sale details
  const { data: saleDetailsData } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'saleDetails',
    args: [],
  });

  // Get Zora fee data for current mint quantity
  const zoraFeeData = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'zoraFeeForAmount',
    args: [BigInt(mintQuantity)],
  });

  // Get Zora fee data for volume calculation (always use quantity 1)
  const zoraFeeDataForVolume = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'zoraFeeForAmount',
    args: [1n],
  });

  // Get total supply first
  const { data: totalSupplyData, isSuccess: totalSupplyLoaded } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'totalSupply',
    args: [],
  });

  // State for tokenUri to manage it manually
  const [tokenUri, setTokenUri] = useState<string | null>(null);
  const [tokenUriError, setTokenUriError] = useState<Error | null>(null);
  const [tokenUriLoading, setTokenUriLoading] = useState(false);

  // Effect to fetch tokenURI only when safe to do so
  useEffect(() => {
    // Reset states when dependencies change
    setTokenUri(null);
    setTokenUriError(null);
    
    // Only fetch if totalSupply has loaded and is > 0
    if (!totalSupplyLoaded || !totalSupplyData || Number(totalSupplyData) === 0) {
      return;
    }

    const fetchTokenUri = async () => {
      try {
        setTokenUriLoading(true);
        setTokenUriError(null);
        
        // Use wagmi's readContract function
        const { readContract } = await import('wagmi/actions');
        const { getConfig } = await import('@/utils/wagmi');
        
        const result = await readContract(getConfig(), {
          address: formattedContractAddress,
          abi: zoraMintAbi,
          functionName: 'tokenURI',
          args: [1n],
        });
        
        setTokenUri(result as string);
      } catch (err) {
        console.warn('Failed to fetch tokenURI:', err);
        const error = err as Error;
        // Check if it's the URIQueryForNonexistentToken error
        if (error.message.includes('0xa14c4b50') || error.message.includes('URIQueryForNonexistentToken')) {
          // This is expected for contracts with no tokens, don't set as error
          setTokenUri(null);
        } else {
          setTokenUriError(error);
        }
      } finally {
        setTokenUriLoading(false);
      }
    };

    fetchTokenUri();
  }, [formattedContractAddress, totalSupplyLoaded, totalSupplyData]);

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: formattedContractAddress,
    abi: zoraMintAbi,
    functionName: 'owner',
    args: [],
  });

  // --- Derived data ---
  // Parse sales config from saleDetailsData
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

  // --- Volume calculation (decoupled from mint quantity) ---
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
      const zoraFeePerMint = Number(
        formatEther(zoraFeeDataForVolume.data[1] as bigint)
      );
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

  // --- Check if user is contract owner ---
  const isContractOwner = useMemo(() => {
    return (
      typeof contractOwner === 'string' &&
      address &&
      contractOwner.toLowerCase() === address.toLowerCase()
    );
  }, [contractOwner, address]);

  // --- Effects ---
  // Update totalSupply when data is available
  useEffect(() => {
    if (totalSupplyData) {
      setTotalSupply(totalSupplyData as bigint);
    }
  }, [totalSupplyData]);

  // Fetch metadata if not provided
  useEffect(() => {
    // If initial metadata is provided, use it
    if (initialMetadata) return;
    
    // Wait for totalSupply to load first
    if (!totalSupplyLoaded) {
      return;
    }
    
    // If no tokens have been minted yet, set fallback metadata
    if (totalSupplyData !== undefined && Number(totalSupplyData) === 0) {
      setMetadata(validateMetadata(null));
      setLoading(false);
      return;
    }
    
    // If tokenURI call failed, handle gracefully
    if (tokenUriError) {
      const errorMessage = tokenUriError.message;
      console.warn('TokenURI call failed:', tokenUriError);
      setError(`Error loading token data: ${errorMessage}`);
      setMetadata(validateMetadata(null));
      setLoading(false);
      return;
    }
    
    // If we're still loading tokenURI, keep loading
    if (tokenUriLoading) {
      return;
    }
    
    // If we have tokens but no tokenURI yet, keep waiting
    if (Number(totalSupplyData || 0) > 0 && !tokenUri) {
      return;
    }
    
    // If no tokens exist, use fallback
    if (Number(totalSupplyData || 0) === 0) {
      setMetadata(validateMetadata(null));
      setLoading(false);
      return;
    }

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
          const validatedMetadata = validateMetadata(parsedMetadata);
          setMetadata(validatedMetadata);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch token metadata';
        setError(errorMessage);
        console.error('Error fetching metadata:', err);
        // Set fallback metadata on error
        setMetadata(validateMetadata(null));
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [tokenUri, initialMetadata, totalSupplyData, totalSupplyLoaded, tokenUriError, tokenUriLoading]);

  // Set loading to false if initialMetadata is provided
  useEffect(() => {
    if (initialMetadata) {
      setLoading(false);
    }
  }, [initialMetadata]);

  return (
    <Container maxW='container.xl' py={4}>
      {/* Mobile Layout */}
      <Box display={{ base: 'flex', md: 'none' }} flexDirection='column' gap={6}>
        {/* 1. Media */}
        <MediaSection
          metadata={metadata}
          loading={loading}
          error={error}
          ethVolumeInfo={ethVolumeInfo}
          noTokensYet={totalSupply !== null && Number(totalSupply) === 0}
        />

        {/* 2. Details */}
        <TokenDetailsSection
          metadata={metadata}
          contractAddress={formattedContractAddress}
          totalSupply={totalSupply}
        />

        {/* 3. Mint section */}
        <MintSection
          address={address}
          contractAddress={formattedContractAddress}
          salesConfig={salesConfig}
          zoraFeeData={zoraFeeData}
          mintQuantity={mintQuantity}
          setMintQuantity={setMintQuantity}
        />

        {/* 4. Cheerful volume */}
        <CheerfulEthVolume
          netVolume={ethVolumeInfo.netVolume}
          totalSupply={ethVolumeInfo.totalSupply}
          pricePerMint={ethVolumeInfo.pricePerMint}
        />

        {/* 5. Supporters */}
        <SupportersSection
          contractAddress={formattedContractAddress}
          totalSupply={totalSupply}
        />

        {/* Withdraw Section (only for contract owner) */}
        {isContractOwner && (
          <WithdrawSection
            contractAddress={formattedContractAddress}
            isContractOwner={isContractOwner}
          />
        )}
      </Box>

      {/* Desktop Layout */}
      <Flex gap={6} flexDirection='row' display={{ base: 'none', md: 'flex' }}>
        {/* Left Section: Media and Withdraw */}
        <Box
          flex='1'
          display={'flex'}
          flexDirection='column'
          gap={6}
          minW='60%'
        >
          <MediaSection
            metadata={metadata}
            loading={loading}
            error={error}
            ethVolumeInfo={ethVolumeInfo}
            noTokensYet={totalSupply !== null && Number(totalSupply) === 0}
          />

          <CheerfulEthVolume
            netVolume={ethVolumeInfo.netVolume}
            totalSupply={ethVolumeInfo.totalSupply}
            pricePerMint={ethVolumeInfo.pricePerMint}
          />

          {/* Supporters section */}
          <SupportersSection
            contractAddress={formattedContractAddress}
            totalSupply={totalSupply}
          />

          {/* Withdraw Section (only for contract owner) */}
          {isContractOwner && (
            <WithdrawSection
              contractAddress={formattedContractAddress}
              isContractOwner={isContractOwner}
            />
          )}
        </Box>

        {/* Right Section: Details and Actions */}
        <Box flex='1' display={'flex'} flexDirection='column' gap={6}>
          {/* Token details (name, description) */}
          <TokenDetailsSection
            metadata={metadata}
            contractAddress={formattedContractAddress}
            totalSupply={totalSupply}
          />

          {/* Mint section */}
          <MintSection
            address={address}
            contractAddress={formattedContractAddress}
            salesConfig={salesConfig}
            zoraFeeData={zoraFeeData}
            mintQuantity={mintQuantity}
            setMintQuantity={setMintQuantity}
          />
        </Box>
      </Flex>
    </Container>
  );
}
