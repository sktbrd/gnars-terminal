import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { Address, parseEther } from 'viem';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';

type MintButtonProps = {
    tokenCreated: string | null;
    quantity?: number;
    comment: string; // New comment prop
};

export default function MintButton({
    tokenCreated,
    quantity = 1,
    comment = "",
}: MintButtonProps) {
    const { address } = useAccount();
    const [isPending, setIsPending] = useState(false);

    // Read sales configuration
    const salesConfig = useReadContract({
        address: tokenCreated as Address,
        abi: zoraMintAbi,
        functionName: 'salesConfig',
        args: []
    });

    // Function to get price information from salesConfig
    const getPriceInfo = () => {
        if (salesConfig.data && salesConfig.data.length > 0) {
            const pricePerTokenInWei = salesConfig.data[0] as bigint; // Price per token in wei
            const pricePerTokenInEth = Number(pricePerTokenInWei) / 1e18; // Convert to ETH for display
            const totalPriceInEth = pricePerTokenInEth * quantity; // Total price in ETH

            console.log('[MintButton] Price Info:', {
                pricePerTokenInWei,
                pricePerTokenInEth,
                totalPriceInEth,
                quantity
            });

            return { pricePerTokenInWei, pricePerTokenInEth, totalPriceInEth };
        }
        console.warn('[MintButton] Sales configuration data is not available.');
        return null;
    };

    // Log props for debugging
    useEffect(() => {
        const priceInfo = getPriceInfo();
        console.log('[MintButton] Props:', {

            pricePerToken: priceInfo?.pricePerTokenInEth,
        });
    }, [tokenCreated, quantity, comment, address, salesConfig.data]);

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

    // Error handling
    const error = writeError || confirmError;

    // Log any errors in detail
    useEffect(() => {
        if (error) {
            console.error('[MintButton] Error details:', {
                errorName: error.name,
                errorMessage: error.message,
                errorCause: error.cause,
                errorStack: error.stack
            });
        }
    }, [error]);

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
            console.log('Value (in ETH):', priceInfo.totalPriceInEth);

            writeContract({
                address: tokenCreated as Address,
                abi: zoraMintAbi,
                functionName: 'purchaseWithComment',
                args: [BigInt(quantity), comment],
                value: 777000000000000n + BigInt(parseEther(priceInfo.totalPriceInEth.toString())) // Convert ETH to wei
                // value: parseEther('0.003') // Convert ETH to wei
                // value:  + 3000000000000000n // 777000000000000n == ZORA FEE
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
    );
}
