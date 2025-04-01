import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSimulateContract } from 'wagmi';
import { Address, parseEther } from 'viem';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { useProposal } from '@/contexts/ProposalContext';

type MintButtonProps = {
    quantity?: number;
    comment: string;
};

export default function MintButton({
    quantity = 1,
    comment = "",
}: MintButtonProps) {
    const { tokenCreated } = useProposal();
    const { address } = useAccount();
    const [isPending, setIsPending] = useState(false);
    const [showSimulationResults, setShowSimulationResults] = useState(false);
    const [simulationValue, setSimulationValue] = useState<bigint | undefined>(undefined);

    // Read sales configuration - single instance
    const salesConfig = useReadContract({
        address: tokenCreated as Address,
        abi: zoraMintAbi,
        functionName: 'salesConfig',
        args: [],
    });

    // Fix: Correct function name and add quantity parameter
    const zoraFeeData = useReadContract({
        address: tokenCreated as Address,
        abi: zoraMintAbi,
        functionName: 'zoraFeeForAmount',
        args: [BigInt(quantity)],
    });

    // Fix: Use state for simulation parameters
    const simulateMint = useSimulateContract({
        address: tokenCreated as Address,
        abi: zoraMintAbi,
        functionName: 'purchaseWithComment',
        args: [BigInt(quantity), comment],
        value: simulationValue
    });

    const isSimulating = simulateMint.isLoading;
    const isSimulated = simulateMint.isSuccess;
    const simulationError = simulateMint.error;
    const simulationData = simulateMint.data;
    const isSimulatedError = simulationError && !isSimulated;

    // Log simulation data
    useEffect(() => {
        if (isSimulated) {
            console.log('[MintButton] Simulation successful:', simulationData);
        } else if (isSimulatedError) {
            console.error('[MintButton] Simulation error:', simulationError);
        }
    }, [isSimulated, isSimulatedError, simulationData, simulationError]);


    // Function to get price information from salesConfig
    const getPriceInfo = () => {
        if (salesConfig.data && salesConfig.data.length > 0) {
            const pricePerTokenInWei = salesConfig.data[0] as bigint; // Price per token in wei
            const pricePerTokenInEth = Number(pricePerTokenInWei) / 1e18; // Convert to ETH for display
            const totalPriceInEth = pricePerTokenInEth * quantity; // Total price in ETH

            return { pricePerTokenInWei, pricePerTokenInEth, totalPriceInEth };
        }
        console.warn('[MintButton] Sales configuration data is not available.');
        return null;
    };

    // Log contract sales config data for debugging
    useEffect(() => {
        const priceInfo = getPriceInfo();
        console.log('[MintButton] Contract sales config:', {
            pricePerToken: priceInfo?.pricePerTokenInEth,
            quantity,
            totalPrice: priceInfo?.totalPriceInEth,
            data: salesConfig.data
        });
    }, [tokenCreated, quantity, salesConfig.data]);

    // Log Zora fee when available
    useEffect(() => {
        if (zoraFeeData.data) {
            console.log('[MintButton] Zora fee data:', {
                recipient: zoraFeeData.data[0],
                fee: zoraFeeData.data[1]
            });
        }
    }, [zoraFeeData.data]);

    // Set up contract writing
    const {
        writeContract,
        isPending: isWritePending,
        error: writeError,
        data: hash
    } = useWriteContract();

    // Track transaction status
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError
    } = useWaitForTransactionReceipt({
        hash
    });

    // Combined loading state
    const isLoading = isWritePending || isConfirming || isPending;

    // Handle mint action
    const handleMint = async () => {
        if (!tokenCreated || !address) {
            console.warn('[MintButton] Cannot mint: missing tokenCreated or user address', {
                tokenCreated,
                address
            });
            return;
        }

        if (!salesConfig.data) {
            console.warn('[MintButton] Cannot mint: salesConfig data not loaded yet');
            return;
        }

        if (!zoraFeeData.data) {
            console.warn('[MintButton] Cannot mint: Zora fee data not loaded yet');
            return;
        }

        const priceInfo = getPriceInfo();
        if (!priceInfo) {
            console.warn('[MintButton] Cannot mint: price information not available');
            return;
        }

        // Ensure price is valid
        if (priceInfo.pricePerTokenInWei <= 0n) {
            console.error('[MintButton] Invalid price per token:', priceInfo.pricePerTokenInWei);
            return;
        }

        console.log('[MintButton] Starting mint process:', {
            tokenAddress: tokenCreated,
            recipient: address,
            quantity,
            comment,
            pricePerTokenInEth: priceInfo.pricePerTokenInEth,
            totalPriceInEth: priceInfo.totalPriceInEth
        });

        setIsPending(true);
        try {
            // Use the dynamically loaded Zora fee from the contract
            // zoraFeeForAmount returns a tuple of [recipient, fee]
            const zoraProtocolFee = zoraFeeData.data[1] as bigint;
            const mintPrice = BigInt(parseEther(priceInfo.totalPriceInEth.toString()));
            const totalValue = zoraProtocolFee + mintPrice;

            console.log('[MintButton] Payment details:', {
                protocolFeeRecipient: zoraFeeData.data[0],
                protocolFee: zoraProtocolFee.toString(),
                mintPrice: mintPrice.toString(),
                totalValue: totalValue.toString()
            });

            writeContract({
                address: tokenCreated as Address,
                abi: zoraMintAbi,
                functionName: 'purchaseWithComment',
                args: [BigInt(quantity), comment],
                value: totalValue
            });

            console.log('[MintButton] writeContract call completed, waiting for transaction...');
        } catch (err) {
            console.error('[MintButton] Exception during mint:', err);

            // Decode the error if possible
            if (err instanceof Error) {
                console.error('[MintButton] Error details:', {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                    cause: err.cause
                });

                // Check for specific errors
                if (err.message.includes('Purchase_WrongPrice')) {
                    const correctPriceMatch = err.message.match(/correctPrice: (\d+)/);
                    const correctPrice = correctPriceMatch ? BigInt(correctPriceMatch[1]) : null;

                    console.error('[MintButton] Price mismatch detected:', {
                        providedPrice: parseEther(priceInfo.totalPriceInEth.toString()),
                        correctPrice
                    });
                }
            }
        } finally {
            setIsPending(false);
            console.log('[MintButton] Mint process completed, isPending set to false');
        }
    };

    // Handle simulation action
    const handleSimulate = async () => {
        if (!tokenCreated || !address) {
            console.warn('[MintButton] Cannot simulate: missing tokenCreated or user address');
            return;
        }

        if (!salesConfig.data) {
            console.warn('[MintButton] Cannot simulate: salesConfig data not loaded yet');
            return;
        }

        if (!zoraFeeData.data) {
            console.warn('[MintButton] Cannot simulate: Zora fee data not loaded yet');
            return;
        }

        const priceInfo = getPriceInfo();
        if (!priceInfo) {
            console.warn('[MintButton] Cannot simulate: price information not available');
            return;
        }

        // Calculate the total cost including protocol fee
        const zoraProtocolFee = zoraFeeData.data[1] as bigint;
        const mintPrice = BigInt(parseEther(priceInfo.totalPriceInEth.toString()));
        const totalValue = zoraProtocolFee + mintPrice;

        // Update the simulation value and then trigger refetch
        setSimulationValue(totalValue);

        // Call refetch without arguments to use the updated state values
        simulateMint.refetch();

        setShowSimulationResults(true);
    };

    // Close the simulation results
    const handleCloseSimulation = () => {
        setShowSimulationResults(false);
    };

    // Log when hash is received
    useEffect(() => {
        if (hash) {
            console.log('[MintButton] Transaction hash received:', hash);
        }
    }, [hash]);

    // Log when transaction is confirmed
    useEffect(() => {
        if (isConfirmed) {
            console.log('[MintButton] Transaction confirmed successfully!');
        }
    }, [isConfirmed]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-2">
                <Button
                    onClick={handleSimulate}
                    disabled={!tokenCreated || isSimulating || isLoading}
                    variant="outline"
                >
                    {isSimulating ? 'Simulating...' : 'Simulate Mint'}
                </Button>
                <Button
                    onClick={handleMint}
                    disabled={!tokenCreated || isLoading || !salesConfig.data}
                    aria-label="Mint NFT"
                >
                    {isLoading ?
                        (isConfirming ? 'Confirming...' : 'Minting...') :
                        (isConfirmed ? 'Minted!' : 'Mint')}
                    {quantity > 1 ? ` (${quantity})` : ''}
                </Button>
            </div>

            {showSimulationResults && (
                <div className="border rounded-md p-4 mt-2 bg-slate-50 dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">Simulation Results</h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCloseSimulation}
                        >
                            Close
                        </Button>
                    </div>

                    {isSimulating && (
                        <p className="text-sm">Running simulation...</p>
                    )}

                    {isSimulated && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                            <p>✅ Simulation successful!</p>
                            <p className="mt-1">The transaction is likely to succeed when executed.</p>
                        </div>
                    )}

                    {isSimulatedError && (
                        <div className="text-sm text-red-600 dark:text-red-400">
                            <p>❌ Simulation failed:</p>
                            <pre className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-auto">
                                {simulationError?.message || 'Unknown error occurred'}
                            </pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
