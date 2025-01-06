import React, { useCallback } from "react";
import { Button } from "@chakra-ui/react";
import { useWriteGovernorPropose, useReadGovernorTreasury } from "@/hooks/wagmiGenerated";
import { Address, encodeFunctionData } from "viem";
import USDC_ABI from "@/components/proposal/transactions/utils/USDC_abi";
import SENDIT_ABI from "@/components/proposal/transactions/utils/SENDIT_abi";
import DroposalABI from "@/components/proposal/transactions/utils/droposalABI";
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "@/utils/constants";
import { tokenAbi, tokenAddress } from "@/hooks/wagmiGenerated";
import { toaster } from "@/components/ui/toaster";
import { useRouter } from "next/navigation";

interface SubmitProposalButtonProps {
    isTitleValid: boolean;
    transactions: any[];
    proposalTitle: string;
    editorContent: string;
}

const SubmitProposalButton: React.FC<SubmitProposalButtonProps> = ({
    isTitleValid,
    transactions,
    proposalTitle,
    editorContent,
}) => {
    const { writeContractAsync: writeProposal } = useWriteGovernorPropose();
    const ReadGovernorTreasure = useReadGovernorTreasury();
    const router = useRouter();

    const encodeUSDCTransfer = (recipient: string, amount: string, decimals: number) => {
        const adjustedAmount = BigInt(amount);
        const calldata = encodeFunctionData({
            abi: USDC_ABI,
            functionName: "transfer",
            args: [recipient, adjustedAmount],
        });
        console.log("Encoded calldata:", calldata);
        return calldata;
    };

    const onSubmit = useCallback(async () => {
        const description = `${proposalTitle}&&${editorContent}`;
        console.log("Transactions:", transactions);

        const preparedTransactions = transactions.map((transaction) => {
            if (transaction.type === "SEND ETH") {
                return {
                    target: transaction.details.toAddress,
                    value: transaction.details.amount,
                    calldata: "0x",
                };
            } else if (transaction.type === "SEND NFT") {
                console.log("Transaction:", transaction);
                const recipient = transaction.details.toAddress;
                const tokenId = transaction.details.tokenID;
                const encodedCalldata = encodeFunctionData({
                    abi: tokenAbi,
                    functionName: "transferFrom",
                    args: [
                        ReadGovernorTreasure.data as Address,
                        recipient as Address,
                        tokenId,
                    ],
                });
                console.log("Encoded calldata:", encodedCalldata);
                console.log(ReadGovernorTreasure.data);
                return {
                    target: tokenAddress as Address,
                    value: "0",
                    calldata: encodedCalldata,
                };
            } else if (transaction.type === "SEND USDC") {
                const usdcAddress = USDC_CONTRACT_ADDRESS;
                const encodedCalldata = encodeUSDCTransfer(
                    transaction.details.toAddress,
                    transaction.details.amount,
                    transaction.details.decimals
                );
                return {
                    target: usdcAddress,
                    value: "0",
                    calldata: encodedCalldata,
                };
            } else if (transaction.type === "SEND IT") {
                const recipient = transaction.details.toAddress;
                const amount = transaction.details.amount;
                const adjustedAmount = BigInt(amount);
                const encodedCalldata = encodeFunctionData({
                    abi: SENDIT_ABI,
                    functionName: "transfer",
                    args: [recipient, adjustedAmount.toString()],
                });
                return {
                    target: SENDIT_CONTRACT_ADDRESS,
                    value: "0",
                    calldata: encodedCalldata,
                };
            } else if (transaction.type === "AIRDROP RANDOM GNAR") {
                const recipient = transaction.details.toAddress;
                const amount = transaction.details.amount;
                const encodedCalldata = encodeFunctionData({
                    abi: tokenAbi,
                    functionName: "mintBatchTo",
                    args: [amount, recipient as Address],
                });
                return {
                    target: tokenAddress as Address,
                    value: "0",
                    calldata: encodedCalldata,
                };
            } else if (transaction.type === "DROPOSAL MINT") {
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

                const priceInWei = BigInt(Math.floor(parseFloat(transaction.details.price) * 10 ** 18).toString());

                const saleConfigTuple = [
                    BigInt(saleConfig.publicSalePrice),
                    saleConfig.maxSalePurchasePerAddress || 1000000,
                    BigInt(saleConfig.publicSaleStart),
                    BigInt(saleConfig.publicSaleEnd),
                    BigInt(saleConfig.presaleStart),
                    BigInt(saleConfig.presaleEnd),
                    saleConfig.presaleMerkleRoot,
                ];

                const args = [
                    name,
                    symbol,
                    BigInt(Math.min(Number(editionSize), 1000)),
                    Math.min(parseInt(royalty), 1000),
                    payoutAddress,
                    adminAddress,
                    saleConfigTuple,
                    description,
                    animationURI,
                    imageURI,
                ];

                const encodedCalldata = encodeFunctionData({
                    abi: DroposalABI,
                    functionName: "createEdition",
                    args,
                });

                return {
                    target: "0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c",
                    value: "0",
                    calldata: encodedCalldata,
                };
            } else {
                return { target: "", value: "", calldata: "" };
            }
        });

        const loadingToast = toaster.create({
            description: "Submitting proposal...",
            type: "loading",
        });

        try {
            await writeProposal({
                args: [
                    preparedTransactions.map((transaction) => transaction.target),
                    preparedTransactions.map((transaction) => transaction.value),
                    preparedTransactions.map((transaction) => transaction.calldata as `0x${string}`),
                    description,
                ],
            });

            toaster.dismiss(loadingToast);

            toaster.create({
                title: "Success",
                description: (
                    <span onClick={() => router.push("/proposal-page")}>
                        Proposal submitted successfully! Click here to view.
                    </span>
                ),
                type: "success",
            });

            console.log("Proposal submitted successfully!", preparedTransactions);

        } catch (error) {
            toaster.dismiss(loadingToast);

            const errorMessage = (error as any).message || "Failed to submit proposal. Check the console for details.";

            const userDeniedMessage = "User denied transaction signature.";
            const displayMessage = errorMessage.includes(userDeniedMessage)
                ? userDeniedMessage
                : errorMessage;

            toaster.create({
                title: "Error",
                description: displayMessage,
                type: "error",
            });

            console.error("Error submitting proposal:", error);
            console.error("Stack trace:", (error as any).stack);
        }
    }, [transactions, proposalTitle, editorContent, writeProposal, ReadGovernorTreasure.data, router]);

    return (
        <Button
            colorScheme="green"
            onClick={onSubmit}
            disabled={!isTitleValid || transactions.length === 0}
        >
            Submit Proposal
        </Button>
    );
};

export default SubmitProposalButton;
