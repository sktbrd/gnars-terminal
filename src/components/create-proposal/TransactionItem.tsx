"use client";

import React, { useEffect, useState } from "react";
import { VStack, Text, HStack, SimpleGrid, Button, Image, Badge } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@/components/ui/radio"
import TransactionForm from "./TransactionForm";
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/utils/constants";
import { Address, isAddress, parseEther, parseUnits } from 'viem';
import { LuChevronDown } from "react-icons/lu";
import { prepareTransactionData, formatTransactionDetails } from '@/utils/transactionUtils';
import useTreasure from "@/hooks/useTreasure";

type TransactionItemProps = {
    type: string;
    onAdd: (transaction: { type: string; details: Record<string, any> }) => void;
    onCancel: () => void;
};

const DROPOSAL_CONTRACT_ADDRESS = "0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c";

const TransactionItem: React.FC<TransactionItemProps> = ({ type, onAdd, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [editionType, setEditionType] = useState<string>("Fixed");
    const [simulationResult, setSimulationResult] = useState<"success" | "fail" | "pending" | null>(null);
    const [amount, setAmount] = useState<number>(0); // Add state for amount

    const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY as Address || '0x';
    const { tokens, usdcBalance, ethBalance, senditBalance, gnarsNftBalance, isLoading } = useTreasure(treasuryAddress);

    const getTokenDetails = (type: string) => {
        switch (type) {
            case "SEND ETH":
                return { tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", name: "ETH", decimals: 18, image: "/images/ethereum.png" };
            case "SEND USDC":
                return { tokenAddress: USDC_CONTRACT_ADDRESS, name: "USDC", decimals: 6, image: "/images/usdc.png" };
            case "SEND IT":
                return { tokenAddress: SENDIT_CONTRACT_ADDRESS, name: "SENDIT", decimals: 18, image: "/images/sendit.jpg" };
            default:
                return { tokenAddress: "", name: "", decimals: 18, image: "" };
        }
    };

    const { tokenAddress, name, decimals, image } = getTokenDetails(type);
    const UNLIMITED_EDITION_SIZE = "18446744073709551615";

    const fields = (() => {
        switch (type) {
            case "SEND ETH":
            case "SEND USDC":
            case "SEND IT":
            case "SEND NFT":
                return [
                    { name: type === "SEND NFT" ? "tokenId" : "amount", placeholder: type === "SEND NFT" ? "Enter tokenId" : "Enter amount", validate: (value: string) => !isNaN(Number(value)) || `Invalid ${type === "SEND NFT" ? "tokenId" : "amount"}.` },
                    { name: "toAddress", placeholder: "Enter destination address", validate: (value: string) => isAddress(value) || "Invalid Ethereum address." }
                ];
            case "AIRDROP RANDOM GNAR":
                return [
                    { name: "amount", placeholder: "Amount", validate: (value: string) => !isNaN(Number(value)) || "Invalid amount." },
                    { name: "toAddress", placeholder: "Address", validate: (value: string) => isAddress(value) || "Invalid Ethereum address." }
                ];
            case "DROPOSAL MINT":
                return [
                    { name: "name", placeholder: "Name", validate: (value: string) => value.trim() !== "" || "Name is required." },
                    { name: "symbol", placeholder: "Symbol", validate: (value: string) => value.trim() !== "" || "Symbol is required." },
                    { name: "description", placeholder: "Description", validate: (value: string) => value.trim() !== "" || "Description is required." },
                    { name: "animationURI", placeholder: "Animation URI", validate: (value: string) => true }, // Animation URI is optional
                    { name: "imageURI", placeholder: "Image URI", validate: (value: string) => value.trim() !== "" || "Image URI is required." },
                    { name: "price", placeholder: "Price (ETH)", validate: (value: string) => !isNaN(Number(value.trim())) || "Invalid price." },
                    ...(editionType === "Fixed" ? [{ name: "editionSize", placeholder: "Edition Size", type: "text", validate: (value: string) => !isNaN(Number(value.trim())) || "Invalid edition size." }] : []),
                    { name: "startTime", placeholder: "Start Time", type: "date", validate: (value: string) => !isNaN(Date.parse(value.trim())) || "Invalid start time." },
                    { name: "endTime", placeholder: "End Time", type: "date", validate: (value: string) => !isNaN(Date.parse(value.trim())) || "Invalid end time." },
                    { name: "mintLimit", placeholder: "Mint Limit Per Address", validate: (value: string) => !isNaN(Number(value.trim())) || "Invalid mint limit." },
                    { name: "royalty", placeholder: "Royalty (%)", validate: (value: string) => !isNaN(Number(value.trim())) || "Invalid royalty." },
                    { name: "payoutAddress", placeholder: "Payout Address", validate: (value: string) => isAddress(value.trim()) || "Invalid Ethereum address." },
                    { name: "adminAddress", placeholder: "Default Admin Address", validate: (value: string) => isAddress(value.trim()) || "Invalid Ethereum address." },
                ];
            case "CUSTOM TRANSACTION":
                return [
                    { name: "customData", placeholder: "Enter custom transaction data", validate: (value: string) => value.trim() !== "" || "Custom data is required." }
                ];
            default:
                return [];
        }
    })();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setFile(event.target.files[0]);
        }
    };

    const handleAdd = (transaction: { type: string; details: Record<string, any> }) => {
        const treasureAddress = process.env.NEXT_PUBLIC_TREASURY as Address || '0x';
        const formattedDetails = formatTransactionDetails(type, transaction.details);

        const { input, contractAbi, fromAddress, toAddress, value } = prepareTransactionData(type, formattedDetails, treasureAddress);
        const details = {
            ...transaction.details,
            calldata: input,
            contractAbi,
            fromAddress,
            toAddress,
            value,
        };

        onAdd({ type: `${transaction.type}`, details });
    };

    const usdcBalanceNumber = parseFloat(usdcBalance?.toString() || "0");
    const ethBalanceNumber = ethBalance; // Use the exact value for Ethereum balance
    const senditBalanceNumber = parseFloat(senditBalance?.toString() || "0");

    const calculatePercentageChange = (balance: number, amount: number) => {
        if (balance === 0) return 0; // Avoid division by zero
        return (amount / balance) * 100; // Calculate the percentage decrease
    };

    useEffect(() => {
        console.log("amount:", amount, typeof amount); // Debug log
        console.log("usdcBalance:", usdcBalanceNumber, "ethBalance:", ethBalanceNumber, "senditBalance:", senditBalanceNumber, "amount:", amount); // Debug log

        const percentageChange = calculatePercentageChange(
            type === "SEND ETH" ? ethBalanceNumber :
                type === "SEND USDC" ? usdcBalanceNumber :
                    type === "SEND IT" ? senditBalanceNumber : 0,
            amount
        );

        console.log("percentageChange:", percentageChange); // Debug log
    }, [amount, ethBalanceNumber, usdcBalanceNumber, senditBalanceNumber, type]);

    return (
        <VStack gap={4} align="stretch" p={4} borderWidth="1px" borderRadius="md">
            <HStack justifyContent="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    {type}
                </Text>
                <LuChevronDown />
            </HStack>
            {(type === "SEND ETH" || type === "SEND USDC" || type === "SEND IT" || type === "SEND NFT") && isLoading ? (
                <Text>Loading...</Text>
            ) : (
                <>
                    {type === "SEND ETH" && (
                        <HStack>
                            <Image src={image} alt={name} boxSize="20px" />
                            <Text>
                                Balance: <Badge colorScheme="green">{ethBalanceNumber.toFixed(7)} {name}</Badge>
                            </Text>
                            {amount !== 0 && (
                                <Badge backgroundColor={'red.200'} fontWeight="semibold">
                                    -
                                    {(
                                        (amount / ethBalanceNumber) * 100
                                    ).toFixed(2)}%
                                </Badge>
                            )}
                        </HStack>
                    )}
                    {type === "SEND USDC" && (
                        <HStack>
                            <Image src={image} alt={name} boxSize="20px" />
                            <Text>
                                Balance: <Badge colorScheme="green">{usdcBalanceNumber.toFixed(3).toLocaleString()} {name}</Badge>
                            </Text>
                            {amount !== 0 && (
                                <Badge backgroundColor={'red.200'} fontWeight="semibold">
                                    -
                                    {(
                                        (amount / usdcBalanceNumber) * 100
                                    ).toFixed(2)}%
                                </Badge>
                            )}
                        </HStack>
                    )}
                    {type === "SEND IT" && (
                        <HStack>
                            <Image src={image} alt={name} boxSize="20px" />
                            <Text>
                                Balance: <Badge colorScheme="green">{senditBalanceNumber.toFixed(3)} {name}</Badge>
                            </Text>
                            {amount !== 0 && (
                                <Badge backgroundColor={'red.200'} fontWeight="semibold">
                                    -
                                    {(
                                        (amount / senditBalanceNumber) * 100
                                    ).toFixed(2)}%
                                </Badge>
                            )}
                        </HStack>
                    )}
                    {type === "SEND NFT" && (
                        <HStack>
                            <Image src="https://gnars.com/images/logo.png" alt="Gnars" boxSize="20px" />
                            <Text>
                                Balance: <Badge colorScheme="green">{gnarsNftBalance} GNARS</Badge>
                            </Text>
                        </HStack>
                    )}
                </>
            )}
            {type === "DROPOSAL MINT" && (
                <RadioGroup
                    value={editionType}
                    onValueChange={(details) => {
                        setEditionType(details.value); // Extract `value` property
                    }}
                >
                    <SimpleGrid columns={2} gap={4}>
                        <Radio value="Fixed">Fixed Edition</Radio>
                        <Radio value="Open">Open Edition</Radio>
                    </SimpleGrid>
                </RadioGroup>
            )}
            <TransactionForm
                type={type}
                fields={fields}
                onAdd={(transaction) => {
                    setAmount(parseFloat(transaction.details.amount)); // Update amount state
                    handleAdd(transaction);
                }}
                onCancel={onCancel}
                onFileChange={handleFileChange}
                onAmountChange={setAmount} // Pass the callback to update amount
            />
        </VStack>
    );

};

export default TransactionItem;
