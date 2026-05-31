import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';
import { TransactionStatusHistory } from '../../domain/transaction/transaction-status-history';
import { Transaction } from '../../domain/transaction/transaction';
import {
  TransactionNotFoundError,
  TransactionNotPendingError,
} from '../../domain/transaction/errors';
import { UnitOfWork } from '../../domain/shared/unit-of-work';

export interface RejectTransactionParams {
  transactionId: string;
  reason?: string;
}

export class RejectTransactionUseCase {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(params: RejectTransactionParams): Promise<Transaction> {
    const { transactionId, reason } = params;

    return this.unitOfWork.run(async (tx) => {
      const transaction = await tx.transactions.findById(transactionId);
      if (!transaction) throw new TransactionNotFoundError(transactionId);

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new TransactionNotPendingError();
      }

      const previousStatus = transaction.status;
      transaction.reject(reason);
      await tx.transactions.update(transaction);

      // Registrar historial de estado (PENDING -> REJECTED)
      const statusHistory = TransactionStatusHistory.create(
        transaction.id,
        previousStatus,
        TransactionStatus.REJECTED,
        'system',
      );
      await tx.transactionStatusHistory.save(statusHistory);

      return transaction;
    });
  }
}

export const REJECT_TRANSACTION_USE_CASE = 'RejectTransactionUseCase';
