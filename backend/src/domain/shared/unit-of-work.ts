import { User } from '../user/user';
import { UserRepository } from '../user/user.repository';
import { TransactionRepository } from '../transaction/transaction.repository';
import { UserBalanceHistoryRepository } from '../user/user-balance-history.repository';
import { TransactionStatusHistoryRepository } from '../transaction/transaction-status-history.repository';

export interface TxContext {
  users: UserRepository;
  transactions: TransactionRepository;
  userBalanceHistory: UserBalanceHistoryRepository;
  transactionStatusHistory: TransactionStatusHistoryRepository;
  /**
   * Acquires a pessimistic write lock on the user row (SELECT ... FOR UPDATE)
   * within the active database transaction. Returns null if the user does not
   * exist.
   */
  lockUser(id: string): Promise<User | null>;
}

export interface UnitOfWork {
  run<T>(work: (tx: TxContext) => Promise<T>): Promise<T>;
}

export const UNIT_OF_WORK = 'unitOfWork';
