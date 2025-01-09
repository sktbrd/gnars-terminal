"use client";

import React, { useState } from "react";
import { VStack, Text, HStack, SimpleGrid, Button } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@/components/ui/radio"
import TransactionForm from "./TransactionForm";
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/utils/constants";
import { Address, isAddress } from 'viem';
import { LuChevronDown } from "react-icons/lu";
import { prepareTransactionData } from '@/utils/transactionUtils';

type TransactionItemProps = {
    type: string;
    onAdd: (transaction: { type: string; details: Record<string, any> }) => void;
    onCancel: () => void;
};

type DroposalMintDetails = {
    name: string;
    symbol: string;
    description: string;
    media?: string; // TODO: IMPLEMENT IPFS FILE UPLOAD AND optimize media URL
    price: string;
    editionSize?: string;
    startTime: string;
    endTime: string;
    mintLimit: string;
    royalty: string;
    payoutAddress: string;
    adminAddress: string;
    saleConfig: {
        publicSalePrice: bigint;
        maxSalePurchasePerAddress: number;
        publicSaleStart: bigint;
        publicSaleEnd: bigint;
        presaleStart: bigint;
        presaleEnd: bigint;
        presaleMerkleRoot: string;
    };
    editionType: string;
    animationURI?: string;
    imageURI?: string;
};

const TransactionItem: React.FC<TransactionItemProps> = ({ type, onAdd, onCancel }) => {
    const [file, setFile] = useState<File | null>(null);
    const [editionType, setEditionType] = useState<string>("Fixed");
    const [simulationResult, setSimulationResult] = useState<"success" | "fail" | "pending" | null>(null);
    // const [transactionAdded, setTransactionAdded] = useState<boolean>(false); // Track if transaction is added

    const getTokenDetails = (type: string) => {
        switch (type) {
            case "SEND ETH":
                return { tokenAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", decimals: 18 };
            case "SEND USDC":
                return { tokenAddress: USDC_CONTRACT_ADDRESS, decimals: 6 };
            case "SEND IT":
                return { tokenAddress: SENDIT_CONTRACT_ADDRESS, decimals: 18 };
            default:
                return { tokenAddress: "", decimals: 18 };
        }
    };

    const { tokenAddress, decimals } = getTokenDetails(type);
    const UNLIMITED_EDITION_SIZE = "18446744073709551615";

    const fields = (() => {
        switch (type) {
            case "SEND ETH":
            case "SEND USDC":
            case "SEND IT":
                return [
                    { name: "amount", placeholder: "Enter amount", validate: (value: string) => !isNaN(Number(value)) || "Invalid amount." },
                    { name: "toAddress", placeholder: "Enter destination address", validate: (value: string) => isAddress(value) || "Invalid Ethereum address." }
                ];
            case "SEND NFT":
                return [
                    { name: "tokenId", placeholder: "Enter token ID", validate: (value: string) => !isNaN(Number(value)) || "Invalid token ID." },
                    { name: "toAddress", placeholder: "Enter destination address", validate: (value: string) => isAddress(value) || "Invalid Ethereum address." }
                ];
            //NEEDS TO APPROVE TREASURE AS A MINTER OF NFT CONTRACT BEFORE THE DAO USE THIS ONE
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
        console.log(`Adding transaction of type: ${type}`);
        console.log(`Transaction details:`, transaction.details);

        const treasureAddress = process.env.NEXT_PUBLIC_TREASURY as Address || '0x';
        const { input, contractAbi, fromAddress, toAddress, value } = prepareTransactionData(type, transaction.details, treasureAddress);

        const details = {
            ...transaction.details,
            calldata: input,
            contractAbi,
            fromAddress,
            toAddress,
            value,
        };

        console.log("Prepared transaction details:", details);
        onAdd({ type: `${transaction.type}`, details });
    };

    return (
        <VStack gap={4} align="stretch" p={4} borderWidth="1px" borderRadius="md">
            <HStack justifyContent="space-between">
                <Text fontWeight="bold" fontSize="lg">
                    {type}
                </Text>
                <LuChevronDown />
            </HStack>
            {type === "DROPOSAL MINT" && (
                <RadioGroup
                    value={editionType}
                    onValueChange={(details) => {
                        console.log(details.value);
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
                onAdd={handleAdd}
                onCancel={onCancel}
                onFileChange={handleFileChange}
            />
        </VStack>
    );
};

export default TransactionItem;
