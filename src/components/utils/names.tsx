'use client';

import { Code, CodeProps, HStack, StackProps } from '@chakra-ui/react';
import { RefAttributes } from 'react';
import { Address } from 'viem';
import { useProfile, Name } from "@paperclip-labs/whisk-sdk/identity";
import Link from 'next/link';
export function FormattedAddress({
  address,
  textBefore,
  codeProps,
  stackProps,
}: {
  address?: Address | string;
  textBefore?: string;
  codeProps?: CodeProps & RefAttributes<HTMLElement>;
  stackProps?: StackProps & RefAttributes<HTMLDivElement>;
}) {
  if (!address) return null;

  const { data: profile, isLoading } = useProfile({ address: address as Address });

  const AddressContent = () => {
    if (!profile?.farcaster?.name) {
      return (
        <Code size='sm' variant='surface' {...codeProps}>
          <Link href={`/${address}`} target="_blank" rel="noopener noreferrer">
            <Name address={address as Address} />
          </Link>
        </Code>
      );
    }

    return (
      <Code size='sm' variant='surface' {...codeProps}>
        <Link href={`https://nounspace.com/s/${profile.farcaster.name}`} target="_blank" rel="noopener noreferrer">
          <Name address={address as Address} />
        </Link>
      </Code>
    );
  };

  return (
    <HStack {...stackProps}>
      {textBefore && <span>{textBefore}</span>}
      <AddressContent />
    </HStack>
  );
}

export default FormattedAddress;