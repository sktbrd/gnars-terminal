import { HStack, Text, Image, Code } from '@chakra-ui/react';
import { FormattedAddress } from '@/components/utils/ethereum';
import TransactionWrapper from './TransactionWrapper';

interface USDCTransactionProps {
  index: number;
  to: string;
  value: string;
}

const USDCTransaction: React.FC<USDCTransactionProps> = ({
  index,
  to,
  value,
}) => {
  return (
    <TransactionWrapper
      index={index}
      title='USDC Transfer'
      logoSrc='/images/usdc.png'
      logoAlt='USDC'
    >
      <Text>
        This transaction sends{' '}
        <Code size={'sm'} variant={'surface'}>
          {value}
          <Image
            src='/images/usdc.png'
            alt='USDC'
            boxSize='20px'
            objectFit='contain'
            ml={2}
          />
        </Code>{' '}
        tokens from Gnars Treasury to{' '}
        <FormattedAddress address={to} stackProps={{ display: 'inline' }} />
      </Text>
    </TransactionWrapper>
  );
};

export default USDCTransaction;
