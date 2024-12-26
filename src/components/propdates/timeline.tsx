import { Box, Stack, VStack } from '@chakra-ui/react';
import React from 'react';
import PropdatesEditor from './editor';
import { PropdatesContentCardContent } from './contentCard';
import { Editor, PropDateInterface } from '@/utils/database/interfaces';
import { useAccount } from 'wagmi';
import { Proposal } from '@/app/services/proposal';

interface PropdatesTimelineProps {
  proposal: Proposal;
  propdates: PropDateInterface[];
  editors: Editor[];
}

function PropdatesTimeline({
  proposal,
  propdates,
  editors,
}: PropdatesTimelineProps) {
  const { address } = useAccount();
  const isEditor = editors.some((editor) => editor.user === address);

  return (
    <VStack gap={4}>
      {isEditor && <PropdatesEditor propdateId={proposal.proposalId} />}
      <VStack gap={2} w='full'>
        {propdates.map((propdate) => (
          <PropdatesContentCardContent key={propdate.id} propdate={propdate} />
        ))}
      </VStack>
    </VStack>
  );
}

export default PropdatesTimeline;
