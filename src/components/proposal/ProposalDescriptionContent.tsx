import { Box } from '@chakra-ui/react';
import Markdown from '@/components/proposal/markdown';
import { memo, useMemo } from 'react';

interface ProposalDescriptionContentProps {
  proposal: any;
}

const ProposalDescriptionContent = memo(({
  proposal,
}: ProposalDescriptionContentProps) => {
  // Memoize the markdown content to prevent unnecessary re-renders
  const markdownContent = useMemo(() => {
    return <Markdown text={proposal.description} />;
  }, [proposal.description]);

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      gap={2}
      data-state='open'
      _open={{
        animation: 'fade-in 600ms ease-out',
      }}
      px={2}
    >
      {markdownContent}
    </Box>
  );
});

ProposalDescriptionContent.displayName = 'ProposalDescriptionContent';

export default ProposalDescriptionContent;
