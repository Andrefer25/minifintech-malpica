import { useQuery } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useUserById(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.users.detail(id) : ['users', 'detail', 'noop'],
    queryFn: () => useCases.getUserById.execute(id as string),
    enabled: Boolean(id),
  });
}
