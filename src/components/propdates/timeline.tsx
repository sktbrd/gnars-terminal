'use client';

import { Proposal } from '@/app/services/proposal';
import { Editor, PropDateInterface } from '@/utils/database/interfaces';
import { Text, VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction, memo, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { PropdatesContentCardContent } from './contentCard';
import PropdatesEditor from './editor';
import { isAddressEqual, zeroAddress } from 'viem';
import { FaEdit } from 'react-icons/fa';

interface PropdatesTimelineProps {
  proposal: Proposal;
  propdates: PropDateInterface[];
  editors: Editor[];
  setPropdates: Dispatch<SetStateAction<PropDateInterface[]>>;
}

// Memoize individual propdate card to prevent re-rendering all propdates
const PropdateCard = memo(({
  propdate,
  setPropdates
}: {
  propdate: PropDateInterface;
  setPropdates: Dispatch<SetStateAction<PropDateInterface[]>>;
}) => (
  <PropdatesContentCardContent
    propdate={propdate}
    setPropdates={setPropdates}
  />
));
PropdateCard.displayName = 'PropdateCard';

const PropdatesTimeline = memo(({
  proposal,
  propdates,
  setPropdates,
  editors,
}: PropdatesTimelineProps) => {
  const { address } = useAccount();

  // Memoize the editor check to avoid recalculation
  const isEditor = useMemo(() => {
    return editors.some((editor) => editor.user === address) ||
      isAddressEqual(proposal.proposer, address || zeroAddress);
  }, [editors, address, proposal.proposer]);

  // Memoize the editor component
  const editorComponent = useMemo(() => {
    if (!isEditor) return null;

    return (
      <PropdatesEditor
        proposalId={proposal.proposalId}
        setPropdates={setPropdates}
        buttonProps={{ variant: 'surface', size: 'sm', w: 'full' }}
        buttonInnerChildren={
          <>
            <FaEdit />
            <Text>Create new Propdate</Text>
          </>
        }
      />
    );
  }, [isEditor, proposal.proposalId, setPropdates]);

  // Memoize the propdate cards
  const propdateCards = useMemo(() => {
    if (propdates.length === 0) {
      return (
        <Text mt={2} textAlign={'center'} w={'full'}>
          No propdates yet
        </Text>
      );
    }

    return (
      <VStack gap={2} w='full'>
        {propdates.map((propdate) => (
          <PropdateCard
            key={propdate.id}
            propdate={propdate}
            setPropdates={setPropdates}
          />
        ))}
      </VStack>
    );
  }, [propdates, setPropdates]);

  return (
    <VStack gap={4}>
      {editorComponent}
      {propdateCards}
    </VStack>
  );
});

PropdatesTimeline.displayName = 'PropdatesTimeline';

export default PropdatesTimeline;
