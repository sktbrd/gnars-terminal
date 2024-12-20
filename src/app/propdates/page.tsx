import { supabase } from '@/utils/database/supabase_server';

export default async function PropdatesPage() {
  const { data, error } = await supabase.from('proposals').select();

  return <div>{JSON.stringify(data, null, 2)}</div>;
}