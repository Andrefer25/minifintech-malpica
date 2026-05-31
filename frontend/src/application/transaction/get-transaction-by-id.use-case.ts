import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type { Transaction } from '@/domain/transaction/transaction';

export class GetTransactionByIdUseCase {
  constructor(private readonly gateway: TransactionGateway) {}

  execute(id: string): Promise<Transaction> {
    return this.gateway.getById(id);
  }
}
