import { useInfiniteQuery } from '@tanstack/react-query';
import { useCases } from '@/infrastructure/composition-root';
import { queryKeys } from '@/infrastructure/react-query/query-keys';

const LIMIT = 20;

export function useInfiniteUsersList() {
  return useInfiniteQuery({
    queryKey: queryKeys.users.infiniteList(),
    queryFn: ({ pageParam }) => useCases.listUsersPaginated.execute(pageParam, LIMIT),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, limit, total } = lastPage.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
  });
}
