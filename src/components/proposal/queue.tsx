'use client';

import { Proposal } from '@/app/services/proposal';
import { getProposalStatus, Status } from '@/components/proposal/status';
import { Button } from '@/components/ui/button';
import { useWriteGovernorQueue } from '@/hooks/wagmiGenerated';
import { isAddressEqualTo } from '@/utils/ethereum';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

interface QueueProposalProps {
  proposal: Proposal;
  setProposal: Dispatch<SetStateAction<Proposal>>;
}

function QueueProposal({ proposal, setProposal }: QueueProposalProps) {
  const { address } = useAccount();
  const proposalStatus = getProposalStatus(proposal);

  const write = useWriteGovernorQueue();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: write.data,
    });

  useEffect(() => {
    if (isConfirmed) {
      setProposal((proposal) => ({ ...proposal, queued: true }));
    }
  }, [isConfirmed]);

  const handleClick = async () => {
    try {
      await write.writeContractAsync({ args: [proposal.proposalId] });
    } catch (error) {
      console.error(error);
    }
  };

  if (
    proposalStatus !== Status.SUCCEEDED ||
    !isAddressEqualTo(proposal.proposer, address)
  ) {
    return null;
  }

  return (
    <Button
      w='full'
      variant='subtle'
      colorPalette={'blue'}
      size='lg'
      loading={write.isPending || isConfirming}
      onClick={handleClick}
    >
      Queue proposal
    </Button>
  );
}

export default QueueProposal;
