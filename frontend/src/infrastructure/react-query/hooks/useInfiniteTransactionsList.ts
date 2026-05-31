import { useInfiniteQuery } from '@tanstack/react-query';
import type { TransactionCriteria } from '@/domain/transaction/transaction';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

const LIMIT = 15;

type InfiniteCriteria = Omit<TransactionCriteria, 'page' | 'limit'>;

export function useInfiniteTransactionsList(criteria: InfiniteCriteria = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.transactions.infinite(criteria),
    queryFn: ({ pageParam }) =>
      useCases.listTransactions.execute({ ...criteria, page: pageParam, limit: LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
  });
}
