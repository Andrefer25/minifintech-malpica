import { useQuery } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useTransactionById(id: string | undefined) {
  return useQuery({
    queryKey: id ? queryKeys.transactions.detail(id) : ['transactions', 'detail', 'noop'],
    queryFn: () => useCases.getTransactionById.execute(id as string),
    enabled: Boolean(id),
  });
}
