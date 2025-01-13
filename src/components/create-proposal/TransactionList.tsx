import React, { useState } from "react";
import { VStack, Box, Text, Button, HStack, Flex, Image } from "@chakra-ui/react";
import { LuChevronDown, LuChevronUp } from "react-icons/lu";
import { transactionOptions } from "./TransactionTypes";
import { FaCheck, FaCopy, FaSkull } from "react-icons/fa";
import { governorAddress } from "@/hooks/wagmiGenerated";
import { toaster } from "@/components/ui/toaster";
import { Address } from "viem";
import { FormattedAddress } from "../utils/ethereum";

type TransactionDetails = Record<string, string | number | React.ReactNode>;

type TransactionListProps = {
    transactions: { type: string; details: TransactionDetails }[];
    onDelete: (index: number) => void;
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete }) => {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [simulationResults, setSimulationResults] = useState<("success" | "fail" | "pending" | null)[]>(transactions.map(() => null));

    const toggleExpand = (index: number) => {
        setExpandedIndex(expandedIndex === index ? null : index);
    };

    const getTransactionImage = (type: string) => {
        const transaction = transactionOptions.find(option => option.name === type);
        return transaction ? transaction.image : "";
    };

    const handleSimulate = async (index: number, type: string, details: TransactionDetails) => {
        console.log("Simulating transaction:", type, details);
        const simulationToast = toaster.create({
            description: "Simulating transaction...",
            type: "loading",
        });

        setSimulationResults(prev => {
            const newResults = [...prev];
            newResults[index] = "pending";
            return newResults;
        });

        try {
            const requestBody: any = { type, details };

            const response = await fetch('/api/simulate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, details: ${JSON.stringify(errorDetails)}`);
            }
            const result = await response.json();
            setSimulationResults(prev => {
                const newResults = [...prev];
                newResults[index] = result.success ? "success" : "fail";
                return newResults;
            });
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
            setSimulationResults(prev => {
                const newResults = [...prev];
                newResults[index] = "fail";
                return newResults;
            });

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
                                        {Object.entries(tx.details).map(([key, value]) => {
                                            if (key !== "contractAbi" && key !== "calldata") {
                                                return (
                                                    <HStack key={key} gap={2}>
                                                        <Text fontWeight="medium">{key}:</Text>

                                                        {["toAddress", "fromAddress"].includes(key) ? (
                                                            <FormattedAddress address={value as string} />
                                                        ) : (
                                                            <Text>{String(value)}</Text>
                                                        )}
                                                    </HStack>
                                                );
                                            }
                                            return null;
                                        })}
                                        {tx.details.calldata && (
                                            <HStack key="calldata" gap={2}>
                                                <Box as="pre" whiteSpace="pre-wrap" wordBreak="break-all" backgroundColor={"darkgrey"} p={2} borderRadius="md" display="flex" alignItems="center">
                                                    <code>{String(tx.details.calldata)}</code>
                                                    <Button
                                                        size="xs"
                                                        ml={2}
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(String(tx.details.calldata));
                                                            toaster.create({
                                                                title: "Copied",
                                                                description: "Calldata copied to clipboard.",
                                                                type: "success",
                                                            });
                                                        }}
                                                        variant="ghost"
                                                        _hover={{ background: "transparent" }}
                                                    >
                                                        <FaCopy />
                                                    </Button>
                                                </Box>
                                            </HStack>
                                        )}
                                    </VStack>
                                </HStack>
                                <Flex justify="space-between" mt={2}>
                                    <Button size="sm" onClick={() => onDelete(idx)}>
                                        Delete
                                    </Button>
                                    <Button
                                        colorScheme="blue"
                                        size="sm"
                                        onClick={() => handleSimulate(idx, tx.type, tx.details)}
                                        bg={
                                            simulationResults[idx] === "success"
                                                ? "green.200"
                                                : simulationResults[idx] === "fail"
                                                    ? "red.200"
                                                    : ""
                                        }
                                    >
                                        {simulationResults[idx] === "success" ? <><FaCheck /> Success</> : simulationResults[idx] === "fail" ? <><FaSkull /> Fail</> : "Simulate"}
                                    </Button>
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
