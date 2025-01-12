import { Address, encodeFunctionData, parseUnits, parseEther } from 'viem';
import USDC_ABI from '../components/proposal/transactions/utils/USDC_abi';
import SENDIT_ABI from '../components/proposal/transactions/utils/SENDIT_abi';
import DroposalABI from '../components/proposal/transactions/utils/droposalABI';
import { governorAddress, tokenAbi, tokenAddress } from '@/hooks/wagmiGenerated';

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
const DROPOSAL_CONTRACT_ADDRESS = "0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c";

export const prepareTransactionData = (type: string, details: any, treasureAddress: Address) => {
    let input: string;
    let contractAbi: any;
    let fromAddress: Address = details.fromAddress || treasureAddress;
    let toAddress: Address = details.toAddress;
    let value = "0"; // Default value for Non-ETH transactions
    switch (type) {
        case "SEND ETH":
            fromAddress = treasureAddress;
            value = details.value;
            input = "0x"; // Correct input for ETH transfer
            break;
        case "SEND USDC":
            fromAddress = treasureAddress;
            input = encodeTokenTransfer(USDC_ABI, "transfer", details.toAddress, details.formattedAmount, 6); // Use formatted amount
            contractAbi = USDC_ABI;
            break;
        case "SEND IT":
            fromAddress = treasureAddress;
            input = encodeTokenTransfer(SENDIT_ABI, "transfer", details.toAddress, details.formattedAmount, 18); // Use formatted amount
            contractAbi = SENDIT_ABI;
            break;
        case "DROPOSAL MINT":
            console.log(`DROPOSAL MINT - details:`, details);
            input = encodeDroposalMint(details);
            contractAbi = DroposalABI;
            toAddress = DROPOSAL_CONTRACT_ADDRESS;
            break;
        case "AIRDROP RANDOM GNAR":
            fromAddress = treasureAddress;
            input = encodeFunctionData({
                abi: tokenAbi,
                functionName: 'mintBatchTo',
                args: [BigInt(details.amount), details.toAddress]
            });
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
            contractAbi = tokenAbi;
            break;
        default:
            throw new Error("Unsupported transaction type");
    }

    console.log(`Prepared transaction data:`, { input, contractAbi, fromAddress, toAddress, value, calldata: input });

    return { input, contractAbi, fromAddress, toAddress, value, calldata: input };
};

export const formatTransactionDetails = (type: string, details: any) => {
    switch (type) {
        case "SEND ETH":
            return {
                ...details,
                value: parseEther(details.amount).toString(),
            };
        case "SEND USDC":
            return {
                ...details,
                formattedAmount: parseUnits(details.amount, 6).toString(), // Format amount correctly
                value: "0",
            };
        case "SEND IT":
            return {
                ...details,
                formattedAmount: parseUnits(details.amount, 18).toString(), // Format amount correctly
                value: "0",
            };
        case "DROPOSAL MINT":
            return {
                ...details,
                toAddress: DROPOSAL_CONTRACT_ADDRESS,
                saleConfig: {
                    publicSalePrice: parseEther(details.price).toString(),
                    maxSalePurchasePerAddress: details.mintLimit ? parseInt(details.mintLimit) : 1000000,
                    publicSaleStart: BigInt(new Date(details.startTime).getTime() / 1000),
                    publicSaleEnd: BigInt(new Date(details.endTime).getTime() / 1000),
                    presaleStart: BigInt(0),
                    presaleEnd: BigInt(0),
                    presaleMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
                },
            };
        default:
            return details;
    }
};

const encodeTokenTransfer = (abi: any, functionName: string, to: string, amount: string, decimals: number) => {
    return encodeFunctionData({
        abi,
        functionName,
        args: [to, BigInt(amount)], // Use the already formatted amount
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

    if (!saleConfig) {
        console.error("Missing saleConfig object");
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
            console.error(`Missing or invalid saleConfig property: ${property}`);
            throw new Error(`Missing or invalid saleConfig property: ${property}`);
        }
    }

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


    return encodeFunctionData({
        abi: DroposalABI,
        functionName: "createEdition",
        args,
    });
};
