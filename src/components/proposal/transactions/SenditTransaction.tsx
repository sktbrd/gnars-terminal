import { FormattedAddress } from '@/components/utils/names';
import { Code, Image, Text } from '@chakra-ui/react';
import TransactionWrapper from './TransactionWrapper';

interface SenditTransactionProps {
  index: number;
  to: string;
  value: string;
}

const SenditTransaction: React.FC<SenditTransactionProps> = ({
  index,
  to,
  value,
}) => {
  return (
    <TransactionWrapper
      index={index}
      title='Sendit Token Transfer'
      logoSrc='https://sendit.city/assets/images/image03.jpg?v=389a8e2f'
      logoAlt='SENDIT'
    >
      <Text>
        This transaction sends{' '}
        <Code size={'sm'} variant={'surface'}>
          {value}
          <Image
            src='https://sendit.city/assets/images/image03.jpg?v=389a8e2f'
            alt='SENDIT'
            boxSize='20px'
            ml={2}
            borderRadius={100}
          />
        </Code>{' '}
        tokens from Gnars Treasury to{' '}
        <FormattedAddress address={to} stackProps={{ display: 'inline' }} />{' '}
      </Text>
    </TransactionWrapper>
  );
};

export default SenditTransaction;
