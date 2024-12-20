import { fetchAllPropDates } from '@/services/supabase/propdates';
import { supabase } from '@/utils/database/supabase_server';
import { Box } from '@chakra-ui/react';

export default async function PropdatesPage() {
  const {data} = await fetchAllPropDates();
  return <Box>{JSON.stringify(data, null, 2)}</Box>;
}