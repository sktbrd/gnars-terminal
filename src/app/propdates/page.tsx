import PropdatesClientComponent from '@/components/propdates/PropdatesClientComponent';
import { fetchAllPropDates } from '@/services/supabase/propdates';
import { DAO_ADDRESSES } from '@/utils/constants';
import { Container } from '@chakra-ui/react';
import { fetchProposals } from '../services/proposal';

export const metadata = {
  title: 'Propdates',
  description: 'Updates for proposals',
};

export const revalidate = 60;

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
