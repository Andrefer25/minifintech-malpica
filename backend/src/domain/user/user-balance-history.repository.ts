import { UserBalanceHistory } from './user-balance-history';

export interface UserBalanceHistoryRepository {
  save(history: UserBalanceHistory): Promise<void>;
  findByUserId(userId: string): Promise<UserBalanceHistory[]>;
  findByTransactionId(transactionId: string): Promise<UserBalanceHistory[]>;
}

export const USER_BALANCE_HISTORY_REPOSITORY = Symbol('UserBalanceHistoryRepository');
