import { Proposal } from '@/app/services/proposal';
import { Badge } from '@chakra-ui/react';
import { ReactNode } from 'react';

export enum Status {
  CANCELED = 'Canceled',
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
  if (proposal.canceled) return Status.CANCELED;
  if (proposal.queued) return Status.QUEUED;
  if (proposal.executed) return Status.EXECUTED;
  if (proposal.vetoed) return Status.VETOED;

  const currentTime = new Date().getTime();
  const voteStartTime = parseInt(proposal.voteStart) * 1000;
  const voteEndTime = parseInt(proposal.voteEnd) * 1000;

  if (currentTime < voteStartTime) return Status.PENDING;
  if (currentTime >= voteStartTime && currentTime <= voteEndTime)
    return Status.ACTIVE;
  if (currentTime > voteEndTime) {
    if (proposal.forVotes === 0 || proposal.forVotes < parseInt(proposal.quorumVotes)) {
      return Status.DEFEATED;
    }
    return Status.SUCCEEDED;
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
    [Status.CANCELED]: 'red.200',
    [Status.QUEUED]: 'blue.200',
    [Status.EXECUTED]: 'purple.200',
    [Status.VETOED]: 'gray.200',
    [Status.PENDING]: 'gray.200',
    [Status.ACTIVE]: 'green.200',
    [Status.DEFEATED]: 'red.200',
    [Status.SUCCEEDED]: 'green.200',
    [Status.EXPIRED]: 'red.200',
  };

  return <StatusBox colorPalette={statusColors[status]}>{status}</StatusBox>;
}
