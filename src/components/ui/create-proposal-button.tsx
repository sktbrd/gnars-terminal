'use client';
import React, { useEffect, useState } from 'react';
import { Button, IconButton } from '@chakra-ui/react';
import { LuPencilLine } from 'react-icons/lu';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { useRouter } from 'next/navigation';
import {
  useReadGovernorGetVotes,
  useReadGovernorProposalThreshold,
} from '@/hooks/wagmiGenerated';

function useCanSubmitProposal() {
  const { address } = useAccount();
  const [canSubmit, setCanSubmit] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<BigInt | null>(null);

  useEffect(() => {
    const timestamp = Math.floor(Date.now() / 1000);
    setCurrentTimestamp(BigInt(timestamp));
  }, []);

  // Read votes dynamically
  const { data: votes } = useReadGovernorGetVotes({
    args:
      address && currentTimestamp
        ? [address as Address, currentTimestamp as bigint]
        : undefined,
  });

  // Read proposal threshold
  const { data: threshold } = useReadGovernorProposalThreshold();

  useEffect(() => {
    if (votes !== undefined && threshold !== undefined) {
      const canSubmitProposal = BigInt(votes) >= BigInt(threshold);
      setCanSubmit(canSubmitProposal);
    } else {
      console.log('Votes or threshold data is missing.');
    }
  }, [votes, threshold]);

  return canSubmit;
}

export default function CreateProposalButton() {
  const canSubmit = useCanSubmitProposal();
  const router = useRouter();

  const handleClick = () => {
    if (canSubmit) {
      router.push('/create-proposal');
    }
  };

  return (
    <IconButton
      size='sm'
      colorScheme='blue'
      variant='outline'
      disabled={!canSubmit}
      onClick={handleClick}
    >
      <LuPencilLine />
    </IconButton>
  );
}
