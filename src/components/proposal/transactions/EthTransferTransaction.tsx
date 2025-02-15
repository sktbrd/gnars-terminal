import { FormattedAddress } from '@/components/utils/names';
import { Text, VStack, Code, HStack, Image } from '@chakra-ui/react';
import { Address, formatEther } from 'viem';
import TransactionWrapper from './TransactionWrapper';

interface EthTransferTransactionProps {
  toAddress: Address;
  value: BigInt | { hex: string } | undefined;
}

const EthTransferTransaction: React.FC<EthTransferTransactionProps> = ({
  toAddress,
  value,
}) => {
  let bigIntValue: bigint;

  try {
    if (value === undefined) {
      throw new Error('Value is undefined');
    }
    // Parse the `value` to BigInt
    if (typeof value === 'bigint') {
      bigIntValue = value;
    } else if (typeof value === 'object' && 'hex' in value) {
      bigIntValue = BigInt(value.hex);
    } else {
      throw new Error('Value is not a valid BigInt or hex object');
    }
  } catch (error) {
    console.error('Error parsing value:', error);
    bigIntValue = 0n; // Default to 0 on error
  }

  // Format the value to Ether
  const formattedValue = formatEther(bigIntValue);

  return (
    <TransactionWrapper
      index={0}
      title='ETH Transfer'
      logoSrc='/images/ethereum.png'
      logoAlt='ETH'
    >
      <Text>
        This transaction sends{' '}
        <Code size={'sm'} variant={'surface'}>
          {formattedValue}
          <Image
            src='/images/ethereum.png'
            alt='ETH'
            boxSize='20px'
            objectFit='contain'
            ml={2}
          />
        </Code>{' '}
        ETH from Gnars Treasury to{' '}
        <FormattedAddress
          address={toAddress}
          stackProps={{ display: 'inline' }}
        />
      </Text>
    </TransactionWrapper>
  );
};

export default EthTransferTransaction;
