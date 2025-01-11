import { HStack, Text, Image, Code } from '@chakra-ui/react';
import { FormattedAddress } from '@/components/utils/ethereum';
import TransactionWrapper from './TransactionWrapper';

interface USDCTransactionProps {
  index: number;
  to: string;
  value: string;
}

const USDCTransaction: React.FC<USDCTransactionProps> = ({ index, to, value }) => {
  return (
    <TransactionWrapper
      index={index}
      title='USDC Transfer'
      logoSrc='/images/usdc.png'
      logoAlt='USDC'
    >
      <HStack gap={2} align='center'>
        <Text>
          This transaction sends
        </Text>
        <Code size={'sm'} variant={'surface'}>
          {value}
          <Image src='/images/usdc.png' alt='USDC' boxSize='20px' objectFit='contain' ml={2} />
        </Code>
        <Text>tokens from Gnars Treasury to</Text>
        <FormattedAddress address={to} />
      </HStack>
    </TransactionWrapper>
  );
};

export default USDCTransaction;
