import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useRejectTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      useCases.rejectTransaction.execute(id, reason),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.root });
      qc.invalidateQueries({ queryKey: queryKeys.transactions.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.root });
    },
  });
}
