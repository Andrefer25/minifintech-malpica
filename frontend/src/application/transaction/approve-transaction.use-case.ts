import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type { MutateTransactionResult } from '@/domain/transaction/transaction';

export class ApproveTransactionUseCase {
  constructor(private readonly gateway: TransactionGateway) {}

  execute(id: string): Promise<MutateTransactionResult> {
    return this.gateway.approve(id);
  }
}
