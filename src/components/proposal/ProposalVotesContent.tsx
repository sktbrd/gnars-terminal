import { Box, Text } from '@chakra-ui/react';

interface ProposalVotesContentProps {
    proposal: any; // Replace `any` with the actual proposal type if you have a defined interface
}

export default function ProposalVotesContent({ proposal }: ProposalVotesContentProps) {
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
            {proposal.votes.map((vote: any, index: number) => (
                <Box key={index} borderWidth={1} borderRadius={'md'} px={4} py={2} w={'full'} bg={'bg.subtle'}>
                    <Text><strong>Voter:</strong> {vote.voter}</Text>
                    <Text><strong>Support:</strong> {vote.support}</Text>
                    <Text><strong>Weight:</strong> {vote.weight}</Text>
                    <Text><strong>Reason:</strong> {vote.reason}</Text>
                </Box>
            ))}
        </Box>
    );
}
