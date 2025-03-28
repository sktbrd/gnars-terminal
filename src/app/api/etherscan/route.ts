// API route to fetch and decode transaction logs from Etherscan for a given contract and block number.
// Uses the governorAbi to decode transaction input data and filters transactions related to the ZoraNFTreator contract.
// Extracts the descriptionHash and arguments from the decoded transaction details.
// The descriptionHash is used to match proposals on the collect moda page.

import DroposalABI from '@/components/proposal/transactions/utils/droposalABI';
import { governorAbi } from '@/hooks/wagmiGenerated';
import { NextResponse } from 'next/server';
import { http, createPublicClient, decodeFunctionData, Address } from 'viem';
import { base } from 'viem/chains';

const etherscanClient = createPublicClient({
    chain: base,
    transport: http(),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const contractAddress = searchParams.get('contractAddress');
    const startingBlock = searchParams.get('blockNumber');
    const eventTopic = searchParams.get('topic0') || '0x7b1bcf1ccf901a11589afff5504d59fd0a53780eed2a952adade0348985139e0'; // Default topic0

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
        let allEventLogs: any[] = [];
        let hasMoreLogs = true;

        // Fetch logs filtered by eventTopic
        while (hasMoreLogs) {
            const etherscanApiUrl = `https://api.etherscan.io/v2/api?chainid=8453&module=logs&action=getLogs&address=${contractAddress}&fromBlock=${currentBlock}&toBlock=latest&topic0=${eventTopic}&page=1&offset=${maxLogsPerRequest}&apikey=${etherscanApiKey}`;

            const response = await fetch(etherscanApiUrl);

            if (!response.ok) {
                console.error('Etherscan API Response Status:', response.status);
                throw new Error('Failed to fetch contract events from Etherscan');
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
                currentBlock = lastBlockNumber - 1;
            }
        }

        // Extract transaction hashes from logs
        const transactionHashes = allEventLogs.map((log: { transactionHash: string }) => log.transactionHash);

        // Fetch transaction details
        const transactions = await Promise.all(transactionHashes.map(async (hash: string) => {
            const transaction = await etherscanClient.getTransaction({
                hash: hash.startsWith('0x') ? hash as Address : `0x${hash}` as Address,
            });
            return transaction;
        }));

        // Decode transaction input data
        const decodedTransactions = await Promise.all(transactions.map(async (transaction: any) => {
            try {
                const decodedData = decodeFunctionData({
                    abi: governorAbi,
                    data: transaction.input,
                });
                return {
                    ...transaction,
                    decodedData,
                };
            } catch {
                return {
                    ...transaction,
                    decodedData: null,
                };
            }
        }));

        // Filter transactions related to the target contract
        const targetContractAddress = '0x58C3ccB2dcb9384E5AB9111CD1a5DEA916B0f33c';
        const relevantTransactions = decodedTransactions.filter((transaction: any) => {
            return (
                transaction.decodedData &&
                transaction.decodedData.args &&
                transaction.decodedData.args[0]?.includes(targetContractAddress)
            );
        });

        // Extract transaction hashes for relevant transactions
        const relevantTransactionHashes = relevantTransactions.map((transaction: any) => transaction.hash);

        // Fetch transaction receipts for relevant transactions
        const transactionReceipts = await Promise.all(relevantTransactionHashes.map(async (hash: string) => {
            const receipt = await etherscanClient.getTransactionReceipt({
                hash: hash.startsWith('0x') ? hash as Address : `0x${hash}` as Address,
            });
            console.log('Transaction Receipt:', { hash, logs: receipt.logs }); // Log transaction receipt
            return receipt;
        }));

        // Helper function to decode nested fields and convert BigInt to strings
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

        // Decode arguments and extract descriptionHash
        const decodedRelevantTransactions = relevantTransactions.map((transaction: any) => {
            const decodedArgs = transaction.decodedData.args.map((arg: any) => decodeNestedFields(arg));
            const descriptionHash = transaction.decodedData.args[3] || null;
            console.log('Description Hash:', { transactionHash: transaction.hash, descriptionHash }); // Log descriptionHash
            return {
                ...transaction,
                decodedData: {
                    ...transaction.decodedData,
                    args: decodedArgs,
                    descriptionHash,
                },
            };
        });

        // Return the transactions with decoded arguments and descriptionHash
        return NextResponse.json({ transactionDetails: decodedRelevantTransactions }, { status: 200 });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
