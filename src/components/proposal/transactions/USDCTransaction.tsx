import { Box, Heading, Text } from '@chakra-ui/react';
import { FormattedAddress } from '@/components/utils/ethereum';

interface USDCTransactionProps {
    index: number;
    to: string;
    value: string;
}

const USDCTransaction: React.FC<USDCTransactionProps> = ({ index, to, value }) => {
    return (
        <Box p={4} borderWidth={1} rounded="md" shadow="sm" mb={4}>
            <Heading size="sm" mb={2}>
                Transaction {index + 1}: USDC Transfer
            </Heading>
            <Text display="flex" alignItems="center">
                <strong>To:</strong>
                <FormattedAddress address={to} />
            </Text>
            <Text>
                <strong>Value:</strong> {value} USDC
            </Text>
        </Box>
    );
};

export default USDCTransaction;
