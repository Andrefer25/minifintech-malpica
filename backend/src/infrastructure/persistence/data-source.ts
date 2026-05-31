import { join } from 'path';
import { DataSource } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { UserBalanceHistoryEntity } from './entities/user-balance-history.entity';
import { TransactionStatusHistoryEntity } from './entities/transaction-status-history.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'beloChallenge',
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [UserEntity, TransactionEntity, UserBalanceHistoryEntity, TransactionStatusHistoryEntity],
  migrations: [join(__dirname, 'migrations/*.{js,ts}')],
  subscribers: [],
});
