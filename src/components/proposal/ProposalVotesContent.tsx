import { Avatar } from '@/components/ui/avatar';
import { Box, Card, Code, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { FormattedAddress } from '../utils/names';
import { useState } from 'react';

export type VoteSupport = 'FOR' | 'AGAINST' | 'ABSTAIN';

interface Vote {
  voter: string;
  support: VoteSupport;
  weight: string;
  reason: string;
}

interface ProposalVotesContentProps {
  proposal: {
    votes: Vote[];
  };
}

export default function ProposalVotesContent({
  proposal,
}: ProposalVotesContentProps) {
  const [activeFilter, setActiveFilter] = useState<VoteSupport | 'ALL'>('ALL');

  const filteredVotes = proposal.votes.filter(
    (vote) => activeFilter === 'ALL' || vote.support === activeFilter
  );

  return (
    <Stack gap={4} px={2} w='full'>
      <HStack gap={2} wrap='wrap' justify='center' mt={4}>
        <Code
          as='button'
          variant='surface'
          size='lg'
          colorPalette='yellow'
          cursor='pointer'
          onClick={() => setActiveFilter('ALL')}
          opacity={activeFilter === 'ALL' ? 1 : 0.6}
          _hover={{ opacity: 1 }}
        >
          ALL
        </Code>
        <Code
          as='button'
          variant='surface'
          size='lg'
          colorPalette='green'
          cursor='pointer'
          onClick={() => setActiveFilter('FOR')}
          opacity={activeFilter === 'FOR' ? 1 : 0.6}
          _hover={{ opacity: 1 }}
        >
          FOR
        </Code>
        <Code
          as='button'
          variant='surface'
          size='lg'
          colorPalette='red'
          cursor='pointer'
          onClick={() => setActiveFilter('AGAINST')}
          opacity={activeFilter === 'AGAINST' ? 1 : 0.6}
          _hover={{ opacity: 1 }}
        >
          AGAINST
        </Code>
        <Code
          as='button'
          variant='surface'
          size='lg'
          colorPalette='gray'
          cursor='pointer'
          onClick={() => setActiveFilter('ABSTAIN')}
          opacity={activeFilter === 'ABSTAIN' ? 1 : 0.6}
          _hover={{ opacity: 1 }}
        >
          ABSTAIN
        </Code>
      </HStack>
      <Stack gap={2}>
        {filteredVotes.map((vote, index) => (
          <Card.Root key={index} size='md' borderRadius='lg' variant='outline'>
            <Card.Body>
              <VStack gap={3} align='stretch'>
                <HStack gap={4}>
                  <Avatar
                    size='md'
                    name={vote.voter}
                    src={`https://api.dicebear.com/5.x/identicon/svg?seed=${vote.voter}`} // Example avatar
                  />
                  <HStack wrap={{ base: 'wrap', md: 'nowrap' }} gap={1}>
                    <FormattedAddress address={vote.voter} />
                    <Text>voted</Text>
                    <Code
                      variant='surface'
                      size={'sm'}
                      colorPalette={
                        vote.support === 'FOR'
                          ? 'green'
                          : vote.support === 'AGAINST'
                            ? 'red'
                            : vote.support === 'ABSTAIN'
                              ? 'gray'
                              : 'yellow'
                      }
                    >
                      {vote.support}
                    </Code>
                    <Text>
                      with <b>{vote.weight}</b> vote
                      {parseInt(vote.weight) > 1 ? 's' : ''}
                    </Text>
                  </HStack>
                </HStack>
                {vote.reason && (
                  <Box
                    bg='gray.100'
                    _dark={{ bg: 'bg.emphasized' }}
                    p={3}
                    borderRadius='md'
                  >
                    <Text>{vote.reason}</Text>
                  </Box>
                )}
              </VStack>
            </Card.Body>
          </Card.Root>
        ))}
      </Stack>
    </Stack>
  );
}
