import PropdatesContentCardList from '@/components/propdates/contentCard';
import { fetchAllPropDates } from '@/services/supabase/propdates';
import { Container, Heading, Text, VStack, Box } from '@chakra-ui/react';
import { fetchProposals } from '../services/proposal';
import { DAO_ADDRESSES } from '@/utils/constants';
import PropdatesClientComponent from '@/components/propdates/PropdatesClientComponent';

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
    <Container p={0} maxW='breakpoint-lg' display="flex">
      <PropdatesClientComponent propdates={propdates} proposals={proposals} />
    </Container>
  );
}
