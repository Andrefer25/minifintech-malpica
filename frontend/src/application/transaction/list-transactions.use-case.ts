import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type {
  Paginated,
  Transaction,
  TransactionCriteria,
} from '@/domain/transaction/transaction';

export class ListTransactionsUseCase {
  constructor(private readonly gateway: TransactionGateway) {}

  execute(criteria: TransactionCriteria = {}): Promise<Paginated<Transaction>> {
    return this.gateway.list(criteria);
  }
}
