import { useQuery } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

export function useDashboardKpis() {
  return useQuery({
    queryKey: queryKeys.dashboard.root,
    queryFn: () => useCases.getDashboardKpis.execute(),
  });
}
