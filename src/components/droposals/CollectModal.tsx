import { useMemo, useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogRoot,
} from "@/components/ui/dialog";
import { Box, Flex, Text, VStack, Image, DialogFooter, Heading, Textarea, Input } from '@chakra-ui/react';

import 'reactflow/dist/style.css'; // Import the required CSS
import { governorAddress } from '@/hooks/wagmiGenerated';

const CollectModal = ({
    isOpen,
    onClose,
    descriptionHash,
}: {
    isOpen: boolean;
    onClose: () => void;
    descriptionHash?: string;
}) => {
    const [numMints, setNumMints] = useState(1); // Add state for number of mints
    const ZoraNFTreator = process.env.NEXT_PUBLIC_DROPOSAL_ADDRESS || '0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c';

    const [transactions, setTransactions] = useState<any[]>([]); // Ensure transactions is initialized as an empty array
    const [loading, setLoading] = useState(false); // State to handle loading
    const [error, setError] = useState<string | null>(null); // State to handle errors

    const fetchGovernorTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const topic0 = '0x7b1bcf1ccf901a11589afff5504d59fd0a53780eed2a952adade0348985139e0'; // Add topic0
            const response = await fetch(`/api/etherscan?contractAddress=${governorAddress}&blockNumber=21202741&topic0=${topic0}`);
            if (!response.ok) {
                throw new Error('Failed to fetch governor transactions');
            }
            const data = await response.json();
            // setTransactions(data.transactionDetails); // Update to use transactionDetails
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchGovernorTransactions();
        }
    }, []);

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose} size="sm" placement="center" motionPreset="slide-in-bottom">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collect</DialogTitle>
                    <DialogCloseTrigger />
                </DialogHeader>
                <DialogBody>
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                        <VStack align="start" w={{ base: '100%', md: '50%' }}>
                            <Text mt={4}>NFT Creator: {ZoraNFTreator}</Text> {/* Display NFT contract */}
                            <Text mt={4}>Token Created: </Text>
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
                        </VStack>
                    </Flex>
                    <Box mt={4}>

                    </Box>
                </DialogBody>
                <DialogFooter>
                    <Flex justify="flex-end" mt={4}>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="ghost">Confirm</Button>
                    </Flex>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

export default CollectModal;
