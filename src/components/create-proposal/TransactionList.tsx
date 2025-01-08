import React, { useState } from "react";
import { VStack, Box, Text, Button, HStack, Flex, Image } from "@chakra-ui/react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { transactionOptions } from "./TransactionTypes";
import { FaCheck, FaSpinner } from "react-icons/fa";
import { governorAddress } from "@/hooks/wagmiGenerated";
import { toaster } from "@/components/ui/toaster";

type TransactionDetails = Record<string, string | number | React.ReactNode>;

type TransactionListProps = {
    transactions: { type: string; details: TransactionDetails }[];
    onDelete: (index: number) => void;
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [simulationResult, setSimulationResult] = useState<"success" | "fail" | null>(null);

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const getTransactionImage = (type: string) => {
        const transaction = transactionOptions.find(option => option.name === type);
        return transaction ? transaction.image : "";
    };

    const handleSimulate = async (type: string, details: TransactionDetails) => {
        console.log("Simulating transaction:", type, details);
        const simulationToast = toaster.create({
            description: "Simulating transaction...",
            type: "loading",
        });
        try {
            const fromAddress = governorAddress;
            const response = await fetch('/api/simulate', { // Corrected path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, details: { ...details, fromAddress } }),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
            }
            const result = await response.json();
            setSimulationResult(result.success ? "success" : "fail");
            console.log("Simulation response:", result);

            toaster.dismiss(simulationToast);
            toaster.create({
                title: result.success ? "Success" : "Failure",
                description: (
                    <span>
                        {result.message}
                        {result.simulationUrl && (
                            <>
                                {" "}
                                <a href={result.simulationUrl} target="_blank" rel="noopener noreferrer">
                                    View Simulation
                                </a>
                            </>
                        )}
                    </span>
                ),
                type: result.success ? "success" : "error",
            });
        } catch (error) {
            console.error("Simulation error:", error);
            setSimulationResult("fail");

            toaster.dismiss(simulationToast);
            toaster.create({
                title: "Error",
                description: `Failed to simulate transaction. ${(error as Error).message}`,
                type: "error",
            });
        }
    };

    return (
        <VStack gap={4} align="stretch" p={4}>
            {transactions.length === 0 ? (
                <Text>No transactions added yet.</Text>
            ) : (
                transactions.map((tx, idx) => (
                    <Box
                        key={idx}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        bg="white"
                        _dark={{ bg: "gray.800" }}
                        boxShadow="md"
                        transition="all 0.2s"
                        _hover={{ transform: "scale(1.02)" }}
                    >
                        <HStack justify="space-between" align="center">
                            <HStack>
                                <Image
                                    src={getTransactionImage(tx.type)}
                                    alt={tx.type}
                                    boxSize="20px"
                                    objectFit="cover"
                                />
                                <Text fontWeight="bold" onClick={() => toggleExpand(idx)} cursor="pointer">
                                    {tx.type}
                                </Text>
                            </HStack>
                            {expandedIndex === idx ? (
                                <LuChevronUp onClick={() => toggleExpand(idx)} cursor="pointer" />
                            ) : (
                                <LuChevronDown onClick={() => toggleExpand(idx)} cursor="pointer" />
                            )}
                        </HStack>
                        {expandedIndex === idx && (
                            <Box mt={2}>
                                <HStack align="start" gap={4}>
                                    <Box
                                        borderLeft="2px solid"
                                        borderColor="gray.200"
                                        _dark={{ borderColor: "gray.600" }}
                                        height="100%"
                                        mr={4}
                                    />
                                    <VStack align="start" gap={1}>
                                        {Object.entries(tx.details).map(([key, value]) => (
                                            <HStack key={key} gap={2}>
                                                <Text fontWeight="medium">{key}:</Text>
                                                <Text>{String(value)}</Text>
                                            </HStack>
                                        ))}
                                    </VStack>
                                </HStack>
                                <Flex justify="space-between" mt={2}>
                                    <Button colorScheme="red" size="sm" onClick={() => onDelete(idx)}>
                                        Delete
                                    </Button>
                                    <Button colorScheme="blue" size="sm" onClick={() => handleSimulate(tx.type, tx.details)}>
                                        Simulate
                                    </Button>
                                    {simulationResult === "success" && <FaCheck color="green" />}
                                    {simulationResult === "fail" && <FaSpinner color="red" />}
                                </Flex>
                            </Box>
                        )}
                    </Box>
                ))
            )}
        </VStack>
    );
};

export default TransactionList;
