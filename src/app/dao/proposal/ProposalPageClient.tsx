'use client';

import sdk from '@farcaster/frame-sdk';
import { Proposal } from '@/app/services/proposal';
import PropdatesTimeline from '@/components/propdates/timeline';
import CancelProposal from '@/components/proposal/cancel';
import CastVote from '@/components/proposal/castVote';
import ExecuteProposal from '@/components/proposal/execute';
import ProposalDescriptionContent from '@/components/proposal/ProposalDescriptionContent';
import ProposalTransactionsContent from '@/components/proposal/ProposalTransactionsContent';
import ProposalVotesContent from '@/components/proposal/ProposalVotesContent';
import QueueProposal from '@/components/proposal/queue';
import ProposalStatus from '@/components/proposal/status';
import { Tooltip } from '@/components/ui/tooltip';
import { FormattedAddress } from '@/components/utils/names';
import { Editor, PropDateInterface } from '@/utils/database/interfaces';
import {
  Box,
  Container,
  Heading,
  HStack,
  Icon,
  IconButton,
  Stack,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useCallback, useEffect, useState } from 'react';
import { FaEthereum } from 'react-icons/fa6';
import {
  LuArchive,
  LuArrowLeft,
  LuArrowRight,
  LuScroll,
  LuVote,
} from 'react-icons/lu';
import { ProposalProvider } from '@/contexts/ProposalContext';

interface ProposalPageClientProps {
  proposal: Proposal;
  proposalNumber: number;
  latestProposalNumber: number;
  propdates: PropDateInterface[] | null;
  editors: Editor[] | null;
}

const useTabNavigation = (initialTab = 'description') => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabMap = ['description', 'votes', 'transactions', 'propdates'];
  const tabFromQuery = searchParams?.get('t') || initialTab;
  const initialTabIndex =
    tabMap.indexOf(tabFromQuery) >= 0 ? tabMap.indexOf(tabFromQuery) : 0;

  const [activeTab, setActiveTab] = useState(initialTabIndex);

  useEffect(() => {
    const tabIndex = tabMap.indexOf(tabFromQuery);
    setActiveTab(tabIndex >= 0 ? tabIndex : 0);
  }, [tabFromQuery, tabMap]);

  const handleTabChange = useCallback(
    (details: { value: string }) => {
      const tabValue = details.value;
      setActiveTab(tabMap.indexOf(tabValue));
      router.replace(`?t=${tabValue}`, { scroll: false });
    },
    [router, tabMap]
  );

  return {
    activeTab,
    tabMap,
    handleTabChange,
  };
};

const VoteCounter = memo(
  ({
    label,
    votes,
    positiveColor,
  }: {
    label: string;
    votes: number;
    positiveColor: string;
  }) => (
    <Box borderWidth={1} borderRadius='md' px={4} py={2} w='full'>
      <Heading size='md'>{label}</Heading>
      <Text fontWeight='bold' color={votes > 0 ? positiveColor : 'fg.subtle'}>
        {votes}
      </Text>
    </Box>
  )
);
VoteCounter.displayName = 'VoteCounter';

const VoteCounters = memo(({ proposal }: { proposal: Proposal }) => (
  <HStack
    data-state='open'
    _open={{
      animation: 'fade-in 500ms ease-out',
    }}
  >
    <VoteCounter
      label='For'
      votes={proposal.forVotes}
      positiveColor='green.500'
    />
    <VoteCounter
      label='Against'
      votes={proposal.againstVotes}
      positiveColor='red.500'
    />
    <VoteCounter
      label='Abstain'
      votes={proposal.abstainVotes}
      positiveColor='gray.500'
    />
  </HStack>
));
VoteCounters.displayName = 'VoteCounters';

const ProposalMetadata = memo(({ proposal }: { proposal: Proposal }) => (
  <Stack
    direction={{ base: 'column', md: 'row' }}
    data-state='open'
    _open={{
      animation: 'fade-in 600ms ease-out',
    }}
  >
    <Box
      borderWidth={1}
      borderRadius='md'
      px={4}
      py={2}
      w='full'
      bg='bg.subtle'
      textAlign={{ base: 'center', md: 'left' }}
    >
      <Heading size='md'>Threshold</Heading>
      <Text fontWeight={'medium'} color='fg.subtle'>
        {proposal.quorumVotes} votes
      </Text>
    </Box>
    <Box
      borderWidth={1}
      borderRadius='md'
      px={4}
      py={2}
      w='full'
      bg='bg.subtle'
      textAlign={{ base: 'center', md: 'left' }}
    >
      <Heading size='md'>Ending</Heading>
      <Text fontWeight={'medium'} color='fg.subtle'>
        {new Date(parseInt(proposal.voteEnd) * 1000).toLocaleString()}
      </Text>
    </Box>
    <Box
      borderWidth={1}
      borderRadius='md'
      px={4}
      py={2}
      w='full'
      bg='bg.subtle'
      textAlign={{ base: 'center', md: 'left' }}
    >
      <Heading size='md'>Snapshot</Heading>
      <Text fontWeight={'medium'} color='fg.subtle'>
        #{proposal.snapshotBlockNumber}
      </Text>
    </Box>
  </Stack>
));
ProposalMetadata.displayName = 'ProposalMetadata';

const ProposalHeader = memo(
  ({
    proposalNumber,
    latestProposalNumber,
    proposal,
  }: {
    proposalNumber: number;
    latestProposalNumber: number;
    proposal: Proposal;
  }) => (
    <>
      <Stack
        direction={{ base: 'column', md: 'row' }}
        justify='space-between'
        w='full'
        data-state='open'
        _open={{
          animation: 'fade-in 300ms ease-out',
        }}
      >
        <HStack>
          {proposalNumber > 1 && (
            <Tooltip content='Previous Proposal'>
              <Link href={`/dao/proposal/${proposalNumber - 1}`}>
                <IconButton
                  size={'xs'}
                  variant={'ghost'}
                  aria-label='Previous proposal'
                >
                  <LuArrowLeft />
                </IconButton>
              </Link>
            </Tooltip>
          )}
          <Heading size='md' as='h2'>
            Proposal {proposalNumber}
          </Heading>
          {proposalNumber < latestProposalNumber && (
            <Tooltip content='Next Proposal'>
              <Link href={`/dao/proposal/${proposalNumber + 1}`}>
                <IconButton
                  size={'xs'}
                  variant={'ghost'}
                  aria-label='Next proposal'
                >
                  <LuArrowRight />
                </IconButton>
              </Link>
            </Tooltip>
          )}
        </HStack>

        <HStack>
          <ProposalStatus proposal={proposal} />
          <FormattedAddress address={proposal.proposer} />
        </HStack>
      </Stack>

      <Heading
        size={{ base: '2xl', md: '4xl' }}
        as='h1'
        data-state='open'
        _open={{
          animation: 'fade-in 400ms ease-out',
        }}
      >
        {proposal.title || 'No Title Available'}
      </Heading>
    </>
  )
);
ProposalHeader.displayName = 'ProposalHeader';

const ProposalTabs = memo(
  ({
    activeTab,
    tabMap,
    handleTabChange,
    proposal,
    propdates,
    setPropdates,
    editors,
  }: {
    activeTab: number;
    tabMap: string[];
    handleTabChange: (details: { value: string }) => void;
    proposal: Proposal;
    propdates: PropDateInterface[];
    setPropdates: React.Dispatch<React.SetStateAction<PropDateInterface[]>>;
    editors: Editor[];
  }) => (
    <Box
      shadow={'sm'}
      w={'full'}
      padding={4}
      pt={2}
      rounded={'md'}
      _dark={{ borderColor: 'yellow', borderWidth: 1 }}
    >
      <Tabs.Root
        value={tabMap[activeTab]}
        onValueChange={handleTabChange}
        w='full'
        gap={0}
        fitted
        lazyMount
        size={'sm'}
      >
        <Tabs.List>
          <Tabs.Trigger
            value='description'
            display='flex'
            alignItems='center'
            border={0}
          >
            <Icon asChild display={{ base: 'none', md: 'block' }}>
              <LuScroll />
            </Icon>
            <Text fontSize={'xs'}>Description</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value='votes' display='flex' alignItems='center'>
            <Icon asChild display={{ base: 'none', md: 'block' }}>
              <LuVote />
            </Icon>
            <Text fontSize={'xs'}>Votes</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value='transactions' display='flex' alignItems='center'>
            <Icon asChild display={{ base: 'none', md: 'block' }}>
              <FaEthereum />
            </Icon>
            <Text fontSize={'xs'}>Transactions</Text>
          </Tabs.Trigger>
          <Tabs.Trigger value='propdates' display='flex' alignItems='center'>
            <Icon asChild display={{ base: 'none', md: 'block' }}>
              <LuArchive />
            </Icon>
            <Text fontSize={'xs'}>Propdates</Text>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value='description' pt={2}>
          <ProposalDescriptionContent proposal={proposal} />
        </Tabs.Content>
        <Tabs.Content value='votes' pt={2}>
          <ProposalVotesContent proposal={proposal} />
        </Tabs.Content>
        <Tabs.Content value='transactions' pt={2}>
          <ProposalTransactionsContent proposal={proposal} />
        </Tabs.Content>
        <Tabs.Content value='propdates' pt={2}>
          <PropdatesTimeline
            setPropdates={setPropdates}
            proposal={proposal}
            propdates={propdates}
            editors={editors}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  )
);
ProposalTabs.displayName = 'ProposalTabs';

export default function ProposalPageClient({
  proposal: defaultProposal,
  proposalNumber,
  latestProposalNumber,
  propdates: defaultPropdates = [],
  editors = [],
}: ProposalPageClientProps) {
  const [proposal, setProposal] = useState<Proposal>(defaultProposal);
  const [propdates, setPropdates] = useState<PropDateInterface[]>(
    defaultPropdates || []
  );

  const { activeTab, tabMap, handleTabChange } = useTabNavigation();

  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <ProposalProvider
      initialProposal={defaultProposal}
      initialProposalNumber={proposalNumber}
      initialDescriptionHash={defaultProposal.descriptionHash}
      initialBlockNumber={defaultProposal.snapshotBlockNumber} // Use snapshotBlockNumber instead of blockNumber
      initialPropdates={defaultPropdates || []} // Handle null case
    >
      <Container maxW={'breakpoint-lg'} p={0}>
        <VStack gap={4} align={'start'} w='full'>
          {/* Proposal Details */}
          <Box
            shadow='sm'
            w='full'
            padding={4}
            rounded='md'
            display='flex'
            flexDirection='column'
            gap={2}
            _dark={{ borderColor: 'yellow', borderWidth: 1 }}
          >
            <ProposalHeader
              proposalNumber={proposalNumber}
              latestProposalNumber={latestProposalNumber}
              proposal={proposal}
            />

            <VoteCounters proposal={proposal} />
            <ProposalMetadata proposal={proposal} />

            <CastVote proposal={proposal} setProposal={setProposal} />
            <QueueProposal proposal={proposal} setProposal={setProposal} />
            <ExecuteProposal proposal={proposal} setProposal={setProposal} />
            <CancelProposal proposal={proposal} setProposal={setProposal} />
          </Box>

          {/* Tabs */}
          <ProposalTabs
            activeTab={activeTab}
            tabMap={tabMap}
            handleTabChange={handleTabChange}
            proposal={proposal}
            propdates={propdates}
            setPropdates={setPropdates}
            editors={editors || []}
          />
        </VStack>
      </Container>
    </ProposalProvider>
  );
}
