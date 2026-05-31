import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type {
  CreateTransactionInput,
  CreateTransactionResult,
} from '@/domain/transaction/transaction';

export class CreateTransactionUseCase {
  constructor(private readonly gateway: TransactionGateway) {}

  async execute(input: CreateTransactionInput): Promise<CreateTransactionResult> {
    if (!input.originUserId) {
      throw new Error('Usuario origen requerido');
    }
    if (!input.destinationUserId) {
      throw new Error('Usuario destino requerido');
    }
    if (input.originUserId === input.destinationUserId) {
      throw new Error('El origen y destino deben ser distintos');
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    return this.gateway.create(input);
  }
}
