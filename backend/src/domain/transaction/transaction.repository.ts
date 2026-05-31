import { Transaction } from './transaction';
import { TransactionStatus } from './transaction-status.enum';

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
}

export interface TransactionFilters {
  userId?: string;
  originUserId?: string;
  destinationUserId?: string;
  status?: TransactionStatus;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
}

export interface TransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  findPaginated(
    filters: TransactionFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedTransactions>;
  save(transaction: Transaction): Promise<Transaction>;
  update(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  countByStatus(status: TransactionStatus): Promise<number>;
  countCreatedToday(): Promise<number>;
  sumApprovedVolumeToday(): Promise<number>;
}

export const TRANSACTION_REPOSITORY = Symbol('TransactionRepository');
