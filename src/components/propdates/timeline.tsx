import { Proposal } from '@/app/services/proposal';
import { Editor, PropDateInterface } from '@/utils/database/interfaces';
import { VStack } from '@chakra-ui/react';
import { Dispatch, SetStateAction } from 'react';
import { useAccount } from 'wagmi';
import { PropdatesContentCardContent } from './contentCard';
import PropdatesEditor from './editor';

interface PropdatesTimelineProps {
  proposal: Proposal;
  propdates: PropDateInterface[];
  editors: Editor[];
  setPropdates: Dispatch<SetStateAction<PropDateInterface[]>>;
}

function PropdatesTimeline({
  proposal,
  propdates,
  setPropdates,
  editors,
}: PropdatesTimelineProps) {
  const { address } = useAccount();
  const isEditor = editors.some((editor) => editor.user === address);

  return (
    <VStack gap={4}>
      {isEditor && (
        <PropdatesEditor
          propdateId={proposal.proposalId}
          setPropdates={setPropdates}
        />
      )}
      <VStack gap={2} w='full'>
        {propdates.map((propdate) => (
          <PropdatesContentCardContent key={propdate.id} propdate={propdate} />
        ))}
      </VStack>
    </VStack>
  );
}

export default PropdatesTimeline;
