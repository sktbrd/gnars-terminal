import { DAO_ADDRESSES } from '@/utils/constants';
import { Box, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { fetchProposals, Proposal } from '@/app/services/proposal';
import { FormattedAddress } from '../utils/ethereum';
import ProposalStatus from '../proposal/status';

async function GovernorCard() {
  const proposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'desc',
    100
  );

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
      <Heading as='h2'>Proposals</Heading>
      <Box
        overflow={'auto'}
        p={4}
        borderWidth={1}
        borderRadius={'md'}
        bg={'bg.subtle'}
        maxH={'240px'}
      >
        <pre>{JSON.stringify(proposals, null, 2)}</pre>
      </Box>
      {proposals.map((proposal: Proposal) => (
        <Box
          key={proposal.proposalId}
          borderWidth={1}
          borderRadius={'md'}
          p={4}
          mb={2}
          bg={'bg.subtle'}
        >
          <VStack gap={2} align={'start'}>
            <ProposalStatus proposal={proposal} />
            <Heading as='h3' size='md'>
              #{proposal.proposalNumber}: {proposal.title}
            </Heading>
            <FormattedAddress address={proposal.proposer} />
          </VStack>
        </Box>
      ))}
    </Box>
  );
}

export default GovernorCard;
