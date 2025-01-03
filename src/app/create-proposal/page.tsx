'use client';

import React, { useState, useRef, useEffect, useCallback, use } from "react";
import { useForm, Controller } from "react-hook-form";
import {
    VStack,
    Text,
    Input,
    Button,
    Box,
    Group,
    Container,
} from "@chakra-ui/react";
import {
    StepsRoot,
    StepsList,
    StepsItem,
    StepsContent,
    StepsNextTrigger,
    StepsPrevTrigger,
    StepsCompletedContent,
} from "@/components/ui/steps";
import { LuFileText, LuPlus, LuCheckCircle } from "react-icons/lu";
import TransactionTypes from "@/components/create-proposal/TransactionTypes";
import TransactionList from "@/components/create-proposal/TransactionList";
import TransactionItem from "@/components/create-proposal/TransactionItem";
import Editor from "@/components/create-proposal/Editor";
import Markdown from "@/components/proposal/markdown";
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/utils/constants";
import { Address, encodeFunctionData } from "viem";
import USDC_ABI from "@/components/proposal/transactions/utils/USDC_abi";
import { governorAddress, tokenAbi, tokenAddress, useWriteGovernorPropose } from "@/hooks/wagmiGenerated";
import { useReadGovernorTreasury } from "@/hooks/wagmiGenerated";
import SENDIT_ABI from "@/components/proposal/transactions/utils/SENDIT_abi";
import DroposalABI from "@/components/proposal/transactions/utils/droposalABI";

interface Transaction {
    type: string;
    details: any;
}

interface FormData {
    proposalTitle: string;
    editorContent: string;
}

const CreateProposalPage = () => {
    const { control, handleSubmit, watch, setValue } = useForm<FormData>();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [currentTransactionType, setCurrentTransactionType] = useState<string | null>(null);
    const [showTransactionOptions, setShowTransactionOptions] = useState(false);
    const editorRef = useRef<any>(null);
    const { writeContractAsync: writeProposal } = useWriteGovernorPropose();
    const proposalTitle = watch("proposalTitle");
    const editorContent = watch("editorContent");
    const ReadGovernorTreasure = useReadGovernorTreasury();
    const [currentStep, setCurrentStep] = useState(0);
    const handleAddTransaction = useCallback(() => {
        setShowTransactionOptions(true);
    }, []);

    const handleSelectTransaction = useCallback((type: string) => {
        setCurrentTransactionType(type);
        setShowTransactionOptions(false);
    }, []);

    const handleAddTransactionDetails = useCallback((transaction: Transaction) => {
        setTransactions((prevTransactions) => [...prevTransactions, transaction]);
        setCurrentTransactionType(null);
    }, []);

    const handleCancelTransaction = useCallback(() => {
        setCurrentTransactionType(null);
    }, []);

    const handleDeleteTransaction = useCallback((index: number) => {
        setTransactions((prevTransactions) => prevTransactions.filter((_, idx) => idx !== index));
    }, []);
    // Helper function for USDC transfer calldata encoding
    const encodeUSDCTransfer = (recipient: string, amount: string, decimals: number) => {
        // Calculate the token amount based on decimals
        const adjustedAmount = BigInt(amount);
        // Encode the function data
        const calldata = encodeFunctionData({
            abi: USDC_ABI,
            functionName: "transfer",
            args: [recipient, adjustedAmount],
        });
        console.log("Encoded calldata:", calldata);
        return calldata;
    };

    const onSubmit = useCallback(async (data: FormData) => {
        const description = `${data.proposalTitle}&&${data.editorContent}`;
        console.log("Form data:", data);
        console.log("Transactions:", transactions);
        // Prepare transaction data
        const preparedTransactions = transactions.map((transaction) => {
            console.log("Transaction type:", transaction.type);
            if (transaction.type === "SEND ETH") {
                console.log("Transaction details:", transaction.details);
                return {
                    target: transaction.details.toAddress, // Target is destination wallet
                    value: transaction.details.amount, // ETH amount
                    calldata: "0x", // No calldata for ETH
                };
            }
            else if (transaction.type === "SEND NFT") {
                const recipient = transaction.details.toAddress;
                const tokenId = transaction.details.tokenID;
                const encodedCalldata = encodeFunctionData({
                    abi: tokenAbi,
                    functionName: "transferFrom",
                    args: [
                        //from
                        ReadGovernorTreasure.data as Address,
                        //to
                        recipient as Address,
                        //tokenId
                        tokenId,
                    ],

                });
                console.log("Encoded calldata:", encodedCalldata);
                return {
                    target: ReadGovernorTreasure.data as Address, // NFT contract
                    value: "0", // No ETH value for token transfers
                    calldata: encodedCalldata, // Encoded calldata
                };

            }
            else if (transaction.type === "SEND USDC") {
                const usdcAddress = USDC_CONTRACT_ADDRESS
                console.log("Transaction: ", transaction);
                console.log('amount:', transaction.details.amount);
                const encodedCalldata = encodeUSDCTransfer(
                    transaction.details.toAddress,
                    transaction.details.amount,
                    transaction.details.decimals
                );
                console.log("Encoded calldata:", encodedCalldata);
                return {
                    target: usdcAddress, // USDC contract
                    value: "0", // No ETH value for token transfers
                    calldata: encodedCalldata, // Encoded calldata
                };

            }
            else if (transaction.type === "SEND IT") {
                const recipient = transaction.details.toAddress;
                const amount = transaction.details.amount;
                const adjustedAmount = BigInt(amount);
                console.log("Transaction: ", transaction);
                console.log("Recipient:", recipient);
                console.log("Amount:", amount);
                const encodedCalldata = encodeFunctionData({
                    abi: SENDIT_ABI,
                    functionName: "transfer",
                    args: [
                        //to
                        recipient as Address,
                        //amount
                        adjustedAmount.toString(), // Convert BigInt to string
                    ],
                });
                console.log("Encoded calldata:", encodedCalldata);
                return {
                    target: SENDIT_CONTRACT_ADDRESS as Address, // SENDIT contract
                    value: "0", // No ETH value for token transfers
                    calldata: encodedCalldata, // Encoded calldata
                };
            }
            else if (transaction.type === "AIRDROP RANDOM GNAR") {
                console.log("Transaction: ", transaction);
                const recipient = transaction.details.toAddress;
                const amount = transaction.details.amount;
                console.log("Recipient:", recipient);
                const encodedCalldata = encodeFunctionData({
                    abi: tokenAbi,
                    functionName: "mintBatchTo",
                    args: [
                        //amount
                        amount,
                        //recipient
                        recipient as Address,
                    ],

                });

                console.log("Encoded calldata:", encodedCalldata);
                return {
                    target: tokenAddress as Address, // NFT contract
                    value: "0", // No ETH value for token transfers
                    calldata: encodedCalldata, // Encoded calldata
                };

            }
            else if (transaction.type === "DROPOSAL MINT") {
                const {
                    name,
                    symbol,
                    description,
                    animationURI,
                    imageURI,
                    editionSize,
                    royalty,
                    payoutAddress,
                    adminAddress,
                    saleConfig,
                } = transaction.details;

                // Convert price to 18 decimal units
                const priceInWei = BigInt(Math.floor(parseFloat(transaction.details.price) * 10 ** 18).toString());

                const saleConfigTuple = [
                    BigInt(saleConfig.publicSalePrice),
                    saleConfig.maxSalePurchasePerAddress || 1000000, // Default to a large number of sales
                    BigInt(saleConfig.publicSaleStart),
                    BigInt(saleConfig.publicSaleEnd),
                    BigInt(saleConfig.presaleStart),
                    BigInt(saleConfig.presaleEnd),
                    saleConfig.presaleMerkleRoot,
                ];

                const args = [
                    name,
                    symbol,
                    BigInt(Math.min(Number(editionSize), 1000)), // Lower the edition size to a maximum of 1000
                    Math.min(parseInt(royalty), 1000), // Cap royalty at 1000 bps (10%)
                    payoutAddress,
                    adminAddress,
                    saleConfigTuple, // pass as array
                    description,
                    animationURI,
                    imageURI,
                ];

                console.log("DROPOSAL MINT args:", args);

                const encodedCalldata = encodeFunctionData({
                    abi: DroposalABI,
                    functionName: "createEdition",
                    args,
                });

                return {
                    target: "0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c" as Address,
                    value: "0",
                    calldata: encodedCalldata,
                };
            }

            else {
                // Handle other transaction types here
                return { target: "", value: "", calldata: "" };
            }
        });

        console.log({
            title: data.proposalTitle,
            description,
            transactions: preparedTransactions,
        });

        console.log(governorAddress);
        console.log(preparedTransactions.map((transaction) => transaction.target));
        console.log(preparedTransactions.map((transaction) => transaction.calldata));

        try {
            await writeProposal({
                args: [
                    preparedTransactions.map((transaction) => transaction.target),
                    preparedTransactions.map((transaction) => transaction.value),
                    preparedTransactions.map((transaction) => transaction.calldata as `0x${string}`),
                    description,
                ],
            });
            console.log("Proposal submitted successfully!", preparedTransactions);
            alert("Proposal prepared! Check the console for details.");
        } catch (error) {
            console.error("Error submitting proposal:", error);
            console.error("Stack trace:", (error as any).stack);
            alert("Failed to submit proposal. Check the console for details.");
        }
    }, [transactions]);

    const isTitleValid = proposalTitle?.length > 5;

    return (
        <Container maxW="container.lg" px={{ base: "0", md: "20%" }}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <StepsRoot defaultStep={0} count={3} step={currentStep} onStepChange={(details) => setCurrentStep(details.step)}>
                    <StepsList>
                        <StepsItem index={0} icon={<LuFileText />} />
                        <StepsItem index={1} icon={<LuPlus />} />
                        <StepsItem index={2} icon={<LuCheckCircle />} />
                    </StepsList>

                    {/* Step 1: Proposal Title */}
                    <StepsContent index={0}>
                        <VStack gap={4} align="stretch" p={4}>
                            <Text fontSize="2xl" fontWeight="bold">Proposal Title</Text>
                            <Controller
                                name="proposalTitle"
                                control={control}
                                defaultValue=""
                                rules={{ required: "Title is required", minLength: { value: 6, message: "Title must be longer than 5 characters" } }}
                                render={({ field, fieldState }) => (
                                    <>
                                        <Input
                                            placeholder="Enter your proposal title"
                                            {...field}
                                        />
                                        {fieldState.error && (
                                            <Text color="red.500">{fieldState.error.message}</Text>
                                        )}
                                    </>
                                )}
                            />
                        </VStack>
                    </StepsContent>

                    {/* Step 2: Add Transactions */}
                    <StepsContent index={1}>
                        <VStack gap={4} align="stretch" p={4}>
                            <Text fontSize="2xl" fontWeight="bold">Transactions</Text>

                            {currentTransactionType ? (
                                <TransactionItem
                                    type={currentTransactionType}
                                    onAdd={handleAddTransactionDetails}
                                    onCancel={handleCancelTransaction}
                                />
                            ) : showTransactionOptions ? (
                                <TransactionTypes onSelect={handleSelectTransaction} />
                            ) : (
                                <>
                                    <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                                    <Button colorScheme="teal" onClick={handleAddTransaction}>
                                        Add Transaction
                                    </Button>
                                </>
                            )}
                        </VStack>
                    </StepsContent>

                    {/* Step 3: Proposal Description */}
                    <StepsContent index={2}>
                        <VStack gap={4} align="stretch" p={4}>
                            <Text fontSize="2xl" fontWeight="bold">Proposal Description</Text>
                            <Controller
                                name="editorContent"
                                control={control}
                                defaultValue=""
                                render={({ field }) => (
                                    <Editor
                                        value={field.value} // Pass the form value to the editor
                                        onChange={(content) => {
                                            field.onChange(content); // Update react-hook-form state
                                        }}
                                    />
                                )}
                            />
                        </VStack>
                    </StepsContent>

                    {/* Review and Submit */}
                    <StepsCompletedContent>
                        <VStack gap={4} align="stretch" p={4}>
                            <Text fontSize="2xl" fontWeight="bold">Review and Submit</Text>
                            <Text>Title: <strong>{proposalTitle}</strong></Text>
                            <TransactionList transactions={transactions} onDelete={handleDeleteTransaction} />
                            <Box
                                borderWidth="1px"
                                borderRadius="md"
                                borderColor={editorContent ? "gray.300" : "red.500"}
                                p={4}
                            >
                                <Markdown
                                    text={editorContent}
                                />
                            </Box>
                            <Button
                                colorScheme="green"
                                type="submit"
                                disabled={!isTitleValid || transactions.length === 0}
                            >
                                Submit Proposal
                            </Button>
                        </VStack>
                    </StepsCompletedContent>

                    {/* Navigation Buttons */}
                    <Group mt={6} justify="space-between">
                        <StepsPrevTrigger asChild>
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                >
                                    Previous
                                </Button>
                            </div>
                        </StepsPrevTrigger>
                        <StepsNextTrigger asChild>
                            <div>
                                {currentStep < 3 && (
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        colorScheme="teal"
                                        disabled={!isTitleValid && !transactions.length}
                                    >
                                        Next
                                    </Button>
                                )}
                            </div>
                        </StepsNextTrigger>
                    </Group>
                </StepsRoot>
            </form>
        </Container>
    );
};

export default CreateProposalPage;
