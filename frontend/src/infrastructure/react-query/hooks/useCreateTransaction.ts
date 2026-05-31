import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateTransactionInput } from '@/domain/transaction/transaction';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTransactionInput) => useCases.createTransaction.execute(input),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.root });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.root });
      qc.invalidateQueries({ queryKey: queryKeys.users.root });
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(variables.originUserId) });
      qc.invalidateQueries({ queryKey: queryKeys.users.detail(variables.destinationUserId) });
    },
  });
}
