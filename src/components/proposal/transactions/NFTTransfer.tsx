import { FormattedAddress } from '@/components/utils/ethereum';
import { Text, HStack, Code, Image } from '@chakra-ui/react';
import TransactionWrapper from './TransactionWrapper';

export default function NftTransferTransaction({
  calldata,
  index,
}: {
  calldata: string;
  index: number;
}) {
  const decodedData = decodeTransferFromCalldata(calldata);

  return (
    <TransactionWrapper
      index={index}
      title='NFT Transfer'
      logoSrc='/images/gnars.webp'
      logoAlt='NFT'
    >
      <HStack gap={2} align='center'>
        <Text>
          This transaction sends an existing token with ID
        </Text>
        <Code size={'sm'} variant={'surface'}>
          {decodedData.tokenId}
          <Image ml={2} src='/images/gnars.webp' alt='NFT' boxSize='20px' objectFit='contain' />
        </Code>
        <Text>from Gnars Treasury to</Text>
        <FormattedAddress address={decodedData.to} />
      </HStack>
    </TransactionWrapper>
  );
}

function decodeTransferFromCalldata(calldata: string) {
  // Remove function selector (first 10 characters)
  const data = calldata.slice(10);

  // Decode the parameters
  const from = `0x${data.slice(24, 64)}`;
  const to = `0x${data.slice(88, 128)}`;
  const tokenId = BigInt(`0x${data.slice(128)}`).toString();

  return { from, to, tokenId };
}
