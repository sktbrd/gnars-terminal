import { PropDateInterface } from '@/utils/database/interfaces';
import {
  Badge,
  Box,
  Card,
  Code,
  HStack,
  Link,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Address } from 'viem';
import EnsAvatar from '../ethereum/ens';
import Markdown from '../proposal/markdown';
import { FormattedAddress } from '../utils/ethereum';
import PropdatesLike from './like';
import { default as NextLink } from 'next/link';
import { Proposal } from '@/app/services/proposal';

interface PropdatesContentCardProps {
  propdates: PropDateInterface[];
  proposals: Proposal[];
}

export default function PropdatesContentCardList({
  propdates,
  proposals,
}: PropdatesContentCardProps) {
  return (
    <Stack gap={2} w='full'>
      {propdates.map((propdate) => {
        const proposal = proposals.filter(
          (proposal) => proposal.proposalId === propdate.proposal.id
        )[0];
        return (
          <PropdatesContentCardContent
            key={propdate.id}
            propdate={propdate}
            proposal={proposal}
          />
        );
      })}
    </Stack>
  );
}

export function PropdatesContentCardContent({
  propdate,
  proposal,
}: {
  propdate: PropDateInterface;
  proposal?: Proposal;
}) {
  return (
    <Card.Root size='md' borderRadius='lg' variant='outline' w={'full'}>
      <Card.Body p={4}>
        <HStack gap={2} align='stretch'>
          <VStack gap={2} align='stretch' w='full'>
            <HStack justify={'space-between'} w='full'>
              <HStack>
                <EnsAvatar address={propdate.author.e_address as Address} />
                <FormattedAddress address={propdate.author.e_address} />
                {proposal && (
                  <Text color={'fg.subtle'}>
                    in{' '}
                    <Link asChild>
                      <NextLink
                        href={`/dao/proposal/${proposal?.proposalNumber}`}
                      >
                        proposal {proposal?.proposalNumber}
                      </NextLink>
                    </Link>
                  </Text>
                )}
              </HStack>
              <Text color='fg.subtle'>
                {new Date(propdate.created_at).toLocaleDateString()}
              </Text>
            </HStack>
            <Box
              bg='gray.100'
              _dark={{ bg: 'bg.emphasized' }}
              p={3}
              borderRadius='md'
              overflow='hidden'
            >
              <Markdown text={propdate.text} />
            </Box>
            <HStack w={'full'} justify={'end'}>
              <PropdatesLike propdate={propdate} />
            </HStack>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
}
