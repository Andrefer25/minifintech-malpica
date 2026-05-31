import type { TransactionCriteria } from '@/domain/transaction/transaction';

type InfiniteTxCriteria = Omit<TransactionCriteria, 'page' | 'limit'>;

export const queryKeys = {
  users: {
    root: ['users'] as const,
    list: () => ['users', 'list'] as const,
    infiniteList: () => ['users', 'infinite'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  transactions: {
    root: ['transactions'] as const,
    list: (criteria: TransactionCriteria) => ['transactions', 'list', criteria] as const,
    infinite: (criteria: InfiniteTxCriteria) => ['transactions', 'infinite', criteria] as const,
    pending: (criteria: Omit<TransactionCriteria, 'status'>) =>
      ['transactions', 'pending', criteria] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
  },
  dashboard: {
    root: ['dashboard'] as const,
  },
};
