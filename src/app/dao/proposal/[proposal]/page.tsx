import { fetchProposals } from '@/app/services/proposal';
import { ColorModeButton } from '@/components/ui/color-mode';
import { DAO_ADDRESSES } from '@/utils/constants';
import {
  Box,
  Container,
  Heading,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BsGithub } from 'react-icons/bs';
import { FaArrowLeft } from 'react-icons/fa';

interface ProposalPageProps {
  params: {
    proposal: string;
  };
}

export default async function ProposalPage({ params }: ProposalPageProps) {
  const proposalNumber = parseInt(params.proposal);
  if (isNaN(proposalNumber)) {
    return notFound();
  }

  const proposals = await fetchProposals(
    DAO_ADDRESSES.token,
    'proposalNumber',
    'asc',
    1,
    { proposalNumber },
    true
  );

  if (proposals.length === 0) {
    return notFound();
  }

  return (
    <Box
      minH={'100vh'}
      bg={'bg.panel'}
      colorPalette={'yellow'}
      color={{ base: 'black', _dark: 'white' }}
      padding={4}
    >
      <Container maxW={'2xl'}>
        <VStack gap={4} align={'start'}>
          <HStack w={'full'} justify={'space-between'}>
            <HStack>
              <Link href='/'>
                <IconButton
                  variant={'ghost'}
                  colorPalette={'black'}
                  size={'sm'}
                >
                  <FaArrowLeft style={{ background: 'none' }} />
                </IconButton>
              </Link>
              <Heading size={'4xl'} as='h1'>
                Proposal {params.proposal}
              </Heading>
            </HStack>
            <HStack>
              <Link href='https://github.com/r4topunk/gnars-terminal'>
                <IconButton
                  variant={'outline'}
                  colorPalette={'black'}
                  size={'sm'}
                >
                  <BsGithub style={{ background: 'none' }} />
                </IconButton>
              </Link>
              <ColorModeButton variant={'outline'} />
            </HStack>
          </HStack>
          <Box
            borderWidth={1}
            borderRadius={'md'}
            p={4}
            mb={2}
            bg={'bg.subtle'}
            maxW={'full'}
            overflow={'auto'}
          >
            <pre>{JSON.stringify(proposals, null, 2)}</pre>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
