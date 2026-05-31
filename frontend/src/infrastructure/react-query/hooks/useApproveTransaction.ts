import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useApproveTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => useCases.approveTransaction.execute(id),
    onSettled: (_data, _error, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.root });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.root });
      qc.invalidateQueries({ queryKey: queryKeys.users.root });
    },
  });
}
