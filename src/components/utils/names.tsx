'use client';

import { Code, CodeProps, HStack, StackProps } from '@chakra-ui/react';
import { RefAttributes, memo } from 'react';
import { Address } from 'viem';
import Link from 'next/link';
import { useENSData } from '@/hooks/useENSData';

interface FormattedAddressProps {
  address?: Address | string;
  textBefore?: string;
  codeProps?: CodeProps & RefAttributes<HTMLElement>;
  stackProps?: StackProps & RefAttributes<HTMLDivElement>;
}

export const FormattedAddress = memo<FormattedAddressProps>(
  function FormattedAddress({ address, textBefore, codeProps, stackProps }) {
    // Early return for no address
    if (!address) return null;

    const { displayName } = useENSData(address, {
      enabled: !!address,
    });

    const AddressContent = () => {
      // Special case for Gnars Treasure
      if (address === '0x72ad986ebac0246d2b3c565ab2a1ce3a14ce6f88') {
        return (
          <Code size='sm' variant='surface' {...codeProps}>
            <Link
              href={`https://gnars.com/treasure`}
              target='_blank'
              rel='noopener noreferrer'
            >
              Gnars Treasure
            </Link>
          </Code>
        );
      }

      return (
        <Code size='sm' variant='surface' {...codeProps}>
          <Link href={`/${address}`} target='_blank' rel='noopener noreferrer'>
            {displayName}
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
);

export default FormattedAddress;
