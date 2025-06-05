import { useState, useCallback, useEffect } from 'react';
import { fetchProposals } from '@/app/services/proposal';
import { Address, decodeFunctionData } from 'viem';
import droposalABI from '@/components/proposal/transactions/utils/droposalABI';
import { DAO_ADDRESSES } from '@/utils/constants';
import { Proposal } from '@/app/services/proposal';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Define interface for decoded calldata
export interface DecodedCalldata {
  name: string;
  symbol: string;
  editionSize: string;
  royaltyBPS: string;
  fundsRecipient: Address;
  defaultAdmin: Address;
  saleConfig: unknown;
  description: string;
  imageURI: string;
  animationURI: string;
}

// Extended proposal interface that includes decodedCalldatas
export interface ExtendedProposal extends Proposal {
  decodedCalldatas?: DecodedCalldata[];
}

// Hook configuration options
interface UseDroposalsOptions {
  limit?: number;
  autoFetch?: boolean;
  targetAddress?: string;
}

// Hook return type
interface UseDroposalsReturn {
  droposals: ExtendedProposal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  tokenCreated: string | null;
}

const DEFAULT_TARGET_ADDRESS = '0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c';

// Utility function to format URI (moved outside for better performance)
const formatURI = (uri: string): string => {
  if (!uri) return '';
  const trimmedUri = uri.trim();
  if (/^ipfs:\/\//.test(trimmedUri)) {
    return `/ipfs/${trimmedUri.slice(7)}`; // Use the proxy path
  }
  return uri;
};

export const useDroposals = (options: UseDroposalsOptions = {}): UseDroposalsReturn => {
  const {
    limit = 10,
    autoFetch = true,
    targetAddress = DEFAULT_TARGET_ADDRESS,
  } = options;

  const [droposals, setDroposals] = useState<ExtendedProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCreated, setTokenCreated] = useState<string | null>(null);

  // Reset tokenCreated when switching from single proposal mode to multi-proposal mode
  useEffect(() => {
    if (limit !== 1 && tokenCreated) {
      setTokenCreated(null);
    }
  }, [limit, tokenCreated]);

  // Function to fetch transaction receipt and extract token address
  const fetchTokenAddress = useCallback(async (transactionHash: string): Promise<string | null> => {
    if (!transactionHash) return null;

    try {
      const etherscanClient = createPublicClient({
        chain: base,
        transport: http(),
      });

      const hash = transactionHash.startsWith('0x')
        ? (transactionHash as Address)
        : (`0x${transactionHash}` as Address);

      const receipt = await etherscanClient.getTransactionReceipt({ hash });

      // Extract the created token address from the logs if available
      if (receipt.logs && receipt.logs.length > 0) {
        return receipt.logs[0].address;
      }
    } catch (error) {
      console.error('Failed to fetch transaction receipt:', error);
    }

    return null;
  }, []);

  const fetchAndDecodeProposals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedProposals = await fetchProposals(
        DAO_ADDRESSES.token,
        'proposalNumber',
        'desc',
        limit,
        { targets_contains: [targetAddress], executed: true },
        true
      );

      const decodedProposals = fetchedProposals.map((proposal) => {
        const rawCalldatas = proposal.calldatas;
        const calldatasArray =
          typeof rawCalldatas === 'string'
            ? rawCalldatas.split(':')
            : rawCalldatas;
        
        const normalizedCalldatas = calldatasArray.map((calldata: string) =>
          calldata === '0x' || calldata === '0' ? '0x' : calldata
        );

        const decodedCalldatas = normalizedCalldatas.map((calldata: string) => {
          if (!calldata || calldata.length < 8) return null;

          let finalCalldata = calldata;
          if (!finalCalldata.startsWith('0x')) {
            finalCalldata = '0x' + finalCalldata;
          }

          try {
            const { args } = decodeFunctionData({
              abi: droposalABI,
              data: finalCalldata as `0x${string}`,
            });
            
            const [
              name,
              symbol,
              editionSize,
              royaltyBPS,
              fundsRecipient,
              defaultAdmin,
              saleConfig,
              description,
              animationURI,
              imageURI,
            ] = args as [
              string,
              string,
              bigint,
              number,
              Address,
              Address,
              unknown,
              string,
              string,
              string,
            ];

            return {
              name,
              symbol,
              editionSize: editionSize.toString(),
              royaltyBPS: (royaltyBPS / 100).toFixed(2),
              fundsRecipient,
              defaultAdmin,
              saleConfig,
              description,
              imageURI: formatURI(imageURI),
              animationURI: formatURI(animationURI),
            };
          } catch {
            return null;
          }
        });

        return {
          ...proposal,
          descriptionHash: proposal.descriptionHash || '0x0',
          decodedCalldatas: decodedCalldatas.filter((d) => d !== null),
        } as ExtendedProposal;
      });

      setDroposals(decodedProposals);
    } catch (err) {
      console.error('Error fetching proposals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch droposals');
    } finally {
      setLoading(false);
    }
  }, [limit, targetAddress]);

  // Separate effect to fetch token address only for single proposal requests
  useEffect(() => {
    if (droposals.length > 0 && limit === 1 && !tokenCreated) {
      const firstProposal = droposals[0];
      if (firstProposal.transactionHash) {
        fetchTokenAddress(firstProposal.transactionHash).then((address) => {
          if (address) {
            setTokenCreated(address);
          }
        });
      }
    }
  }, [droposals, limit, tokenCreated]); // Removed fetchTokenAddress from dependencies

  useEffect(() => {
    if (autoFetch) {
      fetchAndDecodeProposals();
    }
  }, [fetchAndDecodeProposals, autoFetch]);

  return {
    droposals,
    loading,
    error,
    refetch: fetchAndDecodeProposals,
    tokenCreated,
  };
};
