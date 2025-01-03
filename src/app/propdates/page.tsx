import PropdatesContentCardList from '@/components/propdates/contentCard';
import { fetchAllPropDates } from '@/services/supabase/propdates';
import { Container, Heading, Text, VStack } from '@chakra-ui/react';
import { fetchProposals } from '../services/proposal';
import { DAO_ADDRESSES } from '@/utils/constants';

export const metadata = {
  title: 'Propdates',
  description: 'Updates for proposals',
};

export default async function PropdatesPage() {
  const [propdates, proposals] = await Promise.all([
    fetchAllPropDates(),
    fetchProposals(
      DAO_ADDRESSES.token,
      'proposalNumber',
      'desc',
      1000,
      {},
      false,
      true
    ),
  ]);

  return (
    <Container p={0} maxW='breakpoint-lg'>
      <VStack gap={{ base: 2, md: 4 }} align={'start'}>
        <Heading size={{ base: '2xl', md: '4xl' }} as='h1'>
          Propdates
        </Heading>
        {propdates?.data?.length ? (
          <PropdatesContentCardList
            propdates={propdates.data}
            proposals={proposals}
          />
        ) : (
          <Text>No propdates yet</Text>
        )}
      </VStack>
    </Container>
  );
}
