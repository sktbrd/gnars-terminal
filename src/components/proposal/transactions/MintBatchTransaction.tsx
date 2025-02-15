import { FormattedAddress } from '@/components/utils/names';
import { Box, Text, Image, VStack, Code, HStack } from '@chakra-ui/react';
import { default as NextImage } from 'next/image';
import Link from 'next/link';
import { Address, decodeFunctionData } from 'viem';
import TransactionWrapper from './TransactionWrapper';

// Define the ABI for the mintBatchTo function
const MINT_BATCH_TO_ABI = [
  {
    type: 'function',
    name: 'mintBatchTo',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    outputs: [{ name: 'tokenIds', type: 'uint256[]' }],
  },
];

interface MintBatchTransactionProps {
  calldata: `0x${string}`; // Properly typed calldata
  index: number;
}

export default function MintBatchTransaction({
  calldata,
  index,
}: MintBatchTransactionProps) {
  let amount: string | undefined;
  let recipient: Address | undefined;

  try {
    // Decode calldata using viem's decodeFunctionData
    const decodedData = decodeFunctionData({
      abi: MINT_BATCH_TO_ABI,
      data: calldata,
    });

    // Extract `amount` and `recipient` from args
    const [decodedAmount, decodedRecipient] = decodedData.args as [
      bigint,
      Address,
    ];

    amount = decodedAmount.toString();
    recipient = decodedRecipient;
  } catch (error) {
    console.error('Error decoding calldata:', error);
  }

  return (
    <TransactionWrapper
      index={index}
      title='Mint Batch'
      logoSrc='https://www.skatehive.app/loading.gif'
      logoAlt='Mint Batch'
    >
      <Box display='flex' alignItems='center' gap={4}>
        <Text>
          This transaction mints{' '}
          <Code size={'sm'} variant={'surface'}>
            {amount || 'N/A'}
            <Image
              src='https://www.skatehive.app/loading.gif'
              alt='Mint Batch'
              boxSize='20px'
              objectFit='contain'
              ml={2}
              mb={1}
            />
          </Code>{' '}
          new tokens to{' '}
          {recipient ? (
            <Link href={`/address/${recipient}`} passHref>
              <FormattedAddress
                address={recipient}
                stackProps={{ display: 'inline' }}
              />
            </Link>
          ) : (
            <span>Address not available</span>
          )}
        </Text>
      </Box>
    </TransactionWrapper>
  );
}
