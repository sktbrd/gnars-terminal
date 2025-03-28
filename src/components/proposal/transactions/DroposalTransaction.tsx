import { VStack, Text, HStack, Code } from '@chakra-ui/react';
import { Address, decodeFunctionData } from 'viem';
import droposalABI from './utils/droposalABI';
import { FormattedAddress } from '@/components/utils/names';
import TransactionWrapper from './TransactionWrapper';
import CustomVideoPlayer from '@/components/droposals/CustomVideoPlayer';
import { useMemo } from 'react';
interface DroposalTransactionProps {
  calldata: `0x${string}`;
  index: number;
  descriptionHash?: string;
  blockNumber?: number;
}

export default function DroposalTransaction({
  calldata,
  index,
  descriptionHash,
  blockNumber,
}: DroposalTransactionProps) {
  const formatURI = (uri: string): string => {
    uri = uri.trim();
    if (uri.startsWith('ipfs://')) {
      return `https://gateway.pinata.cloud/ipfs/${uri.slice(7)}`;
    }
    return uri;
  };

  const decodedData = useMemo(() => {
    try {
      const { args } = decodeFunctionData({
        abi: droposalABI,
        data: calldata,
      });

      const [
        name,
        symbol,
        editionSize,
        royaltyBPS,
        fundsRecipient,
        defaultAdmin,
        descriptionHash,
        description,
        animationURI,
        imageURI,
      ] = args as [
        string,
        string,
        bigint,
        number,
        Address,
        Address,
        unknown,
        string,
        string,
        string,
      ];

      return {
        name,
        symbol,
        editionSize: editionSize.toString(),
        royaltyBPS: (royaltyBPS / 100).toFixed(2),
        fundsRecipient,
        defaultAdmin,
        description,
        imageURI: formatURI(imageURI),
        animationURI: formatURI(animationURI),
      };
    } catch (error) {
      console.error('Error decoding calldata for DroposalTransaction:', error);
      console.error('Calldata:', calldata);
      return null;
    }
  }, [calldata]);

  const memoizedDescriptionHash = useMemo(() => descriptionHash, [descriptionHash]);

  if (!decodedData) {
    return (
      <TransactionWrapper index={index} title='Droposal Transaction'>
        <Text color='red.500'>
          Failed to decode transaction data. Unsupported signature.
        </Text>
        <Text fontSize='sm' mt={2}>
          <strong>Raw Calldata:</strong> {calldata}
        </Text>
      </TransactionWrapper>
    );
  }

  return (
    <TransactionWrapper
      index={index}
      title='Droposal Transaction'
      logoSrc='/images/Zorb.png'
      logoAlt='Droposal'
    >
      <VStack align='start' gap={3}>
        <HStack gap={2} align='center'>
          <Text>
            This transaction creates a new token with the name in behalf of Gnars Dao
          </Text>
          <Code size={'sm'} variant={'surface'}>
            {decodedData.name} ({decodedData.symbol})
          </Code>
        </HStack>
        {decodedData.animationURI ? (
          <CustomVideoPlayer
            src={decodedData.animationURI}
            isVideo
            desxcriptionHash={memoizedDescriptionHash}
            blockNumber={blockNumber}
          />
        ) : (
          'N/A'
        )}
        {decodedData.imageURI ? (
          <img
            src={decodedData.imageURI}
            alt='Droposal Image'
            style={{ maxWidth: '100%' }}
          />
        ) : (
          'N/A'
        )}

        <HStack gap={2} align='center'>
          <Text>
            Royalty:
          </Text>
          <Code size={'sm'} variant={'surface'}>
            {decodedData.royaltyBPS}%
          </Code>
        </HStack>
        <HStack gap={2} align='center'>
          <Text>
            Funds Recipient:
          </Text>
          <FormattedAddress address={decodedData.fundsRecipient} />
        </HStack>
        <HStack gap={2} align='center'>
          <Text>
            Default Admin:
          </Text>
          <FormattedAddress address={decodedData.defaultAdmin} />
        </HStack>
        <HStack gap={2} align='center'>
          <Text>
            Description:
          </Text>
          <Code size={'sm'} variant={'surface'}>
            {decodedData.description || 'N/A'}
          </Code>
        </HStack>

      </VStack>
    </TransactionWrapper>
  );
}
