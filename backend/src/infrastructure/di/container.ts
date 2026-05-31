import { AwilixContainer, createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { DataSource } from 'typeorm';
import { PostgresUserRepository } from '../persistence/repositories/postgres-user.repository';
import { PostgresTransactionRepository } from '../persistence/repositories/postgres-transaction.repository';
import { PostgresUserBalanceHistoryRepository } from '../persistence/repositories/postgres-user-balance-history.repository';
import { PostgresTransactionStatusHistoryRepository } from '../persistence/repositories/postgres-transaction-status-history.repository';
import { TypeOrmUnitOfWork } from '../persistence/typeorm-unit-of-work';
import { CreateTransactionUseCase, CREATE_TRANSACTION_USE_CASE } from '../../application/create-transaction/create-transaction.use-case';
import { GetTransactionsUseCase, GET_TRANSACTIONS_USE_CASE } from '../../application/get-transactions/get-transactions.use-case';
import { ApproveTransactionUseCase, APPROVE_TRANSACTION_USE_CASE } from '../../application/approve-transaction/approve-transaction.use-case';
import { RejectTransactionUseCase, REJECT_TRANSACTION_USE_CASE } from '../../application/reject-transaction/reject-transaction.use-case';
import { GetUsersUseCase, GET_USERS_USE_CASE } from '../../application/get-users/get-users.use-case';
import { GetUserUseCase, GET_USER_USE_CASE } from '../../application/get-user/get-user.use-case';
import { GetTransactionUseCase, GET_TRANSACTION_USE_CASE } from '../../application/get-transaction/get-transaction.use-case';
import { GetDashboardStatsUseCase, GET_DASHBOARD_STATS_USE_CASE } from '../../application/get-dashboard-stats/get-dashboard-stats.use-case';
import { GetUserBalanceHistoryUseCase, GET_USER_BALANCE_HISTORY_USE_CASE } from '../../application/get-user-balance-history/get-user-balance-history.use-case';
import { GetTransactionStatusHistoryUseCase, GET_TRANSACTION_STATUS_HISTORY_USE_CASE } from '../../application/get-transaction-status-history/get-transaction-status-history.use-case';
import { UserEntity } from '../persistence/entities/user.entity';
import { TransactionEntity } from '../persistence/entities/transaction.entity';
import { UserBalanceHistoryEntity } from '../persistence/entities/user-balance-history.entity';
import { TransactionStatusHistoryEntity } from '../persistence/entities/transaction-status-history.entity';

export function createDIContainer(dataSource: DataSource): AwilixContainer {
  const container = createContainer({ injectionMode: InjectionMode.CLASSIC });

  // Infraestructura cruda (TypeORM)
  container.register({
    dataSource: asValue(dataSource),
    typeormUserRepo: asValue(dataSource.getRepository(UserEntity)),
    typeormTransactionRepo: asValue(dataSource.getRepository(TransactionEntity)),
    typeormUserBalanceHistoryRepo: asValue(dataSource.getRepository(UserBalanceHistoryEntity)),
    typeormTransactionStatusHistoryRepo: asValue(dataSource.getRepository(TransactionStatusHistoryEntity)),
  });

  // Adapters de dominio
  container.register({
    userRepository: asClass(PostgresUserRepository).singleton(),
    transactionRepository: asClass(PostgresTransactionRepository).singleton(),
    userBalanceHistoryRepository: asClass(PostgresUserBalanceHistoryRepository).singleton(),
    transactionStatusHistoryRepository: asClass(PostgresTransactionStatusHistoryRepository).singleton(),
    unitOfWork: asClass(TypeOrmUnitOfWork).singleton(),
  });

  // Use cases
  container.register({
    [CREATE_TRANSACTION_USE_CASE]: asClass(CreateTransactionUseCase).singleton(),
    [GET_TRANSACTIONS_USE_CASE]: asClass(GetTransactionsUseCase).singleton(),
    [GET_TRANSACTION_USE_CASE]: asClass(GetTransactionUseCase).singleton(),
    [APPROVE_TRANSACTION_USE_CASE]: asClass(ApproveTransactionUseCase).singleton(),
    [REJECT_TRANSACTION_USE_CASE]: asClass(RejectTransactionUseCase).singleton(),
    [GET_USERS_USE_CASE]: asClass(GetUsersUseCase).singleton(),
    [GET_USER_USE_CASE]: asClass(GetUserUseCase).singleton(),
    [GET_DASHBOARD_STATS_USE_CASE]: asClass(GetDashboardStatsUseCase).singleton(),
    [GET_USER_BALANCE_HISTORY_USE_CASE]: asClass(GetUserBalanceHistoryUseCase).singleton(),
    [GET_TRANSACTION_STATUS_HISTORY_USE_CASE]: asClass(GetTransactionStatusHistoryUseCase).singleton(),
  });

  return container;
}
