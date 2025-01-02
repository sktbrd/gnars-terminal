'use client';

import { useNNSName } from '@/components/utils/hooks/useNNSName';
import { formatEthAddress } from '@/utils/helpers';
import { Box, Code } from '@chakra-ui/react';

export function FormattedAddress({
  address,
  textBefore,
  asLink = true,
  clds,
}: {
  address?: string;
  textBefore?: string;
  asLink?: boolean;
  clds?: string[]; // Optional: Specify CLDs to filter by
}) {
  if (!address) return null;
  const { data: nnsName, isLoading, isError } = useNNSName(address, clds);


  const AddressContent = () => (
    <Code size="sm" colorScheme={nnsName ? '' : 'gray'}>
      {isLoading
        ? formatEthAddress(address)
        : isError || !nnsName
          ? formatEthAddress(address)
          : nnsName}
    </Code>
  );

  return (
    <Box >
      {textBefore && <span>{textBefore}</span>}
      <AddressContent />
    </Box>
  );
}
