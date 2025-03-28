import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
    DialogBody,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogRoot,
    DialogFooter,
    DialogCloseTrigger
} from "@/components/ui/dialog";
import { Box, Flex, Text, VStack, Input } from '@chakra-ui/react';
import 'reactflow/dist/style.css';
import { governorAddress } from '@/hooks/wagmiGenerated';
import { http, createPublicClient, Address, TransactionReceipt } from 'viem';
import { base } from 'viem/chains';

// Define proper types for better type safety
type Transaction = {
    hash: string;
    blockNumber: string;
    [key: string]: any;
};

type CollectModalProps = {
    isOpen: boolean;
    onClose: () => void;
    descriptionHash?: string;
    blockNumber?: number;
};

// Move the client outside the component to avoid recreating it on each render
const etherscanClient = createPublicClient({
    chain: base,
    transport: http(),
});

const CollectModal = ({
    isOpen,
    onClose,
    descriptionHash,
    blockNumber
}: CollectModalProps) => {
    const [numMints, setNumMints] = useState(1);

    const [matchedTransaction, setMatchedTransaction] = useState<Transaction | null>(null);
    const [matchedTransactionReceipt, setMatchedTransactionReceipt] = useState<TransactionReceipt | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tokenCreated, setTokenCreated] = useState<string | null>(null);

    // Fetch transaction data from the API
    const fetchGovernorTransactions = useCallback(async () => {
        if (!isOpen || !descriptionHash) return;

        setLoading(true);
        setError(null);
        try {
            const topic0 = '0x7b1bcf1ccf901a11589afff5504d59fd0a53780eed2a952adade0348985139e0';
            const response = await fetch(
                `/api/etherscan?contractAddress=${governorAddress}&blockNumber=${blockNumber}&topic0=${topic0}${descriptionHash ? `&descriptionHash=${descriptionHash}` : ''}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch governor transactions: ${response.status}`);
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (data.matchedTransaction) {
                setMatchedTransaction(data.matchedTransaction);
                // Fetch receipt immediately after finding the matched transaction
                await fetchTransactionReceipt(data.matchedTransaction.hash);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, [descriptionHash, blockNumber, isOpen]);

    // Separate function to fetch transaction receipt
    const fetchTransactionReceipt = useCallback(async (txHash: string) => {
        if (!txHash) return;

        try {
            const hash = txHash.startsWith('0x') ? txHash as Address : `0x${txHash}` as Address;

            const receipt = await etherscanClient.getTransactionReceipt({ hash });

            setMatchedTransactionReceipt(receipt);

            // Extract the created token address from the logs if available
            if (receipt.logs && receipt.logs.length > 0) {
                setTokenCreated(receipt.logs[0].address);
            }
        } catch (error) {
            console.error('Error fetching transaction receipt:', error);
            setError('Failed to fetch transaction receipt');
        }
    }, []);

    // Effect to fetch data when modal opens
    useEffect(() => {
        fetchGovernorTransactions();
    }, [fetchGovernorTransactions]);

    return (
        <DialogRoot open={isOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collect</DialogTitle>
                    <DialogCloseTrigger onClick={onClose} />
                </DialogHeader>
                <DialogBody>
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                        <VStack align="start" w={{ base: '100%', md: '50%' }}>
                            <Text mt={4}>Token Created: {tokenCreated || 'Waiting for data...'}</Text>
                            <Text mt={4}>
                                Number of Mints:
                                <Input
                                    type="number"
                                    value={numMints}
                                    onChange={(e) => setNumMints(Number(e.target.value))}
                                    min="1"
                                    style={{ marginLeft: '10px', width: '60px' }}
                                />
                            </Text>
                            {descriptionHash && (
                                <Text mt={4} fontSize="sm">Description Hash: {descriptionHash?.substring(0, 10)}...</Text>
                            )}
                        </VStack>
                    </Flex>
                    <Box mt={4} bg="bg" p={4} borderRadius="md">
                        {loading && <Text>Loading transaction data...</Text>}
                        {error && <Text color="red.500">Error: {error}</Text>}
                        {matchedTransaction && (
                            <Box p={3} borderRadius="md">
                                <Text fontWeight="bold">Matched Transaction</Text>
                                <Text>Hash: {matchedTransaction.hash.substring(0, 10)}...</Text>
                                <Text>Block: {matchedTransaction.blockNumber}</Text>
                                {matchedTransactionReceipt && (
                                    <>
                                        <Text>Gas Used: {matchedTransactionReceipt.gasUsed.toString()}</Text>
                                        <Text>Log Events: {matchedTransactionReceipt.logs.length}</Text>
                                    </>
                                )}
                            </Box>
                        )}
                    </Box>
                </DialogBody>
                <DialogFooter>
                    <Flex justify="flex-end" mt={4}>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button
                            variant="ghost"
                            disabled={!matchedTransaction}
                            aria-label="Confirm collection"
                        >
                            Confirm
                        </Button>
                    </Flex>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

export default CollectModal;
