import { Box, Heading, Text } from '@chakra-ui/react';
import { TokenMetadata } from './types';
import Link from 'next/link';

interface TokenDetailsSectionProps {
  metadata: TokenMetadata | null;
  contractAddress: string;
  totalSupply: bigint | null;
}

export const TokenDetailsSection: React.FC<TokenDetailsSectionProps> = ({
  metadata,
  contractAddress,
  totalSupply,
}) => {
  return (
    <Box
      borderWidth={1}
      display={'flex'}
      flexDir={'column'}
      alignItems='stretch'
      gap={3}
      rounded={'lg'}
      p={6}
      _dark={{ borderColor: 'yellow' }}
    >
      <Box>
        <Heading
          size='4xl'
          mb={4}
          display='inline-block'
          borderBottomWidth={2}
          borderColor='colorPalette.400'
        >
          {metadata?.name || 'Unknown Token'}
        </Heading>
        <Text mb={4}>
          {metadata?.description || 'No description available.'}
        </Text>
      </Box>

      <Box mt={2}>
        <Text>
          <Text mr={2} display={'inline-block'} fontWeight={'bold'}>
            Contract Address:
          </Text>
          <Link
            prefetch={false}
            href={`https://basescan.org/address/${contractAddress}`}
            target='_blank'
            rel='noopener noreferrer'
            style={{ textDecoration: 'underline', color: '#3182ce' }}
          >
            {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </Link>
        </Text>
        <Text>
          <Text mr={2} display={'inline-block'} fontWeight={'bold'}>
            Total Supply:
          </Text>
          {totalSupply ? totalSupply.toString() : 'Loading...'}
        </Text>
      </Box>
    </Box>
  );
};
