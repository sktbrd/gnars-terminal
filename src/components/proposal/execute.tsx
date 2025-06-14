'use client';

import { Proposal } from '@/app/services/proposal';
import { getProposalStatus, Status } from '@/components/proposal/status';
import { Button } from '@/components/ui/button';
import {
  useReadGovernorProposalEta,
  useWriteGovernorExecute,
} from '@/hooks/wagmiGenerated';
import { Text, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
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
  const [isExecutable, setisExecutable] = useState(false);

  useEffect(() => {
    if (proposalEta && proposalEta > 0n) {
      setisExecutable(proposal.executed || proposal.queued);
    } else {
      setisExecutable(
        proposal.executed || proposal.queued || proposalStatus === Status.QUEUED
      );
    }
  }, [proposalEta, address, proposal]);

  const execute = useWriteGovernorExecute();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: execute.data,
    });

  useEffect(() => {
    if (isConfirmed) {
      setProposal((proposal) => ({ ...proposal, executed: true }));
    }
  }, [isConfirmed]);

  const handleClick = async () => {
    try {
      await execute.writeContractAsync({
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

  if (Status.QUEUED !== proposalStatus || !address) {
    return null;
  }

  return (
    <VStack mt={2}>
      <Button
        w='full'
        variant='surface'
        colorPalette={'purple'}
        size='lg'
        loading={execute.isPending || isConfirming}
        onClick={handleClick}
        disabled={!isExecutable}
      >
        Execute proposal
      </Button>
      {proposal.expiresAt && isExecutable && (
        <Text fontSize={'xs'}>
          Time until proposal expires:{' '}
          <Countdown date={parseInt(proposal.expiresAt) * 1000} />
        </Text>
      )}
      {!isExecutable && proposalEta && proposalEta > 0n && (
        <Text fontSize={'xs'}>
          Time remaining before this proposal can be executed:{' '}
          <Countdown date={parseInt(proposalEta.toString()) * 1000} />
        </Text>
      )}
    </VStack>
  );
}

export default ExecuteProposal;
