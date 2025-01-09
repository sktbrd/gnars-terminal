// Tokens and Minting transactions should be made to the contracts address of its respective tokens 
// TODO: understand how ETH transactions are simulated in tenderly

import { NextResponse } from 'next/server';
import { isAddress } from 'viem';
import { publicClient } from '@/utils/client';
import { prepareTransactionData } from '@/utils/transactionUtils';

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

export async function POST(req: Request) {
    try {
        const { type, details } = await req.json();
        console.log("Received simulation request:", type, details);

        // Validate request body
        if (!type || !details || !details.toAddress) {
            console.error("Invalid request body:", { type, details });
            return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
        }

        // Validate Ethereum address
        if (!isAddress(details.toAddress)) {
            console.error("Invalid Ethereum address:", details.toAddress);
            return NextResponse.json({ message: 'Invalid Ethereum address' }, { status: 400 });
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

        const body: SimulationRequestBody = {
            network_id: "8453",
            from: details.fromAddress,
            to: details.toAddress,
            input: details.calldata,
            value: details.value,
            gas: 648318, // Example gas value
            save: true,
            save_if_fails: true,
            simulation_type: "full",
            contract_abi: details.contractAbi,
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
