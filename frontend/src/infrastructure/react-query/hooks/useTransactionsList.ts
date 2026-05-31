import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { TransactionCriteria } from '@/domain/transaction/transaction';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useTransactionsList(criteria: TransactionCriteria = {}) {
  return useQuery({
    queryKey: queryKeys.transactions.list(criteria),
    queryFn: () => useCases.listTransactions.execute(criteria),
    placeholderData: keepPreviousData,
  });
}
