import { Box, Text, HStack } from '@chakra-ui/react';
import { FormattedAddress } from '@/components/utils/names';
import TransactionWrapper from './TransactionWrapper';

interface USDCTransactionProps {
  index: number;
  to: string;
  value: string;
}

const USDCTransaction: React.FC<USDCTransactionProps> = ({ index, to, value }) => {
  return (
    <TransactionWrapper index={index} title="USDC Transfer" logoSrc="/images/usdc.png" logoAlt="USDC Logo">
      <HStack justify="space-between" w="full">
        <Text>Recipient:</Text>
        {/* Wrap in Box instead of having inside Text/paragraph */}
        <Box>
          <FormattedAddress address={to} />
        </Box>
      </HStack>
      <HStack justify="space-between" w="full">
        <Text>Amount:</Text>
        <Text fontWeight="bold">{value} USDC</Text>
      </HStack>
    </TransactionWrapper>
  );
};

export default USDCTransaction;
