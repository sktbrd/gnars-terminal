import { fetchProposals, Proposal } from '@/app/services/proposal';
import { DAO_ADDRESSES } from '@/utils/constants';
import { Box, Heading, HStack, VStack } from '@chakra-ui/react';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';
import ProposalStatus from '../proposal/status';
import { FormattedAddress } from '../utils/ethereum';
import { Link as ChakraLink } from '@chakra-ui/react';

interface GovernorCardProps {
  isDaoPage?: boolean;
}

async function GovernorCard(props: GovernorCardProps) {
  const { isDaoPage } = props;

  const proposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'desc',
    100
  );

  return (
    <Box
      shadow={'sm'}
      w={'full'}
      padding={4}
      rounded={'md'}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
      display={'flex'}
      flexDirection={'column'}
      gap={2}
    >
      {isDaoPage ? (
        <Heading as='h2'>Proposals</Heading>
      ) : (
        <Link href='/dao'>
          <HStack w={'full'} justify={'start'} gap={1}>
            <Heading as='h2'>Proposals</Heading>
            <FaArrowRight size={12} style={{ marginTop: '4px' }} />
          </HStack>
        </Link>
      )}
      {proposals.map((proposal: Proposal) => (
        <Box
          key={proposal.proposalId}
          borderWidth={1}
          borderRadius={'md'}
          p={4}
          mb={2}
          bg={'bg.subtle'}
        >
          <VStack gap={2} align={'start'}>
            <HStack>
              <ProposalStatus proposal={proposal} />
              <FormattedAddress address={proposal.proposer} />
            </HStack>
            <ChakraLink color={{ _light: 'black', _dark: 'white' }} asChild>
              <Link href={`/dao/proposal/${proposal.proposalNumber}`}>
                <Heading as='h3' size='md'>
                  #{proposal.proposalNumber}: {proposal.title}
                </Heading>
              </Link>
            </ChakraLink>
          </VStack>
        </Box>
      ))}
    </Box>
  );
}

export default GovernorCard;
