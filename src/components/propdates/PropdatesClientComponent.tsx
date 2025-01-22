"use client";
import { useState } from "react";
import { Box, Button, VStack, Heading, Text } from "@chakra-ui/react";
import PropdatesContentCardList from "@/components/propdates/contentCard";
import { ProposalWithThumbnail } from "@/app/services/proposal";

interface PropdatesClientComponentProps {
    propdates: any;
    proposals: ProposalWithThumbnail[];
}

export default function PropdatesClientComponent({ propdates, proposals }: PropdatesClientComponentProps) {
    const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

    // If a proposal is selected, show only its propdates; else show all
    const filteredPropdates = selectedProposalId
        ? propdates?.data?.filter(
            (pd: { proposal: { id: string } }) => pd.proposal.id === selectedProposalId
        )
        : propdates?.data;

    // Does this proposal have any matching propdates at all?
    const hasPropdates = (proposalId: string) =>
        propdates?.data?.some(
            (pd: { proposal: { id: string } }) => pd.proposal.id === proposalId
        );

    return (
        <Box display="flex" minH="100vh">
            {/* -- Sidebar -- */}
            <Box
                width={{ base: "100%", md: "250px" }}
                p={4}
                borderRight="1px solid #ccc"
            >
                <Button
                    w="100%"
                    mb={4}
                    colorScheme="yellow"
                    onClick={() => setSelectedProposalId(null)}
                >
                    Show All
                </Button>

                {proposals.map((proposal) => {
                    const isActive = hasPropdates(proposal.proposalId);
                    return (
                        <Button
                            key={proposal.proposalId}
                            w="100%"
                            mb={2}
                            backgroundColor={isActive ? "green.100" : "gray.200"}
                            onClick={() => setSelectedProposalId(proposal.proposalId)}
                        >
                            Proposal #{proposal.proposalNumber}
                        </Button>
                    );
                })}
            </Box>

            {/* -- Main Content -- */}
            <Box flex="1" p={4} w={'100%'}>
                <Heading mb={4}>Propdates</Heading>

                {filteredPropdates && filteredPropdates.length > 0 ? (
                    <PropdatesContentCardList
                        _propdates={filteredPropdates}
                        proposals={proposals}
                    />
                ) : (
                    <VStack gap={4} w={"100%"} align="center">
                        <Text fontSize="lg" color="gray.600">
                            No propdates yet :/
                        </Text>
                        <Button
                            colorScheme="yellow"
                            onClick={() => setSelectedProposalId(null)}
                        >
                            Go Back to All Proposals
                        </Button>
                    </VStack>
                )}
            </Box>
        </Box >
    );
}
