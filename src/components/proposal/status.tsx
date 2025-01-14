import { Proposal } from '@/app/services/proposal';
import { Badge } from '@chakra-ui/react';
import { ReactNode } from 'react';

export enum Status {
  CANCELLED = 'Cancelled',
  QUEUED = 'Queued',
  EXECUTED = 'Executed',
  VETOED = 'Vetoed',
  PENDING = 'Pending',
  ACTIVE = 'Active',
  DEFEATED = 'Defeated',
  SUCCEEDED = 'Succeeded',
  EXPIRED = 'Expired',
}

export const getProposalStatus = (proposal: Proposal): Status => {
  const currentTime = new Date().getTime();

  if (proposal.expiresAt) {
    const voteExpireTime = parseInt(proposal.expiresAt) * 1000;
    if (currentTime > voteExpireTime) return Status.EXPIRED;
  }

  if (proposal.canceled) return Status.CANCELLED;
  if (proposal.executed) return Status.EXECUTED;
  if (proposal.vetoed) return Status.VETOED;
  if (proposal.queued) return Status.QUEUED;

  const voteStartTime = parseInt(proposal.voteStart) * 1000;
  const voteEndTime = parseInt(proposal.voteEnd) * 1000;

  if (currentTime < voteStartTime) return Status.PENDING;

  if (currentTime > voteStartTime && currentTime < voteEndTime)
    return Status.ACTIVE;

  if (currentTime > voteEndTime) {
    return proposal.forVotes > proposal.againstVotes &&
      proposal.forVotes > parseInt(proposal.quorumVotes)
      ? Status.SUCCEEDED
      : Status.DEFEATED;
  }

  return Status.EXPIRED;
};

interface StatusBoxProps {
  colorPalette: string;
  children: ReactNode;
}

const StatusBox = ({ colorPalette, children }: StatusBoxProps) => {
  return (
    <Badge bg={colorPalette} size={'sm'} variant={'solid'}>
      {children}
    </Badge>
  );
};

export default function ProposalStatus({ proposal }: { proposal: Proposal }) {
  const status = getProposalStatus(proposal);

  const statusColors: Record<Status, string> = {
    [Status.CANCELLED]: 'gray',
    [Status.QUEUED]: 'blue',
    [Status.EXECUTED]: 'purple',
    [Status.VETOED]: 'gray',
    [Status.PENDING]: 'gray',
    [Status.ACTIVE]: 'green',
    [Status.DEFEATED]: 'red',
    [Status.SUCCEEDED]: 'green',
    [Status.EXPIRED]: 'gray',
  };

  return <StatusBox colorPalette={statusColors[status]}>{status}</StatusBox>;
}
