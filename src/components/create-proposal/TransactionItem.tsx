"use client";

import React, { useState } from "react";
import { VStack, Text, HStack, SimpleGrid } from "@chakra-ui/react";
import { Radio, RadioGroup } from "@/components/ui/radio"
import TransactionForm from "./TransactionForm";
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/utils/constants";
import { isAddress } from 'viem';
import { LuChevronDown } from "react-icons/lu";
import GnarReserveInfo from "./GnarReserveInfo";
import { validate } from "graphql";

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
                    { name: "tokenID", placeholder: "Enter token ID", validate: (value: string) => !isNaN(Number(value)) || "Invalid token ID." },
                    { name: "toAddress", placeholder: "Enter destination address", validate: (value: string) => isAddress(value) || "Invalid Ethereum address." }
                ];
            case "AIRDROP RANDOM GNAR":
                return [
                    { name: "toAddress", placeholder: "Address", validate: (value: string) => isAddress(value) || "Invalid Ethereum address." },
                    { name: "amount", placeholder: "Amount", validate: (value: string) => !isNaN(Number(value)) || "Invalid amount." }
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
        if (type === "SEND ETH" || type === "SEND USDC" || type === "SEND IT") {
            const parsedAmount = parseFloat(transaction.details.amount);
            const amountWithDecimals = (parsedAmount * 10 ** decimals).toString();
            const details = {
                ...transaction.details,
                amount: amountWithDecimals,
                tokenAddress,
                decimals,
            };
            console.log("DETAILS:", details);
            onAdd({ type: `${transaction.type}`, details });
        } else if (type === "DROPOSAL MINT") {
            const parseToBigInt = (value: string) => {
                if (!value || isNaN(Number(value))) return BigInt(0);
                return BigInt(Math.floor(Number(value) * 10 ** 18).toString());
            };

            const saleConfig = {
                publicSalePrice: parseToBigInt(transaction.details.price), // Convert price to 18 decimal units
                maxSalePurchasePerAddress: 2,
                publicSaleStart: parseToBigInt(transaction.details.startTime),
                publicSaleEnd: parseToBigInt(transaction.details.endTime),
                presaleStart: BigInt(0),
                presaleEnd: BigInt(0),
                presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
            };

            const details: DroposalMintDetails = {
                name: transaction.details.name || "",
                symbol: transaction.details.symbol || "",
                description: transaction.details.description || "",
                price: transaction.details.price || "0",
                animationURI: transaction.details.animationURI || "",
                imageURI: transaction.details.imageURI || "",
                editionSize: editionType === "Open" ? UNLIMITED_EDITION_SIZE : transaction.details.editionSize,
                startTime: transaction.details.startTime || "0",
                endTime: transaction.details.endTime || "0",
                mintLimit: transaction.details.mintLimit || "0",
                royalty: transaction.details.royalty || "0",
                payoutAddress: transaction.details.payoutAddress || "",
                adminAddress: transaction.details.adminAddress || "",
                saleConfig,
                editionType,
            };

            onAdd({ type: `${transaction.type}`, details });
        } else {
            onAdd(transaction);
        }
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
            {type === "SEND NFT" && (
                <GnarReserveInfo />
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
