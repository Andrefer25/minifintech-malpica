import { TransactionStatusHistory } from './transaction-status-history';

export interface TransactionStatusHistoryRepository {
  save(history: TransactionStatusHistory): Promise<void>;
  findByTransactionId(transactionId: string): Promise<TransactionStatusHistory[]>;
}

export const TRANSACTION_STATUS_HISTORY_REPOSITORY = Symbol('TransactionStatusHistoryRepository');
