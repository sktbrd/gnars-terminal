import { Proposal } from '@/app/services/proposal';
import { Badge } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface StatusBoxProps {
  colorPalette: string;
  children: ReactNode;
}

const StatusBox = ({ colorPalette, children }: StatusBoxProps) => {
  return (
    <Badge colorPalette={colorPalette} size={'sm'} variant={'surface'}>
      {children}
    </Badge>
  );
};

export default function ProposalStatus({ proposal }: { proposal: Proposal }) {
  switch (true) {
    case proposal.canceled:
      return <StatusBox colorPalette='red'>Canceled</StatusBox>;
    case proposal.queued:
      return <StatusBox colorPalette='blue'>Queued</StatusBox>;
    case proposal.executed:
      return <StatusBox colorPalette='purple'>Executed</StatusBox>;
    case proposal.vetoed:
      return <StatusBox colorPalette='gray'>Vetoed</StatusBox>;
    case new Date().getTime() < parseInt(proposal.voteStart) * 1000:
      return <StatusBox colorPalette='gray'>Pending</StatusBox>;
    case new Date().getTime() > parseInt(proposal.voteStart) * 1000 &&
      new Date().getTime() < parseInt(proposal.voteEnd) * 1000:
      return <StatusBox colorPalette='green'>Active</StatusBox>;
    case new Date().getTime() > parseInt(proposal.voteEnd) * 1000 &&
      proposal.forVotes < parseInt(proposal.quorumVotes):
      return <StatusBox colorPalette='red'>Defeated</StatusBox>;
    case new Date().getTime() > parseInt(proposal.voteEnd) * 1000 &&
      proposal.forVotes > parseInt(proposal.quorumVotes):
      return <StatusBox colorPalette='green'>Succeeded</StatusBox>;
    case proposal.voteCount == 0:
      return <StatusBox colorPalette='red'>Expired</StatusBox>;
  }
}
