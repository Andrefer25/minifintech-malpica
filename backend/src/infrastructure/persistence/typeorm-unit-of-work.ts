import { DataSource } from 'typeorm';
import { TxContext, UnitOfWork } from '../../domain/shared/unit-of-work';
import { User } from '../../domain/user/user';
import { UserEntity } from './entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { UserBalanceHistoryEntity } from './entities/user-balance-history.entity';
import { TransactionStatusHistoryEntity } from './entities/transaction-status-history.entity';
import { PostgresUserRepository } from './repositories/postgres-user.repository';
import { PostgresTransactionRepository } from './repositories/postgres-transaction.repository';
import { PostgresUserBalanceHistoryRepository } from './repositories/postgres-user-balance-history.repository';
import { PostgresTransactionStatusHistoryRepository } from './repositories/postgres-transaction-status-history.repository';

export class TypeOrmUnitOfWork implements UnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async run<T>(work: (tx: TxContext) => Promise<T>): Promise<T> {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(UserEntity);
      const transactionRepo = manager.getRepository(TransactionEntity);
      const userBalanceHistoryRepo = manager.getRepository(UserBalanceHistoryEntity);
      const transactionStatusHistoryRepo = manager.getRepository(TransactionStatusHistoryEntity);

      const ctx: TxContext = {
        users: new PostgresUserRepository(userRepo),
        transactions: new PostgresTransactionRepository(transactionRepo),
        userBalanceHistory: new PostgresUserBalanceHistoryRepository(userBalanceHistoryRepo),
        transactionStatusHistory: new PostgresTransactionStatusHistoryRepository(transactionStatusHistoryRepo),
        lockUser: async (id: string): Promise<User | null> => {
          const entity = await userRepo
            .createQueryBuilder('user')
            .setLock('pessimistic_write')
            .where('user.id = :id', { id })
            .getOne();
          if (!entity) return null;
          return new User(
            entity.id,
            entity.name,
            entity.email,
            Number(entity.balance),
            entity.createdAt,
            entity.updatedAt,
          );
        },
      };

      return work(ctx);
    });
  }
}
