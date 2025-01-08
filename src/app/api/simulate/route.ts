// All Dao transactions are made from the treasure Address despites the fact the governor is the one who should be making the transactions
// Tokens and Minting transactions should be made to the contracts address of its respective tokens 
// TODO: understand how ETH transactions are simulated in tenderly



import { NextResponse } from 'next/server';
import { Address, encodeFunctionData } from 'viem';
import USDC_ABI from '../../../components/proposal/transactions/utils/USDC_abi';
import SENDIT_ABI from '../../../components/proposal/transactions/utils/SENDIT_abi';
import DroposalABI from '../../../components/proposal/transactions/utils/droposalABI';
import { SENDIT_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from '../../../utils/constants';
import { governorAddress, tokenAbi, tokenAddress } from '@/hooks/wagmiGenerated';
import { publicClient } from '@/utils/client';

type SimulationRequestBody = {
    network_id: string;
    from: string;
    to: string;
    input: string;
    value: string;
    gas: number;
    save: boolean;
    save_if_fails: boolean;
    simulation_type: string;
    contract_abi: any; // Updated to allow any type
    context?: {
        governor: string;
        treasury: string;
        sendit: string;
    };
};

const encodeUSDCTransfer = (to: string, amount: string) => {
    const adjustedAmount = BigInt(amount);
    return encodeFunctionData({
        abi: USDC_ABI,
        functionName: "transfer",
        args: [to, adjustedAmount],
    });
};

const encodeSendItTransfer = (recipient: string, amount: string) => {
    const adjustedAmount = BigInt(amount);
    return encodeFunctionData({
        abi: SENDIT_ABI,
        functionName: "transfer",
        args: [recipient, adjustedAmount.toString()],
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

    return encodeFunctionData({
        abi: DroposalABI,
        functionName: "createEdition",
        args,
    });
};

export async function POST(req: Request) {
    try {
        const { type, details } = await req.json();
        console.log("Received simulation request:", type, details);

        // Validate request body
        if (!type || !details || !details.fromAddress || !details.toAddress || !details.amount) {
            console.error("Invalid request body:", { type, details });
            return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
        }

        const accountSlug = process.env.TENDERLY_ACCOUNT_SLUG;
        const projectSlug = process.env.TENDERLY_PROJECT_SLUG;

        if (!accountSlug || !projectSlug) {
            console.error("Missing required environment variables.");
            return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
        }

        const headers = {
            'Content-Type': 'application/json',
            'X-Access-Key': process.env.NEXT_PUBLIC_TENDERLY_SECRET || '',
        };

        let input = details.calldata;
        let contractAbi: any;
        let value = "0"; // Default value
        let fromAddress: string = details.fromAddress;
        let toAddress = details.toAddress;
        const treasureAddress = process.env.NEXT_PUBLIC_TREASURY || '';

        if (!input) {
            switch (type) {
                case "SEND ETH":
                    fromAddress = governorAddress;
                    value = details.amount;
                    input = "0x"; // Correct input for ETH transfer
                    break;
                case "SEND USDC":
                    fromAddress = process.env.NEXT_PUBLIC_TREASURY || ""
                    input = encodeUSDCTransfer(details.toAddress, details.amount);
                    contractAbi = USDC_ABI;
                    toAddress = USDC_CONTRACT_ADDRESS;
                    break;
                case "SEND IT":
                    fromAddress = process.env.NEXT_PUBLIC_TREASURY || governorAddress;
                    input = encodeSendItTransfer(details.toAddress, details.amount);
                    contractAbi = SENDIT_ABI;
                    toAddress = SENDIT_CONTRACT_ADDRESS;
                    break;
                case "DROPOSAL MINT":
                    input = encodeDroposalMint(details);
                    contractAbi = DroposalABI;
                    break;
                case "NFT TRANSFER":
                    input = encodeFunctionData(
                        {
                            abi: tokenAbi,
                            functionName: 'transferFrom',
                            args: [treasureAddress as Address, details.toAddress, details.tokenId]
                        }
                    )
                    contractAbi = tokenAbi;
                    toAddress = tokenAddress
                    break;
                default:
                    console.error("Unsupported transaction type:", type);
                    return NextResponse.json({ message: 'Unsupported transaction type' }, { status: 400 });
            }
        }


        // Fetch the real block number using publicClient
        const blockNumber = Number(await publicClient.getBlockNumber());
        console.log("Current block number:", blockNumber);

        const body: SimulationRequestBody = {
            network_id: "8453",
            from: treasureAddress,
            to: toAddress,
            input,
            value,
            gas: 648318, // Example gas value
            // Remove block_number field
            save: true,
            save_if_fails: true,
            simulation_type: "full",
            contract_abi: contractAbi,
        };

        const logBody = { ...body };
        delete logBody.contract_abi;

        const endpoint = `https://api.tenderly.co/api/v1/account/${accountSlug}/project/${projectSlug}/simulate`;

        console.log("Sending request to:", endpoint);
        console.log("Simulation request body (without ABI):", logBody);

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error(`Tenderly API error! status: ${response.status}`);
            const errorDetails = await response.json();
            console.error("Tenderly API error details:", errorDetails);
            return NextResponse.json({
                success: false,
                message: `Tenderly API error: ${response.statusText}`,
                details: errorDetails,
            }, { status: response.status });
        }

        const data = await response.json();
        console.log("Simulation response:", data);
        const success = data.simulation?.status === true
        const simulationId = data.simulation?.id;
        const simulationUrl = `https://dashboard.tenderly.co/${accountSlug}/${projectSlug}/simulator/${simulationId}`;

        console.log("Simulation ID:", simulationId);
        console.log("Simulation URL:", simulationUrl);

        return NextResponse.json({ success: success, message: success ? "Simulation succeeded" : "Simulation failed", simulationUrl, details: data });
    } catch (error) {
        console.error("Simulation error:", error);
        return NextResponse.json({ success: false, message: "Internal server error", details: (error as Error).message }, { status: 500 });
    }
}
