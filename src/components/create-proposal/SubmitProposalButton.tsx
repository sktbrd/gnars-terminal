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
import { formatTransactionDetails } from "@/utils/transactionUtils";

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

    const encodeUSDCTransfer = (recipient: string, amount: string) => {
        const adjustedAmount = BigInt(amount);
        return encodeFunctionData({
            abi: USDC_ABI,
            functionName: "transfer",
            args: [recipient, adjustedAmount],
        });
    };

    const prepareTransaction = (transaction: any) => {
        const formattedDetails = formatTransactionDetails(transaction.type, transaction.details);

        switch (transaction.type) {
            case "SEND ETH":
                return {
                    target: formattedDetails.toAddress,
                    value: formattedDetails.value,
                    calldata: "0x",
                };
            case "SEND NFT":
                const recipient = transaction.details.toAddress; // Use original details for recipient
                const tokenId = formattedDetails.tokenId;
                if (tokenId === undefined) {
                    throw new Error("Token ID is required for SEND NFT transactions");
                }
                const encodedCalldata = encodeFunctionData({
                    abi: tokenAbi,
                    functionName: "transferFrom",
                    args: [
                        ReadGovernorTreasure.data as Address,
                        recipient as Address,
                        BigInt(tokenId),
                    ],
                });
                return {
                    target: tokenAddress as Address,
                    value: "0",
                    calldata: encodedCalldata,
                };
            case "SEND USDC":
                const usdcAddress = USDC_CONTRACT_ADDRESS;
                const encodedCalldataUSDC = encodeUSDCTransfer(
                    formattedDetails.toAddress,
                    formattedDetails.formattedAmount
                );
                return {
                    target: usdcAddress,
                    value: "0",
                    calldata: encodedCalldataUSDC,
                };
            case "SEND IT":
                const recipientIT = formattedDetails.toAddress;
                const amountIT = formattedDetails.formattedAmount;
                const adjustedAmountIT = BigInt(amountIT);
                const encodedCalldataIT = encodeFunctionData({
                    abi: SENDIT_ABI,
                    functionName: "transfer",
                    args: [recipientIT, adjustedAmountIT],
                });
                return {
                    target: SENDIT_CONTRACT_ADDRESS,
                    value: "0",
                    calldata: encodedCalldataIT,
                };
            case "AIRDROP RANDOM GNAR":
                const recipientGnar = formattedDetails.toAddress;
                const amountGnar = formattedDetails.amount;
                const encodedCalldataGnar = encodeFunctionData({
                    abi: tokenAbi,
                    functionName: "mintBatchTo",
                    args: [amountGnar, recipientGnar as Address],
                });
                return {
                    target: tokenAddress as Address,
                    value: "0",
                    calldata: encodedCalldataGnar,
                };
            case "DROPOSAL MINT":
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
                } = formattedDetails;

                if (!saleConfig) {
                    throw new Error("Missing saleConfig object");
                }

                const requiredProperties = [
                    "publicSalePrice",
                    "publicSaleStart",
                    "publicSaleEnd",
                    "presaleStart",
                    "presaleEnd",
                    "presaleMerkleRoot",
                ];

                for (const property of requiredProperties) {
                    if (saleConfig[property] === undefined || saleConfig[property] === null) {
                        throw new Error(`Missing or invalid saleConfig property: ${property}`);
                    }
                }

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

                const encodedCalldataDroposal = encodeFunctionData({
                    abi: DroposalABI,
                    functionName: "createEdition",
                    args,
                });

                return {
                    target: "0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c",
                    value: "0",
                    calldata: encodedCalldataDroposal,
                };
            default:
                return { target: "", value: "", calldata: "" };
        }
    };

    const onSubmit = useCallback(async () => {
        const description = `${proposalTitle}&&${editorContent}`;
        const preparedTransactions = transactions.map(prepareTransaction);

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
