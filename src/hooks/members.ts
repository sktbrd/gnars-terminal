import { useQuery } from '@tanstack/react-query';
import { fetchMembers, Member } from '@/services/members';

export function useMembers(page: number, pageSize: number) {
  const { data, isLoading, error } = useQuery<Member[]>({
    queryKey: ['members', page, pageSize],
    queryFn: () => fetchMembers(page, pageSize),
    initialData: []
  });

  return { data, loading: isLoading, error };
}
