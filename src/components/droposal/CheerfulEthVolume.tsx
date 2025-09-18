import React from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { FaEthereum } from 'react-icons/fa';

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
        _dark={{ borderColor: 'yellow.400' }}
        textAlign='center'
      >
        <HStack gap={2} justifyContent="center">
          <FaEthereum size={24} color="#FFD700" />
          <Text fontWeight={700} fontSize={['lg', '2xl']}>
            This droposal has generated{' '}
            <Text as='span' color='yellow.400' display='inline'>
              {netVolume} ETH
            </Text>{' '}
            so far!
          </Text>
        </HStack>
        <Text fontSize='sm' fontWeight={400}>
          ( {totalSupply?.toString()} mints × {pricePerMint ?? '?'} ETH per mint, minus
          Zora fees)
        </Text>
      </Box>
    );
  }
);
