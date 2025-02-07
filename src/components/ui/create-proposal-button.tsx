'use client';

import {
  useReadGovernorGetVotes,
  useReadGovernorProposalThreshold,
} from '@/hooks/wagmiGenerated';
import { Button, useBreakpointValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LuPencilLine } from 'react-icons/lu';
import { Address } from 'viem';
import { useAccount } from 'wagmi';
import { Tooltip } from './tooltip';

function useCanSubmitProposal() {
  const { address } = useAccount();
  const [canSubmit, setCanSubmit] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<BigInt | null>(null);

  useEffect(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    setCurrentTimestamp(BigInt(timestamp));
  }, []);

  const { data: userVotes } = useReadGovernorGetVotes({
    args:
      address && currentTimestamp
        ? [address as Address, currentTimestamp as bigint]
        : undefined,
  });

  const { data: voteThreshold } = useReadGovernorProposalThreshold();

  console.log('userVotes', userVotes, 'voteThreshold', voteThreshold);

  useEffect(() => {
    if (userVotes !== undefined && voteThreshold !== undefined) {
      const canSubmitProposal = BigInt(userVotes) >= BigInt(voteThreshold);
      setCanSubmit(canSubmitProposal);
    }
  }, [userVotes, voteThreshold]);

  return { canSubmit, voteThreshold, userVotes };
}

export default function CreateProposalButton() {
  const { canSubmit, voteThreshold } = useCanSubmitProposal();
  const router = useRouter();
  const breakpoint = useBreakpointValue({ base: 'mobile', md: 'desktop' });

  const handleClick = () => {
    if (canSubmit) {
      router.push('/create-proposal');
    }
  };

  return (
    <Tooltip
      content={`You need ${voteThreshold?.toString()} votes to submit a proposal`}
      disabled={canSubmit || voteThreshold === undefined}
      showArrow
    >
      <Button
        size='sm'
        colorScheme='blue'
        variant='outline'
        disabled={!canSubmit}
        onClick={handleClick}
      >
        <LuPencilLine />
        {breakpoint === 'desktop' ? 'Write new proposal' : ''}
      </Button>
    </Tooltip>
  );
}
