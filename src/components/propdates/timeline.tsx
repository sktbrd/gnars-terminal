import { Box, Stack, VStack } from '@chakra-ui/react';
import React from 'react';
import PropdatesEditor from './editor';
import { PropdatesContentCardContent } from './contentCard';
import { Editor, PropDateInterface } from '@/utils/database/interfaces';
import { useAccount } from 'wagmi';

interface PropdatesTimelineProps {
  propdates: PropDateInterface[];
  editors: Editor[];
}

function PropdatesTimeline({ propdates, editors }: PropdatesTimelineProps) {
  const { address } = useAccount();
  const isEditor = editors.some((editor) => editor.user === address);

  return (
    <VStack gap={4}>
      {isEditor && <PropdatesEditor />}
      <VStack gap={2} w='full'>
        {propdates.map((propdate) => (
          <PropdatesContentCardContent key={propdate.id} propdate={propdate} />
        ))}
      </VStack>
    </VStack>
  );
}

export default PropdatesTimeline;
