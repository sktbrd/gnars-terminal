'use client';

// Create Proposal Button

import {
  useReadGovernorProposalThreshold,
  useReadTokenGetVotes,
  useReadTokenTotalSupply,
} from '@/hooks/wagmiGenerated';
import { useEffect, useState } from 'react';
import { LuPencilLine } from 'react-icons/lu';
import { zeroAddress } from 'viem';
import { useAccount } from 'wagmi';
import { Button } from './button';
import { Tooltip } from './tooltip';

function checkIfProposalCanSubmitProposal() {
  const account = useAccount();
  const { data: votes } = useReadTokenGetVotes({
    args: [account.address || zeroAddress],
  });
  // const { data: threshold } = useReadGovernorProposalThreshold();
  const threshold = 10n;
  const [canSubmit, setCanSubmit] = useState(false);
  useEffect(() => {
    if (votes && threshold !== undefined) {
      setCanSubmit(votes >= threshold);
    }
  }, [votes, threshold]);
  console.log({ canSubmit, votes, threshold });
  return { canSubmit, votes, threshold };
}

export default function CreateProposalButton() {
  const { canSubmit, votes, threshold } = checkIfProposalCanSubmitProposal();
  return (
    <Tooltip
      content={`Token threshold not met, you have ${votes}/${threshold} votes`}
      disabled={canSubmit}
    >
      <Button variant='subtle' disabled={!canSubmit}>
        <LuPencilLine /> New proposal
      </Button>
    </Tooltip>
  );
}
