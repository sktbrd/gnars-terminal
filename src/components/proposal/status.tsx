import { Proposal } from '@/app/services/proposal';
import { Fragment } from 'react';
import { Box } from '@chakra-ui/react';

export default function ProposalStatus({ proposal }: { proposal: Proposal }) {
  switch (true) {
    case proposal.canceled:
      return (
        <Box
          bg='red.100'
          color='red.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Canceled
        </Box>
      );
    case proposal.queued:
      return (
        <Box
          bg='blue.100'
          color='blue.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Queued
        </Box>
      );
    case proposal.executed:
      return (
        <Box
          bg='purple.100'
          color='purple.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Executed
        </Box>
      );
    case proposal.vetoed:
      return (
        <Box
          bg='gray.100'
          color='gray.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Vetoed
        </Box>
      );
    case new Date().getTime() < parseInt(proposal.voteStart) * 1000:
      return (
        <Box
          bg='gray.100'
          color='gray.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Pending
        </Box>
      );
    case new Date().getTime() > parseInt(proposal.voteStart) * 1000 &&
      new Date().getTime() < parseInt(proposal.voteEnd) * 1000:
      return (
        <Box
          bg='green.100'
          color='green.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Active
        </Box>
      );
    case new Date().getTime() > parseInt(proposal.voteEnd) * 1000 &&
      proposal.forVotes < parseInt(proposal.quorumVotes):
      return (
        <Box
          bg='red.100'
          color='red.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Defeated
        </Box>
      );
    case new Date().getTime() > parseInt(proposal.voteEnd) * 1000 &&
      proposal.forVotes > parseInt(proposal.quorumVotes):
      return (
        <Box
          bg='green.100'
          color='green.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Succeeded
        </Box>
      );
    case proposal.voteCount == 0:
      return (
        <Box
          bg='red.100'
          color='red.700'
          p={1}
          px={2}
          rounded='md'
          w='28'
          textAlign='center'
        >
          Expired
        </Box>
      );
    default:
      return <Fragment />;
  }
}
