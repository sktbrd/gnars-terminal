'use client';

import { formatEthAddress } from '@/utils/helpers';
import { Badge, Code, HStack, Image } from '@chakra-ui/react';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { useEnsAvatar, useEnsName } from 'wagmi';
import { default as NextImage } from 'next/image';

export function FormattedAddress({
  address,
  textBefore,
}: {
  address?: Address;
  textBefore?: string;
}) {
  if (!address) return null;

  const { data: ensName } = useEnsName({
    address: address,
    chainId: mainnet.id,
  });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ? normalize(ensName) : undefined,
    chainId: mainnet.id,
  });

  return (
    <HStack gap={1} w={'fit'}>
      {textBefore ? <span>{textBefore}</span> : null}
      <Code
        size={'sm'}
        variant={'surface'}
        colorPalette={ensName ? '' : 'gray'}
        gap={1}
      >
        {ensAvatar ? (
          <Image asChild rounded={'full'} w={3}>
            <NextImage
              width={24}
              height={24}
              src={ensAvatar}
              alt={`ENS avatar for ${ensName}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Image>
        ) : null}
        {ensName ? ensName : formatEthAddress(address)}
      </Code>
    </HStack>
  );
}
