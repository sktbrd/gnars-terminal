// API route to fetch and decode transaction logs from Etherscan for a given contract and block number.
// Uses the governorAbi to decode transaction input data and filters transactions related to the ZoraNFTreator contract.
// Extracts the descriptionHash and arguments from the decoded transaction details.
// The descriptionHash is used to match proposals on the collect moda page.

import DroposalABI from '@/components/proposal/transactions/utils/droposalABI';
import { governorAbi } from '@/hooks/wagmiGenerated';
import { NextResponse } from 'next/server';
import { http, createPublicClient, decodeFunctionData, Address } from 'viem';
import { base } from 'viem/chains';

// Create a client outside of the handler function to be reused
const etherscanClient = createPublicClient({
    chain: base,
    transport: http(),
});

// Define type for event logs
type EventLog = {
    transactionHash: string;
    blockNumber: string;
    [key: string]: any;
};

// Define type for transaction
type Transaction = {
    hash: string;
    input: string;
    [key: string]: any;
};

// Helper function to recursively convert BigInt to strings
const convertBigIntToString = (data: any): any => {
    if (data === null || data === undefined) {
        return data;
    }

    if (typeof data === 'bigint') {
        return data.toString();
    }

    if (Array.isArray(data)) {
        return data.map(item => convertBigIntToString(item));
    }

    if (typeof data === 'object') {
        const result: Record<string, any> = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = convertBigIntToString(data[key]);
            }
        }
        return result;
    }

    return data;
};

// Helper function to decode nested fields
const decodeNestedFields = (data: any): any => {
    if (Array.isArray(data)) {
        return data.map((item) => decodeNestedFields(item));
    }
    if (typeof data === 'bigint') {
        return data.toString();
    }
    if (typeof data === 'string' && data.startsWith('0x')) {
        try {
            const decoded = decodeFunctionData({
                abi: DroposalABI,
                data: data as `0x${string}`,
            });
            return decoded;
        } catch {
            return data;
        }
    }
    return data;
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const startingBlock = searchParams.get('blockNumber');
    const eventTopic = searchParams.get('topic0') || '0x7b1bcf1ccf901a11589afff5504d59fd0a53780eed2a952adade0348985139e0';
    const descriptionHash = searchParams.get('descriptionHash');

    // Validate required parameters
    if (!contractAddress || !startingBlock) {
        return NextResponse.json({ error: 'Missing contractAddress or blockNumber' }, { status: 400 });
    }

    const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
    if (!etherscanApiKey) {
        return NextResponse.json({ error: 'Missing Etherscan API key in environment variables' }, { status: 500 });
    }

    try {
        const maxLogsPerRequest = 100;
        let currentBlock = parseInt(startingBlock);
        let allEventLogs: EventLog[] = [];
        let hasMoreLogs = true;

        // Fetch logs with pagination
        while (hasMoreLogs) {
            const etherscanApiUrl = `https://api.etherscan.io/v2/api?chainid=8453&module=logs&action=getLogs&address=${contractAddress}&fromBlock=${currentBlock}&toBlock=latest&topic0=${eventTopic}&page=1&offset=${maxLogsPerRequest}&apikey=${etherscanApiKey}`;

            const response = await fetch(etherscanApiUrl);

            if (!response.ok) {
                console.error('Etherscan API Response Status:', response.status);
                throw new Error(`Failed to fetch contract events from Etherscan: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData.status !== '1' || !responseData.result) {
                if (responseData.message === 'No records found') {
                    console.warn('Etherscan API Warning: No records found');
                    return NextResponse.json({ events: [], message: 'No records found for the given parameters' });
                }
                console.error('Etherscan API Error:', responseData.message || 'Unknown error');
                return NextResponse.json({ error: `Etherscan API Error: ${responseData.message || 'Unknown error'}` }, { status: 500 });
            }

            const eventLogs = responseData.result;
            allEventLogs = allEventLogs.concat(eventLogs);

            if (eventLogs.length < maxLogsPerRequest) {
                hasMoreLogs = false;
            } else {
                const lastBlockNumber = parseInt(eventLogs[eventLogs.length - 1].blockNumber);
                currentBlock = lastBlockNumber + 1; // Start from the next block
            }
        }

        // Extract unique transaction hashes from logs
        const uniqueTransactionHashes = [...new Set(allEventLogs.map(log => log.transactionHash))];

        // Fetch transaction details in parallel
        const transactions = await Promise.all(uniqueTransactionHashes.map(async (hash: string) => {
            const formattedHash = hash.startsWith('0x') ? hash as Address : `0x${hash}` as Address;
            try {
                return await etherscanClient.getTransaction({ hash: formattedHash });
            } catch (error) {
                console.error(`Failed to fetch transaction ${hash}:`, error);
                return null;
            }
        }));

        // Filter out any null transactions
        const validTransactions = transactions.filter(tx => tx !== null) as Transaction[];

        // Decode transaction input data in parallel
        const decodedTransactions = await Promise.all(validTransactions.map(async (transaction) => {
            try {
                const decodedData = decodeFunctionData({
                    abi: governorAbi,
                    data: transaction.input as Address,
                });
                return {
                    ...transaction,
                    decodedData,
                };
            } catch (error) {
                console.debug(`Could not decode transaction ${transaction.hash}:`, error);
                return {
                    ...transaction,
                    decodedData: null,
                };
            }
        }));

        // Filter transactions related to the target contract
        const targetContractAddress = '0x58C3ccB2dcb9384E5AB9111CD1a5DEA916B0f33c';
        const relevantTransactions = decodedTransactions.filter((transaction) => {
            return (
                transaction.decodedData &&
                transaction.decodedData.args &&
                Array.isArray(transaction.decodedData.args[0]) &&
                transaction.decodedData.args[0]?.includes(targetContractAddress)
            );
        });

        // Decode arguments and extract descriptionHash
        const decodedRelevantTransactions = relevantTransactions.map((transaction) => {
            const decodedArgs = transaction.decodedData?.args.map((arg: any) => decodeNestedFields(arg));
            const txDescriptionHash = transaction.decodedData?.args[3] || null;

            return {
                ...transaction,
                decodedData: {
                    ...transaction.decodedData,
                    args: decodedArgs,
                    descriptionHash: txDescriptionHash,
                },
            };
        });

        // Find transaction matching the provided descriptionHash
        let matchedTransaction = null;
        if (descriptionHash) {
            matchedTransaction = decodedRelevantTransactions.find((transaction) =>
                transaction.decodedData.descriptionHash === descriptionHash
            );

            if (matchedTransaction) {
                console.log('Found matching transaction:', matchedTransaction.hash);
            } else {
                console.log('No matching transaction found for descriptionHash:', descriptionHash);
            }
        }

        // Convert all BigInt values to strings before returning
        const safeTransactionDetails = convertBigIntToString(decodedRelevantTransactions);
        const safeMatchedTransaction = matchedTransaction ? convertBigIntToString(matchedTransaction) : null;

        // Return the transactions with decoded arguments and the matched transaction if any
        return NextResponse.json({
            transactionDetails: safeTransactionDetails,
            matchedTransaction: safeMatchedTransaction
        }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
