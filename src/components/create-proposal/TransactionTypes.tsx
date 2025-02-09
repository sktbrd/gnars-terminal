import React from "react";
import { SimpleGrid, Box, Text, Image, VStack } from "@chakra-ui/react";

export const transactionOptions = [
    { name: "SEND ETH", image: "/images/ethereum.png" },
    { name: "SEND USDC", image: "/images/usdc.png" },
    { name: "SEND NFT", image: "/images/gnars.webp" },
    { name: "AIRDROP RANDOM GNAR", image: "/images/loading.gif" },
    { name: "DROPOSAL MINT", image: "/images/Zorb.png" },
    { name: "SEND IT", image: "/images/sendit.jpg" },
    { name: "CUSTOM TRANSACTION", image: "/images/brainhead.png" },
];

type TransactionTypesProps = {
    onSelect: (transactionType: string) => void;
};

const TransactionTypes: React.FC<TransactionTypesProps> = ({ onSelect }) => {
    return (
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap={6}>
            {transactionOptions.map((option) => {
                const isDisabled = option.name === "CUSTOM TRANSACTION";
                return (
                    <Box
                        key={option.name}
                        as="button"
                        onClick={() => !isDisabled && onSelect(option.name)}
                        _hover={{ boxShadow: !isDisabled ? "lg" : "none" }}
                        borderRadius="lg"
                        boxShadow="md"
                        p={4}
                        transition="all 0.2s ease-in-out"
                        opacity={isDisabled ? 0.5 : 1}
                        cursor={isDisabled ? "not-allowed" : "pointer"}
                    >
                        <VStack gap={3}>
                            <Image
                                src={option.image}
                                alt={option.name}
                                boxSize="60px"
                                objectFit="cover"
                            />
                            <Text fontSize="lg" fontWeight="bold" textAlign="center">
                                {option.name}
                            </Text>
                        </VStack>
                    </Box>
                );
            })}
        </SimpleGrid>
    );
};

export default TransactionTypes;
