import { Address, encodeFunctionData, isAddress } from 'viem';
import USDC_ABI from '../components/proposal/transactions/utils/USDC_abi';
import SENDIT_ABI from '../components/proposal/transactions/utils/SENDIT_abi';
import DroposalABI from '../components/proposal/transactions/utils/droposalABI';
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from '../utils/constants';
import { governorAddress, tokenAbi, tokenAddress } from '@/hooks/wagmiGenerated';

export const prepareTransactionData = (type: string, details: any, treasureAddress: Address) => {
    let input: string;
    let contractAbi: any;
    let fromAddress: Address = details.fromAddress || treasureAddress;
    let toAddress: Address = details.toAddress;
    let value = "0"; // Default value for Non-ETH transactions

    console.log(`Preparing transaction data for type: ${type}`);
    console.log(`Details:`, details);

    switch (type) {
        case "SEND ETH":
            fromAddress = treasureAddress;
            value = details.amount;
            input = "0x"; // Correct input for ETH transfer
            break;
        case "SEND USDC":
            fromAddress = treasureAddress;
            input = encodeTokenTransfer(USDC_ABI, "transfer", details.toAddress, details.amount, 6); // USDC has 6 decimals
            contractAbi = USDC_ABI;
            toAddress = USDC_CONTRACT_ADDRESS;
            break;
        case "SEND IT":
            fromAddress = treasureAddress;
            input = encodeTokenTransfer(SENDIT_ABI, "transfer", details.toAddress, details.amount, 18); // SEND IT has 18 decimals
            contractAbi = SENDIT_ABI;
            toAddress = SENDIT_CONTRACT_ADDRESS;
            break;
        case "DROPOSAL MINT":
            input = encodeDroposalMint(details);
            contractAbi = DroposalABI;
            break;
        case "AIRDROP RANDOM GNAR":
            fromAddress = treasureAddress;
            console.log(`AIRDROP RANDOM GNAR - toAddress: ${details.toAddress}, amount: ${details.amount}`);
            input = encodeFunctionData({
                abi: tokenAbi,
                functionName: 'mintBatchTo',
                args: [BigInt(details.amount), details.toAddress]
            });
            toAddress = tokenAddress;
            contractAbi = tokenAbi;
            break;
        case "SEND NFT":
            if (!details.tokenId) {
                throw new Error("Token ID is required for SEND NFT transactions");
            }
            fromAddress = treasureAddress;
            console.log(`SEND NFT - toAddress: ${details.toAddress}, tokenId: ${details.tokenId}`);
            input = encodeFunctionData({
                abi: tokenAbi,
                functionName: 'transferFrom',
                args: [treasureAddress as Address, details.toAddress, BigInt(details.tokenId)]
            });
            toAddress = tokenAddress;
            contractAbi = tokenAbi;
            break;
        default:
            throw new Error("Unsupported transaction type");
    }

    console.log(`Prepared transaction data:`, { input, contractAbi, fromAddress, toAddress, value, calldata: input });

    return { input, contractAbi, fromAddress, toAddress, value, calldata: input };
};

const encodeTokenTransfer = (abi: any, functionName: string, to: string, amount: number, decimals: number) => {
    const adjustedAmount = BigInt(Math.floor(amount * 10 ** decimals)).toString();
    console.log(`Encoding token transfer - to: ${to}, amount: ${adjustedAmount}`);
    return encodeFunctionData({
        abi,
        functionName,
        args: [to, adjustedAmount],
    });
};

const encodeDroposalMint = (details: any) => {
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
    } = details;

    const saleConfigTuple = [
        BigInt(saleConfig.publicSalePrice).toString(),
        saleConfig.maxSalePurchasePerAddress || 1000000,
        BigInt(saleConfig.publicSaleStart).toString(),
        BigInt(saleConfig.publicSaleEnd).toString(),
        BigInt(saleConfig.presaleStart).toString(),
        BigInt(saleConfig.presaleEnd).toString(),
        saleConfig.presaleMerkleRoot,
    ];

    const args = [
        name,
        symbol,
        BigInt(Math.min(Number(editionSize), 1000)).toString(),
        Math.min(parseInt(royalty), 1000),
        payoutAddress,
        adminAddress,
        saleConfigTuple,
        description,
        animationURI,
        imageURI,
    ];

    console.log(`Encoding droposal mint - args:`, args);

    return encodeFunctionData({
        abi: DroposalABI,
        functionName: "createEdition",
        args,
    });
};
