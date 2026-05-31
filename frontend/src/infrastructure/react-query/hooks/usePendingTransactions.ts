import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { TransactionCriteria } from '@/domain/transaction/transaction';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function usePendingTransactions(criteria: Omit<TransactionCriteria, 'status'> = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.pending(criteria),
    queryFn: () => useCases.listPendingTransactions.execute(criteria),
    placeholderData: keepPreviousData,
  });
}
