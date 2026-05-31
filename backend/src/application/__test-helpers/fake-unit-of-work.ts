import { TxContext, UnitOfWork } from '../../domain/shared/unit-of-work';
import { UserRepository } from '../../domain/user/user.repository';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { UserBalanceHistoryRepository } from '../../domain/user/user-balance-history.repository';
import { TransactionStatusHistoryRepository } from '../../domain/transaction/transaction-status-history.repository';
import { User } from '../../domain/user/user';

/**
 * Test helper: implementación de UnitOfWork que ejecuta el callback con
 * el TxContext apuntando a los repos mockeados pasados, sin transacción real.
 * lockUser delega en users.findById.
 */
export function createFakeUnitOfWork(
  users: UserRepository,
  transactions: TransactionRepository,
  userBalanceHistory?: UserBalanceHistoryRepository,
  transactionStatusHistory?: TransactionStatusHistoryRepository,
): UnitOfWork {
  return {
    run: async <T>(work: (tx: TxContext) => Promise<T>): Promise<T> => {
      const ctx: TxContext = {
        users,
        transactions,
        userBalanceHistory: userBalanceHistory || { save: async () => {}, findByUserId: async () => [], findByTransactionId: async () => [] },
        transactionStatusHistory: transactionStatusHistory || { save: async () => {}, findByTransactionId: async () => [] },
        lockUser: async (id: string): Promise<User | null> => users.findById(id),
      };
      return work(ctx);
    },
  };
}
