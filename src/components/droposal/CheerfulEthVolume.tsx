import React from 'react';
import { Box, Text } from '@chakra-ui/react';

interface CheerfulEthVolumeProps {
  netVolume: string | null;
  totalSupply: bigint | null;
  pricePerMint: number | null;
}

export const CheerfulEthVolume: React.FC<CheerfulEthVolumeProps> = React.memo(
  function CheerfulEthVolume({ netVolume, totalSupply, pricePerMint }) {
    if (netVolume === null) return null;
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
        textAlign='center'
      >
        <Text fontWeight={700} fontSize={['lg', '2xl']}>
          🎉 This droposal has generated{' '}
          <Text as='span' color='yellow.400' display='inline'>
            {netVolume} ETH
          </Text>{' '}
          so far!
        </Text>
        <Text fontSize='sm' fontWeight={400}>
          ( {totalSupply?.toString()} mints × {pricePerMint ?? '?'} ETH per mint, minus
          Zora fees)
        </Text>
      </Box>
    );
  }
);
