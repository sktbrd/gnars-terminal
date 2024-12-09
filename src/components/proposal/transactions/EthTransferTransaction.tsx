import { FormattedAddress } from '@/components/utils/ethereum';
import { Box, Text, Heading, VStack } from '@chakra-ui/react';
import { formatEther } from 'viem';

interface EthTransferTransactionProps {
    toAddress: `0x${string}`;
    value: BigInt | { hex: string } | undefined; // Support BigInt and hex
}

const EthTransferTransaction: React.FC<EthTransferTransactionProps> = ({ toAddress, value }) => {
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
        <Box
            borderWidth="1px"
            borderRadius="md"
            shadow="sm"
            p={4}
            _dark={{ bg: 'gray.800', borderColor: 'yellow.500' }}
        >
            <Heading size="sm" mb={4}>
                Ethereum Transfer
            </Heading>
            <VStack gap={2} align="start">
                <Text>
                    <strong>Value:</strong> {formattedValue} ETH
                </Text>
                <Text display="flex" alignItems="center">
                    <strong>To:</strong>
                    <FormattedAddress address={toAddress} />
                </Text>
            </VStack>
        </Box>
    );
};

export default EthTransferTransaction;
