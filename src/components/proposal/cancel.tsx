'use client';

import { Proposal } from '@/app/services/proposal';
import { getProposalStatus, Status } from '@/components/proposal/status';
import { Button } from '@/components/ui/button';
import {
  DialogActionTrigger,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useWriteGovernorCancel } from '@/hooks/wagmiGenerated';
import { isAddressEqualTo } from '@/utils/ethereum';
import { Dispatch, SetStateAction, useEffect } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';

interface CancelProposalProps {
  proposal: Proposal;
  setProposal: Dispatch<SetStateAction<Proposal>>;
}

function CancelProposal({ proposal, setProposal }: CancelProposalProps) {
  const { address } = useAccount();
  const proposalStatus = getProposalStatus(proposal);

  const write = useWriteGovernorCancel();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: write.data,
    });

  useEffect(() => {
    if (isConfirmed) {
      setProposal((proposal) => ({ ...proposal, canceled: true }));
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
    ![Status.ACTIVE, Status.PENDING].includes(proposalStatus) ||
    !isAddressEqualTo(proposal.proposer, address)
  ) {
    return null;
  }

  return (
    <DialogRoot size={'sm'} placement={'center'} motionPreset='slide-in-bottom'>
      <DialogTrigger asChild>
        <Button
          w='full'
          variant='ghost'
          colorPalette={'red'}
          size='lg'
          loading={write.isPending || isConfirming}
        >
          Cancel proposal
        </Button>
      </DialogTrigger>
      <DialogContent margin={4}>
        <DialogHeader pb={2}>
          <DialogTitle>Cancel proposal</DialogTitle>
        </DialogHeader>
        <DialogBody pb={2}>
          Are you sure? This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant='outline'>Cancel</Button>
          </DialogActionTrigger>
          <DialogActionTrigger asChild>
            <Button
              onClick={handleClick}
              colorPalette={'red'}
              variant={'surface'}
            >
              Yes, I'm sure
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export default CancelProposal;
