'use client';

import { Proposal } from '@/app/services/proposal';
import { getProposalStatus, Status } from '@/components/proposal/status';
import { Button } from '@/components/ui/button';
import {
  useReadGovernorProposalEta,
  useWriteGovernorExecute,
} from '@/hooks/wagmiGenerated';
import { isAddressEqualTo } from '@/utils/ethereum';
import { Text, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { Address } from 'viem';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { Countdown } from '../ui/countdown';

interface ExecuteProposalProps {
  proposal: Proposal;
  setProposal: Dispatch<SetStateAction<Proposal>>;
}

function ExecuteProposal({ proposal, setProposal }: ExecuteProposalProps) {
  const { address } = useAccount();
  const proposalStatus = getProposalStatus(proposal);
  const { data: proposalEta } = useReadGovernorProposalEta({
    args: [proposal.proposalId],
  });

  const write = useWriteGovernorExecute();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: write.data,
    });

  useEffect(() => {
    if (isConfirmed) {
      setProposal((proposal) => ({ ...proposal, executed: true }));
    }
  }, [isConfirmed]);

  const handleClick = async () => {
    try {
      write.writeContract({
        args: [
          proposal.targets as Address[],
          proposal.values.map((value) => BigInt(value)),
          proposal.calldatas.split(':') as Address[],
          proposal.descriptionHash,
          proposal.proposer,
        ],
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (
    Status.QUEUED !== proposalStatus ||
    proposalEta === 0n ||
    !isAddressEqualTo(proposal.proposer, address)
  ) {
    return null;
  }

  return (
    <VStack mt={2}>
      <Button
        w='full'
        variant='surface'
        colorPalette={'purple'}
        size='lg'
        loading={write.isPending || isConfirming}
        onClick={handleClick}
      >
        Execute proposal
      </Button>
      {proposal.expiresAt && (
        <Text fontSize={'xs'}>
          Time until proposal expires:{' '}
          <Countdown date={parseInt(proposal.expiresAt) * 1000} />
        </Text>
      )}
    </VStack>
  );
}

export default ExecuteProposal;
