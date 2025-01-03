'use client';
import React, { useEffect, useState } from 'react';
import { Button } from '@chakra-ui/react';
import { LuPencilLine } from 'react-icons/lu';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { useRouter } from 'next/navigation'; // Use Next.js navigation
import { useReadGovernorGetVotes, useReadGovernorProposalThreshold } from '@/hooks/wagmiGenerated';

function useCanSubmitProposal() {
  const { address } = useAccount();
  const [canSubmit, setCanSubmit] = useState(false);
  const [currentTimestamp, setCurrentTimestamp] = useState<BigInt | null>(null);

  // Update the current timestamp
  useEffect(() => {
    const timestamp = Math.floor(Date.now() / 1000); // Convert to seconds
    setCurrentTimestamp(BigInt(timestamp));
  }, []);

  useEffect(() => {
    console.log(`Address: ${address}, Timestamp: ${currentTimestamp}`);
  }, [address, currentTimestamp]);

  // Read votes dynamically
  const { data: votes } = useReadGovernorGetVotes({
    args: address && currentTimestamp ? [address as Address, currentTimestamp as bigint] : undefined,
  });

  // Read proposal threshold
  const { data: threshold } = useReadGovernorProposalThreshold();

  useEffect(() => {
    console.log(`Votes: ${votes}, Threshold: ${threshold}`);
    if (votes !== undefined && threshold !== undefined) {
      const canSubmitProposal = BigInt(votes) >= BigInt(threshold);
      console.log(`Votes: ${votes}, Threshold: ${threshold}, Can Submit: ${canSubmitProposal}`);
      setCanSubmit(canSubmitProposal);
    } else {
      console.log('Votes or threshold data is missing.');
    }
  }, [votes, threshold]);

  return canSubmit;
}

export default function CreateProposalButton() {
  const canSubmit = useCanSubmitProposal();
  const router = useRouter(); // Initialize router

  const handleClick = () => {
    console.log(`Button clicked. Can submit: ${canSubmit}`);
    if (canSubmit) {
      console.log('Navigating to /create-proposal');
      router.push('/create-proposal'); // Navigate to the create proposal page
    }
  };

  return (
    <Button
      colorScheme="blue"
      variant="outline"
      disabled={!canSubmit}
      onClick={handleClick} // Handle navigation
    >
      <LuPencilLine />
    </Button>
  );
}

