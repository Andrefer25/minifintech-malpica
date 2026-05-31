import type {
  CreateTransactionInput,
  CreateTransactionResult,
  MutateTransactionResult,
  Paginated,
  Transaction,
  TransactionCriteria,
} from '@/domain/transaction/transaction';

export interface TransactionGateway {
  list(criteria: TransactionCriteria): Promise<Paginated<Transaction>>;
  getById(id: string): Promise<Transaction>;
  create(input: CreateTransactionInput): Promise<CreateTransactionResult>;
  approve(id: string): Promise<MutateTransactionResult>;
  reject(id: string, reason?: string): Promise<MutateTransactionResult>;
}
