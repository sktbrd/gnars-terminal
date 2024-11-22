'use client';

import { formatEthAddress } from '@/utils/helpers';
import { Badge, HStack, Image } from '@chakra-ui/react';
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
      <Badge variant={'surface'} colorPalette={ensName ? '' : 'gray'}>
        {ensAvatar ? (
          <Image asChild rounded={'full'} w={3}>
            <NextImage
              width={240}
              height={240}
              src={ensAvatar}
              alt={`ENS avatar for ${ensName}`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Image>
        ) : null}
        {ensName ? ensName : formatEthAddress(address)}
      </Badge>
    </HStack>
  );
}
