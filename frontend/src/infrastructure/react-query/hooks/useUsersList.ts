import { useQuery } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useUsersList() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => useCases.listUsers.execute(),
  });
}
