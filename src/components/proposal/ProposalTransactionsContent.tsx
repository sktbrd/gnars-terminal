import { Proposal } from '@/app/services/proposal';
import { Box, VStack, Heading, Text } from '@chakra-ui/react';
import EthTransferTransaction from './transactions/EthTransferTransaction';

interface ProposalTransactionsContentProps {
    proposal: Proposal;
}

function TransactionItem({
    index,
    target,
    value,
    calldata,
}: {
    index: number;
    target: string;
    value: BigInt;
    calldata: string;
}) {
    // Normalize calldata to ensure it is consistent
    const normalizedCalldata = calldata === '0' ? '0x' : calldata;

    if (normalizedCalldata === '0x') {
        // ETH Transfer transaction
        return <EthTransferTransaction toAddress={target as `0x${string}`} value={value} />;
    }

    // Render generic transaction details for other types
    let transactionType = 'Generic Transfer';
    if (target === process.env.USDC_ADDRESS) {
        transactionType = 'USDC Transaction';
    } else if (target === '0x880fb3cf5c6cc2d7dfc13a993e839a9411200c17') {
        transactionType = 'Mint Batch';
    } else if (target === '0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c') {
        transactionType = 'Droposal';
    }

    console.log('TransactionItem:', { index, target, value, calldata: normalizedCalldata }, transactionType);
    return (
        <Box p={4}>
            <Heading size="sm" mb={2}>
                Transaction {index + 1}: {transactionType}
            </Heading>
            <Text>
                <strong>Target:</strong> {target}
            </Text>
            <Text>
                <strong>Value:</strong> {value.toString()} wei
            </Text>
            <Text>
                <strong>Calldata:</strong> {normalizedCalldata}
            </Text>
        </Box>
    );
}

export default function ProposalTransactionsContent({ proposal }: ProposalTransactionsContentProps) {
    const { targets, values, calldatas } = proposal;

    if (!targets || !values || !calldatas || targets.length === 0) {
        return (
            <Box
                shadow="sm"
                maxW="100%"
                minW="100%"
                p={4}
                rounded="md"
                _dark={{ borderColor: 'yellow', borderWidth: 1 }}
            >
                <Text>No transactions available for this proposal.</Text>
            </Box>
        );
    }

    return (
        <Box
            shadow="sm"
            maxW="100%"
            minW="100%"
            p={4}
            rounded="md"
            _dark={{ borderColor: 'yellow', borderWidth: 1 }}
            divideY="2px"
            divideColor="gray.300"
        >
            <Heading size="md" mb={4}>
                Transactions
            </Heading>
            {targets.map((target, index) => (
                <TransactionItem
                    key={index}
                    index={index}
                    target={target}
                    value={BigInt(values[index])}
                    calldata={calldatas[index]}
                />
            ))}
        </Box>
    );
}
