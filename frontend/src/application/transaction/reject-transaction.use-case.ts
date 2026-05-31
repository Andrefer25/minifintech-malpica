import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type { MutateTransactionResult } from '@/domain/transaction/transaction';

export class RejectTransactionUseCase {
  constructor(private readonly gateway: TransactionGateway) {}

  async execute(id: string, reason?: string): Promise<MutateTransactionResult> {
    if (reason && reason.length > 500) {
      throw new Error('El motivo no puede superar 500 caracteres');
    }
    return this.gateway.reject(id, reason);
  }
}
