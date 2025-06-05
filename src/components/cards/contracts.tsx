"use client";
import React from 'react';
import { DAO_ADDRESSES } from '@/utils/constants';
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  Container,
} from '@chakra-ui/react';
import { LuCopy, LuExternalLink } from 'react-icons/lu';

interface ContractDisplayProps {
  name: string;
  address: string;
}

const ContractDisplay: React.FC<ContractDisplayProps> = ({ name, address }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(address);
  };

  const explorerUrl = `https://basescan.org/address/${address}`;

  return (
    <Box 
      w="full" 
      p={4} 
      borderWidth="1px" 
      borderRadius="md" 
      bg="gray.100"
      _dark={{ bg: "gray.700" }}
      _hover={{ 
        bg: "gray.200", 
        _dark: { bg: "gray.600" } 
      }}
      transition="all 0.2s ease"
      position="relative"
    >
      <Stack direction="column" gap={2} align="flex-start">
        <Heading size="md">{name}</Heading>
        <Stack 
          direction={{base: "column", sm: "row"}} 
          w="full" 
          justify="space-between" 
          align={{base: "flex-start", sm: "center"}}
          gap={2}
        >
          <Text 
            fontFamily="mono" 
            fontSize="sm" 
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {address}
          </Text>
          <Stack 
            direction="row" 
            gap={2} 
            flexShrink={0}
            ml={{base: 0, sm: "auto"}}
          >
            <Button
              onClick={copyToClipboard}
              size="sm" 
              variant="ghost"
              title="Copy address"
              colorScheme="yellow"
              borderRadius="md"
            >
              <LuCopy />
            </Button>
            <Button
              onClick={() => window.open(explorerUrl, '_blank', 'noopener,noreferrer')}
              size="sm" 
              variant="ghost"
              title="View on BaseScan"
              colorScheme="yellow"
              borderRadius="md"
            >
              <LuExternalLink />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};

const ContractsCard: React.FC = () => {
  return (
    <Box
      shadow={'sm'}
      w={'full'}
      padding={4}
      rounded={'md'}
      _dark={{ borderColor: 'primary', borderWidth: 1 }}
      display={'flex'}
      flexDirection={'column'}
      gap={4}
    >
      <Stack direction="column" gap={4} align="flex-start" w="full">
        <Heading as="h2" size="2xl">Smart Contracts</Heading>
        <Text>
          DAO contracts deployed on Base network. Updates to these smart contracts
          can be completed by submitting a proposal to the DAO, and requires a successful vote to execute.
        </Text>
        
        <Stack direction="column" w="full" gap={4}>
          <ContractDisplay name="NFT" address={DAO_ADDRESSES.token} />
          <ContractDisplay name="Auction House" address={DAO_ADDRESSES.auction} />
          <ContractDisplay name="Governor" address={DAO_ADDRESSES.governor} />
          <ContractDisplay name="Treasury" address={DAO_ADDRESSES.treasury} />
          <ContractDisplay name="Metadata" address={DAO_ADDRESSES.metadata} />
        </Stack>
      </Stack>
    </Box>
  );
};

export default ContractsCard;
