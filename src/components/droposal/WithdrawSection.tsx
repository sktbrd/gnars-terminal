import { useState } from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import zoraMintAbi from '@/utils/abis/zoraNftAbi';
import { Address } from 'viem';
import { Button } from '../ui/button';

interface WithdrawSectionProps {
  contractAddress: Address;
  isContractOwner: boolean;
}

export const WithdrawSection: React.FC<WithdrawSectionProps> = ({
  contractAddress,
  isContractOwner,
}) => {
  const [withdrawHash, setWithdrawHash] = useState<`0x${string}` | null>(null);
  const [isPending, setPending] = useState(false);

  const {
    writeContract,
    isPending: isWritePending,
    error: writeError,
    data: hash,
  } = useWriteContract();

  const {
    isLoading: isWithdrawConfirming,
    isSuccess: isWithdrawConfirmed,
    error: withdrawConfirmError,
  } = useWaitForTransactionReceipt({ hash: withdrawHash ?? undefined });

  // Update withdrawHash when we get a new transaction hash
  if (hash && !withdrawHash && !isPending) {
    setWithdrawHash(hash);
  }

  if (!isContractOwner) {
    return null;
  }

  const handleWithdraw = async () => {
    setPending(true);
    try {
      if (!contractAddress) {
        console.error('No contract address for withdraw');
        setPending(false);
        return;
      }

      writeContract({
        address: contractAddress,
        abi: zoraMintAbi,
        functionName: 'withdraw',
        args: [],
      });
    } catch (err) {
      console.error('Error in handleWithdraw:', err);
      setPending(false);
    }
  };

  return (
    <Box
      borderWidth={1}
      display={'flex'}
      flexDir={'column'}
      alignItems='stretch'
      gap={3}
      rounded={'lg'}
      p={6}
      _dark={{ borderColor: 'yellow.400' }}
      mt={8}
    >
      <Heading size='md' mb={2}>
        Withdraw Funds
      </Heading>
      <Button
        colorScheme='orange'
        bg='secondary'
        color='primary'
        _hover={{ bg: 'secondary', opacity: 0.9 }}
        onClick={handleWithdraw}
        loading={isPending || isWritePending || isWithdrawConfirming}
        disabled={isPending || isWritePending || isWithdrawConfirming}
      >
        {isWithdrawConfirmed ? 'Withdrawn!' : 'Withdraw'}
      </Button>
      {writeError && (
        <Text color='red.400' mt={2}>
          Error: {writeError.message}
        </Text>
      )}
      {withdrawConfirmError && (
        <Text color='red.400' mt={2}>
          Transaction failed: {withdrawConfirmError.message}
        </Text>
      )}
      {isWithdrawConfirmed && withdrawHash && (
        <Text color='green.400' fontSize='sm' mt={2}>
          Successfully withdrawn!
          <a
            href={`https://basescan.org/tx/${withdrawHash}`}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              marginLeft: '4px',
              textDecoration: 'underline',
              color: 'inherit',
            }}
          >
            View on BaseScan
          </a>
        </Text>
      )}
    </Box>
  );
};
