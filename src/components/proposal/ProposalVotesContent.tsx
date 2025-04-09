import {
  Box,
  Card,
  Code,
  HStack,
  Stack,
  Text,
  VStack,
  Spinner,
  Image,
  Avatar as ChakraAvatar,
  Avatar,
} from '@chakra-ui/react';
import { FormattedAddress } from '../utils/names';
import { useState } from 'react';
import Markdown from './markdown';
import { useAvatar } from '@paperclip-labs/whisk-sdk/identity';
import { Address } from 'viem';

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

// Voter Avatar component with image fallback
function VoterAvatar({ address, size }: { address: Address; size: number }) {
  const { data: avatar, isLoading } = useAvatar({ address });

  return (
    <Avatar.Root>
      {isLoading ? (
        <Spinner size='md' />
      ) : (
        <>
          <Avatar.Image src={avatar || '/images/frames/icon.png'} />
          <Avatar.Fallback>{address}</Avatar.Fallback>
        </>
      )}
    </Avatar.Root>
  );
}

export default function ProposalVotesContent({
  proposal,
}: ProposalVotesContentProps) {
  const [activeFilter, setActiveFilter] = useState<VoteSupport | 'ALL'>('ALL');

  // Check if there are no votes at all
  const hasNoVotes = proposal.votes.length === 0;

  // Check if there are votes for each support type
  const hasForVotes = proposal.votes.some((vote) => vote.support === 'FOR');
  const hasAgainstVotes = proposal.votes.some(
    (vote) => vote.support === 'AGAINST'
  );
  const hasAbstainVotes = proposal.votes.some(
    (vote) => vote.support === 'ABSTAIN'
  );

  // Determine if all votes are of the same type
  const allSameVoteType =
    (hasForVotes && !hasAgainstVotes && !hasAbstainVotes) ||
    (!hasForVotes && hasAgainstVotes && !hasAbstainVotes) ||
    (!hasForVotes && !hasAgainstVotes && hasAbstainVotes);

  // Don't show filters if there are no votes or all votes are the same type
  const shouldShowFilters = !hasNoVotes && !allSameVoteType;

  const filteredVotes = proposal.votes.filter(
    (vote) => activeFilter === 'ALL' || vote.support === activeFilter
  );

  return (
    <Stack gap={4} px={2} w='full'>
      {shouldShowFilters && (
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
          {hasForVotes && (
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
          )}
          {hasAgainstVotes && (
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
          )}
          {hasAbstainVotes && (
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
          )}
        </HStack>
      )}
      <Stack gap={2}>
        {filteredVotes.map((vote, index) => (
          <Card.Root key={index} size='md' borderRadius='lg' variant='outline'>
            <Card.Body>
              <VStack gap={3} align='stretch'>
                <HStack gap={4}>
                  <VoterAvatar address={vote.voter as Address} size={40} />
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
                    <Markdown text={vote.reason} />
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
