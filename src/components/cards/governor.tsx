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
    1000
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
      {proposals.map((proposal: Proposal) => {
        const { forVotes, againstVotes, abstainVotes } = proposal;

        const totalVotes = forVotes + againstVotes + abstainVotes;

        const forPercentage =
          totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;
        const againstPercentage =
          totalVotes > 0 ? (againstVotes / totalVotes) * 100 : 0;
        const abstainPercentage =
          totalVotes > 0 ? (abstainVotes / totalVotes) * 100 : 0;
        return (
          <Box
            key={proposal.proposalId}
            borderWidth={1}
            rounded={'md'}
            p={4}
            mb={2}
            bg={'bg.subtle'}
            display={'flex'}
            gap={2}
            alignItems={'stretch'}
          >
            <Box
              w={3}
              bg='gray.200'
              rounded='xs'
              display='flex'
              flexDirection='column'
              overflow='hidden'
              alignSelf={'stretch'}
              mb={1}
            >
              <Box bg='green.400' height={`${forPercentage}%`} />
              <Box bg='yellow.400' height={`${abstainPercentage}%`} />
              <Box bg='red.400' height={`${againstPercentage}%`} />
            </Box>
            <VStack gap={1} align={'start'} flex={1}>
              <HStack gap={1}>
                <ProposalStatus proposal={proposal} />
                <FormattedAddress address={proposal.proposer} asLink={false} />
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
        );
      })}
    </Box>
  );
}

export default GovernorCard;
