import { fetchProposals } from '@/app/services/proposal';
import AccountCard from '@/components/cards/account';
import CastVote from '@/components/proposal/castVote';
import Markdown from '@/components/proposal/markdown';
import ProposalStatus from '@/components/proposal/status';
import { ColorModeButton } from '@/components/ui/color-mode';
import { FormattedAddress } from '@/components/utils/ethereum';
import { DAO_ADDRESSES } from '@/utils/constants';
import {
  Box,
  Center,
  Heading,
  HStack,
  IconButton,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BsGithub } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';
import { LuCheckSquare, LuFolder, LuUser } from 'react-icons/lu';
import { json } from 'stream/consumers';

// @fix React Markdown is not rendering with styles

interface ProposalPageProps {
  params: {
    proposal: string;
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const proposalNumber = parseInt(params.proposal);
  if (isNaN(proposalNumber)) {
    return notFound();
  }

  const proposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'asc',
    1,
    { proposalNumber },
    true
  );

  if (proposals.length === 0) {
    return notFound();
  }

  const proposal = proposals[0];

  return (
    <VStack gap={4} align={'start'}>
      <HStack w={'full'} justify={'space-between'}>
        <HStack>
          <Link href='/'>
            <IconButton variant={'ghost'} colorPalette={'black'} size={'sm'}>
              <FaArrowLeft style={{ background: 'none' }} />
            </IconButton>
          </Link>
          <Heading size={'4xl'} as='h1'>
            Proposal {params.proposal}
          </Heading>
        </HStack>
        <HStack>
          <Link href='https://github.com/r4topunk/gnars-terminal'>
            <IconButton variant={'outline'} colorPalette={'black'} size={'sm'}>
              <BsGithub style={{ background: 'none' }} />
            </IconButton>
          </Link>
          <ColorModeButton variant={'outline'} />
        </HStack>
      </HStack>
      <AccountCard />
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
        <HStack>
          <ProposalStatus proposal={proposal} />
          <FormattedAddress address={proposal.proposer} />
        </HStack>
        <Heading size={'2xl'} as='h2'>
          {proposal.title}
        </Heading>
        <HStack>
          <Box
            borderWidth={1}
            borderRadius={'md'}
            px={4}
            py={2}
            w={'full'}
            bg={'bg.subtle'}
          >
            <Heading size={'md'}>For</Heading>
            <Text
              fontWeight={'bold'}
              color={proposal.forVotes > 0 ? 'green.500' : 'fg.subtle'}
            >
              {proposal.forVotes}
            </Text>
          </Box>
          <Box
            borderWidth={1}
            borderRadius={'md'}
            px={4}
            py={2}
            w={'full'}
            bg={'bg.subtle'}
          >
            <Heading size={'md'}>Against</Heading>
            <Text
              fontWeight={'bold'}
              color={proposal.againstVotes > 0 ? 'red.500' : 'fg.subtle'}
            >
              {proposal.againstVotes}
            </Text>
          </Box>
          <Box
            key={proposal.proposalId}
            borderWidth={1}
            borderRadius={'md'}
            px={4}
            py={2}
            w={'full'}
            bg={'bg.subtle'}
          >
            <Heading size={'md'}>Abstain</Heading>
            <Text
              fontWeight={'bold'}
              color={proposal.abstainVotes > 0 ? 'yellow.500' : 'fg.subtle'}
            >
              {proposal.abstainVotes}
            </Text>
          </Box>
        </HStack>
        <CastVote proposal={proposal} />
      </Box>

      <Tabs.Root lazyMount defaultValue="description" variant={"enclosed"}>
        <Center>
          <Tabs.List>
            <Tabs.Trigger value="description">
              <LuUser />
              Description
            </Tabs.Trigger>
            <Tabs.Trigger value="votes">
              <LuFolder />
              Votes
            </Tabs.Trigger>
            <Tabs.Trigger value="transactions">
              <LuCheckSquare />
              Transactions
            </Tabs.Trigger>
          </Tabs.List>
        </Center>
        <Tabs.Content value="description">
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
            <Markdown text={proposal.description} />
          </Box>
        </Tabs.Content>
        <Tabs.Content value="votes">
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
            {proposal.votes.map((vote, index) => (
              <Box key={index} borderWidth={1} borderRadius={'md'} px={4} py={2} w={'full'} bg={'bg.subtle'}>
                <Text>Voter: {vote.voter}</Text>
                <Text>Support: {vote.support}</Text>
                <Text>Weight: {vote.weight}</Text>
                <Text>Reason: {vote.reason}</Text>
              </Box>
            ))}
          </Box>
        </Tabs.Content>
        <Tabs.Content value="transactions">
          <Box
            shadow={'sm'}
            maxW={'100%'}
            minW={'100%'}
            padding={4}
            rounded={'md'}
            _dark={{ borderColor: 'yellow', borderWidth: 1 }}
            display={'flex'}
            flexDirection={'column'}
            gap={2}
            flexWrap={'wrap'}
          >
            {proposal.calldatas}
          </Box>
        </Tabs.Content>


      </Tabs.Root>



    </VStack>
  );
}
