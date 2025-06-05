'use client';
import { ProposalWithThumbnail } from '@/app/services/proposal';
import PropdatesContentCardList from '@/components/propdates/contentCard';
import { Button, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';

interface PropdatesClientComponentProps {
  propdates: any;
  proposals: ProposalWithThumbnail[];
}

export default function PropdatesClientComponent({
  propdates,
  proposals,
}: PropdatesClientComponentProps) {
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    null
  );

  // If a proposal is selected, show only its propdates; else show all
  const filteredPropdates = selectedProposalId
    ? propdates?.data?.filter(
        (pd: { proposal: { id: string } }) =>
          pd.proposal.id === selectedProposalId
      )
    : propdates?.data;

  // Does this proposal have any matching propdates at all?
  const hasPropdates = (proposalId: string) =>
    propdates?.data?.some(
      (pd: { proposal: { id: string } }) => pd.proposal.id === proposalId
    );

  return (
    <VStack gap={4} p={4} w={'100%'} mt={{ base: 4, md: 0 }}>
      <Heading size={'2xl'}>Reports (propdates)</Heading>
      <Text fontSize='lg' color='gray.600' textAlign='center'>
        View detailed updates for past proposals. Filter by proposal or see all
        reports.
      </Text>
      {/* -- Sidebar -- */}
      <HStack maxW={'100%'} overflowX={{ base: 'scroll', md: 'auto' }} gap={2}>
        <Button
          colorScheme='yellow'
          onClick={() => setSelectedProposalId(null)}
          variant={selectedProposalId ? 'outline' : 'solid'}
        >
          All Proposals
        </Button>

        {proposals.map((proposal) => {
          const isActive = hasPropdates(proposal.proposalId);
          if (!isActive) return null;
          return (
            <Button
              key={proposal.proposalId}
              colorScheme='yellow'
              variant={
                selectedProposalId === proposal.proposalId ? 'solid' : 'outline'
              }
              onClick={() => setSelectedProposalId(proposal.proposalId)}
            >
              #{proposal.proposalNumber}
            </Button>
          );
        })}
      </HStack>
      {filteredPropdates && filteredPropdates.length > 0 ? (
        <PropdatesContentCardList
          _propdates={filteredPropdates}
          proposals={proposals}
        />
      ) : (
        <VStack gap={4} w={'100%'} align='center'>
          <Text fontSize='lg' color='gray.600'>
            No propdates yet :/
          </Text>
          <Button
            colorScheme='yellow'
            onClick={() => setSelectedProposalId(null)}
          >
            Go Back to All Proposals
          </Button>
        </VStack>
      )}
    </VStack>
  );
}
