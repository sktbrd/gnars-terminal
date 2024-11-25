'use client';

import { formatEthAddress } from '@/utils/helpers';
import { Link as ChakraLink, Code, HStack, Image } from '@chakra-ui/react';
import { default as NextImage } from 'next/image';
import NextLink from 'next/link';
import { Address } from 'viem';
import { mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';
import { useEnsAvatar, useEnsName } from 'wagmi';

export function FormattedAddress({
  address,
  textBefore,
  asLink: useLink = true,
}: {
  address?: Address;
  textBefore?: string;
  asLink?: boolean;
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

  const AddressContent = () => (
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
  );

  return (
    <HStack gap={1} w={'fit'}>
      {textBefore ? <span>{textBefore}</span> : null}
      {useLink ? (
        <ChakraLink asChild>
          <NextLink href={`https://nouns.build/profile/${address}`}>
            <AddressContent />
          </NextLink>
        </ChakraLink>
      ) : (
        <AddressContent />
      )}
    </HStack>
  );
}
