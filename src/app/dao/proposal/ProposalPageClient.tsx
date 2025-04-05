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
  IconButton,
  Stack,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

// Extract the entire proposal details section into a memoized component
const ProposalDetails = memo(({
  proposal,
  proposalNumber,
  latestProposalNumber,
  setProposal
}: {
  proposal: Proposal;
  proposalNumber: number;
  latestProposalNumber: number;
  setProposal: React.Dispatch<React.SetStateAction<Proposal>>;
}) => {
  return (
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
  );
});
ProposalDetails.displayName = 'ProposalDetails';

// Optimize the useTabNavigation hook to prevent unnecessary re-renders
const useTabNavigation = (initialTab = 'description', hasVotes = true) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create dynamic tabMap based on whether votes exist
  const tabMap = useMemo(() => {
    const tabs = ['description'];
    if (hasVotes) tabs.push('votes');
    tabs.push('transactions', 'propdates');
    return tabs;
  }, [hasVotes]);

  // Extract query parameter only once
  const tabFromQuery = useMemo(() => searchParams?.get('t') || initialTab, [searchParams, initialTab]);

  // Calculate initial tab index only once
  const initialTabIndex = useMemo(() => {
    const index = tabMap.indexOf(tabFromQuery);
    return index >= 0 ? index : 0;
  }, [tabFromQuery, tabMap]);

  const [activeTab, setActiveTab] = useState(initialTabIndex);

  // Add reference to track manual tab changes to prevent loops
  const isManualTabChange = useRef(false);

  // Track last update time to avoid thrashing
  const lastUpdateTime = useRef(0);

  // Effect to handle URL changes
  useEffect(() => {
    const tabIndex = tabMap.indexOf(tabFromQuery);
    if (tabIndex >= 0 && tabIndex !== activeTab) {
      // Only update state if this wasn't triggered by a manual tab change
      if (!isManualTabChange.current) {
        setActiveTab(tabIndex);
      } else {
        isManualTabChange.current = false;
      }
    }
  }, [tabFromQuery, tabMap, activeTab]);

  // Optimize tab change with stable reference and rate limiting
  const handleTabChange = useCallback(
    (details: { value: string }) => {
      const tabValue = details.value;
      const newTabIndex = tabMap.indexOf(tabValue);
      const now = performance.now();

      // Rate limit tab changes (prevent accidental double-clicks or thrashing)
      if (now - lastUpdateTime.current < 100) {
        return;
      }

      lastUpdateTime.current = now;

      // Only update if the tab is actually changing
      if (newTabIndex !== activeTab) {
        // Mark this as a manual change to avoid loop with URL effect
        isManualTabChange.current = true;

        // Update UI immediately
        setActiveTab(newTabIndex);

        // Update URL synchronously for better coordination with state update
        router.replace(`?t=${tabValue}`, { scroll: false });
      }
    },
    [router, tabMap, activeTab]
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
              <Box>
                <Link href={`/dao/proposal/${proposalNumber - 1}`}>
                  <IconButton
                    size={'xs'}
                    variant={'ghost'}
                    aria-label='Previous proposal'
                  >
                    <LuArrowLeft />
                  </IconButton>
                </Link>
              </Box>
            </Tooltip>
          )}
          <Heading size='md' as='h2'>
            Proposal {proposalNumber}
          </Heading>
          {proposalNumber < latestProposalNumber && (
            <Tooltip content='Next Proposal'>
              <Box>
                <Link href={`/dao/proposal/${proposalNumber + 1}`}>
                  <IconButton
                    size={'xs'}
                    variant={'ghost'}
                    aria-label='Next proposal'
                  >
                    <LuArrowRight />
                  </IconButton>
                </Link>
              </Box>
            </Tooltip>
          )}
        </HStack>

        <HStack>
          <ProposalStatus proposal={proposal} />
          {/* Wrap FormattedAddress in a span to avoid p > div nesting */}
          <Box as="span">
            <FormattedAddress address={proposal.proposer} />
          </Box>
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
  }) => {
    // Track which tab content has been generated once
    const [generatedTabs, setGeneratedTabs] = useState<{ [key: string]: boolean }>({});
    const currentTabName = tabMap[activeTab];

    // Check if proposal has votes
    const hasVotes = useMemo(() => proposal.votes && proposal.votes.length > 0, [proposal]);

    // Create early access to tab content to improve perceived performance
    useEffect(() => {
      // Mark current tab as generated
      if (!generatedTabs[currentTabName]) {
        setGeneratedTabs(prev => ({ ...prev, [currentTabName]: true }));
      }

      // Schedule pre-generation of adjacenet tabs for faster perceived switching
      const timerId = setTimeout(() => {
        // Pre-generate the tabs before and after the current one
        const adjacentIndices = [
          (activeTab - 1 + tabMap.length) % tabMap.length, // Previous tab
          (activeTab + 1) % tabMap.length                  // Next tab
        ];

        adjacentIndices.forEach(idx => {
          const tabName = tabMap[idx];
          if (!generatedTabs[tabName]) {
            setGeneratedTabs(prev => ({ ...prev, [tabName]: true }));
          }
        });
      }, 200); // Shorter timeout for better responsiveness

      return () => clearTimeout(timerId);
    }, [activeTab, tabMap, generatedTabs, currentTabName]);

    // Lazy loading optimization for tab content
    const shouldRenderContent = (tabName: string) => {
      return generatedTabs[tabName] || tabMap[activeTab] === tabName;
    };

    // Memoize each tab's content with improved lazy loading
    const descriptionContent = useMemo(() => {
      if (!shouldRenderContent('description')) return null;
      return <ProposalDescriptionContent proposal={proposal} />;
    }, [proposal, shouldRenderContent('description')]);

    const votesContent = useMemo(() => {
      if (!shouldRenderContent('votes')) return null;
      return <ProposalVotesContent proposal={proposal} />;
    }, [proposal, shouldRenderContent('votes')]);

    const transactionsContent = useMemo(() => {
      if (!shouldRenderContent('transactions')) return null;
      return <ProposalTransactionsContent proposal={proposal} />;
    }, [proposal, shouldRenderContent('transactions')]);

    const propdatesContent = useMemo(() => {
      if (!shouldRenderContent('propdates')) return null;
      return <PropdatesTimeline
        setPropdates={setPropdates}
        proposal={proposal}
        propdates={propdates}
        editors={editors}
      />;
    }, [proposal, propdates, editors, setPropdates, shouldRenderContent('propdates')]);

    // Add an enhanced tab change handler with immediate visual feedback
    const enhancedHandleTabChange = useCallback((details: { value: string }) => {
      // Apply immediate visual feedback before waiting for state update
      const clickedTab = document.querySelector(`[data-value="${details.value}"]`);
      if (clickedTab) {
        clickedTab.classList.add('tab-clicked');
        // Remove the class after animation completes
        setTimeout(() => clickedTab.classList.remove('tab-clicked'), 200);
      }

      handleTabChange(details);
    }, [handleTabChange]);

    return (
      <Box
        shadow={'sm'}
        w={'full'}
        padding={4}
        pt={2}
        rounded={'md'}
        _dark={{ borderColor: 'yellow', borderWidth: 1 }}
        className="tabs-container"
      >
        <Tabs.Root
          value={tabMap[activeTab]}
          onValueChange={enhancedHandleTabChange}
          w='full'
          gap={0}
          fitted
          unmountOnExit={false} /* Keep content in DOM to avoid expensive remounts */
          size={'sm'}
        >
          <Tabs.List>
            <Tabs.Trigger
              value='description'
              display='flex'
              alignItems='center'
              border={0}
              data-value="description"
            >
              <LuScroll />
              <Text fontSize={'xs'}>Description</Text>
            </Tabs.Trigger>
            {tabMap.includes('votes') && (
              <Tabs.Trigger value='votes' display='flex' alignItems='center' data-value="votes">
                <LuVote />
                <Text fontSize={'xs'}>Votes</Text>
              </Tabs.Trigger>
            )}
            <Tabs.Trigger value='transactions' display='flex' alignItems='center' data-value="transactions">
              <FaEthereum />
              <Text fontSize={'xs'}>Transactions</Text>
            </Tabs.Trigger>
            <Tabs.Trigger value='propdates' display='flex' alignItems='center' data-value="propdates">
              <LuArchive />
              <Text fontSize={'xs'}>Propdates</Text>
            </Tabs.Trigger>
          </Tabs.List>

          {/* Use Chakra UI's built-in tab content with animations */}
          <Tabs.Content
            value='description'
            pt={2}
            _open={{
              animationName: 'fade-in',
              animationDuration: '300ms',
            }}
          >
            {descriptionContent}
          </Tabs.Content>

          {tabMap.includes('votes') && (
            <Tabs.Content
              value='votes'
              pt={2}
              _open={{
                animationName: 'fade-in',
                animationDuration: '300ms',
              }}
            >
              {votesContent}
            </Tabs.Content>
          )}

          <Tabs.Content
            value='transactions'
            pt={2}
            _open={{
              animationName: 'fade-in',
              animationDuration: '300ms',
            }}
          >
            {transactionsContent}
          </Tabs.Content>

          <Tabs.Content
            value='propdates'
            pt={2}
            _open={{
              animationName: 'fade-in',
              animationDuration: '300ms',
            }}
          >
            {propdatesContent}
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    );
  },
  // Add a custom equality function to prevent unnecessary rerenders
  (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
      prevProps.activeTab === nextProps.activeTab &&
      prevProps.proposal === nextProps.proposal &&
      prevProps.propdates === nextProps.propdates
    );
  }
);
ProposalTabs.displayName = 'ProposalTabs';

// The main component with improved organization to prevent unnecessary renders
export default function ProposalPageClient({
  proposal: defaultProposal,
  proposalNumber,
  latestProposalNumber,
  propdates: defaultPropdates = [],
  editors = [],
}: ProposalPageClientProps) {
  console.log('[DEBUG][Main] ProposalPageClient rendered');
  const renderStart = performance.now();

  const [proposal, setProposal] = useState<Proposal>(defaultProposal);
  const [propdates, setPropdates] = useState<PropDateInterface[]>(
    defaultPropdates || []
  );

  // Check if proposal has votes
  const hasVotes = useMemo(() =>
    proposal.votes && proposal.votes.length > 0,
    [proposal]
  );

  const { activeTab, tabMap, handleTabChange } = useTabNavigation('description', hasVotes);

  // SDK initialization logic
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  useEffect(() => {
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      sdk.actions.ready();
    }
  }, [isSDKLoaded]);

  // Memoize the proposal details component to prevent re-renders on tab changes
  const memoizedProposalDetails = useMemo(() => (
    <ProposalDetails
      proposal={proposal}
      proposalNumber={proposalNumber}
      latestProposalNumber={latestProposalNumber}
      setProposal={setProposal}
    />
  ), [proposal, proposalNumber, latestProposalNumber]);

  // Memoize the tabs component
  const memoizedProposalTabs = useMemo(() => {
    console.log('[DEBUG][Main] Creating memoizedProposalTabs');
    const start = performance.now();
    const tabs = (
      <ProposalTabs
        activeTab={activeTab}
        tabMap={tabMap}
        handleTabChange={handleTabChange}
        proposal={proposal}
        propdates={propdates}
        setPropdates={setPropdates}
        editors={editors || []}
      />
    );
    console.log('[DEBUG][Main] memoizedProposalTabs created in', performance.now() - start, 'ms');
    return tabs;
  }, [activeTab, tabMap, handleTabChange, proposal, propdates, editors]);

  useEffect(() => {
    console.log('[DEBUG][Main] Total ProposalPageClient render time:', performance.now() - renderStart, 'ms');
  });

  return (
    <ProposalProvider
      initialProposal={defaultProposal}
      initialProposalNumber={proposalNumber}
      initialDescriptionHash={defaultProposal.descriptionHash}
      initialBlockNumber={defaultProposal.snapshotBlockNumber}
      initialPropdates={defaultPropdates || []}
    >
      <Container maxW={'breakpoint-lg'} p={0}>
        <VStack gap={4} align={'start'} w='full'>
          {/* Proposal Details - now memoized */}
          {memoizedProposalDetails}

          {/* Tabs - now memoized */}
          {memoizedProposalTabs}
        </VStack>
      </Container>
    </ProposalProvider>
  );
}
