import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type {
  Paginated,
  Transaction,
  TransactionCriteria,
} from '@/domain/transaction/transaction';

export class ListPendingTransactionsUseCase {
  constructor(private readonly gateway: TransactionGateway) {}

  execute(criteria: Omit<TransactionCriteria, 'status'> = {}): Promise<Paginated<Transaction>> {
    return this.gateway.list({ ...criteria, status: 'PENDING' });
  }
}
