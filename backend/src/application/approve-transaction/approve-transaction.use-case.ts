import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';
import { TransactionStatusHistory } from '../../domain/transaction/transaction-status-history';
import { UnitOfWork } from '../../domain/shared/unit-of-work';
import { Transaction } from '../../domain/transaction/transaction';
import {
  TransactionNotFoundError,
  TransactionNotPendingError,
} from '../../domain/transaction/errors';
import { UserBalanceHistory, BalanceChangeType } from '../../domain/user/user-balance-history';
import {
  InsufficientBalanceOnApproveError,
  UserNotFoundError,
} from '../../domain/user/errors';

export interface ApproveTransactionParams {
  transactionId: string;
}

export class ApproveTransactionUseCase {
  constructor(private readonly unitOfWork: UnitOfWork) {}

  async execute(params: ApproveTransactionParams): Promise<Transaction> {
    const { transactionId } = params;

    let insufficientBalance = false;

    const result = await this.unitOfWork.run(async (tx) => {
      const transaction = await tx.transactions.findById(transactionId);
      if (!transaction) throw new TransactionNotFoundError(transactionId);

      if (transaction.status !== TransactionStatus.PENDING) {
        throw new TransactionNotPendingError();
      }

      const originUser = await tx.lockUser(transaction.originUserId);
      if (!originUser) throw new UserNotFoundError(transaction.originUserId);

      const destinationUser = await tx.users.findById(transaction.destinationUserId);
      if (!destinationUser) throw new UserNotFoundError(transaction.destinationUserId);

      if (originUser.balance < transaction.amount) {
        const previousStatus = transaction.status;
        transaction.reject('Saldo insuficiente');

        const rejectedHistory = TransactionStatusHistory.create(
          transaction.id,
          previousStatus,
          TransactionStatus.REJECTED,
          'system',
        );
        await tx.transactionStatusHistory.save(rejectedHistory);
        await tx.transactions.update(transaction);

        insufficientBalance = true;
        return transaction;
      }

      const previousStatus = transaction.status;
      transaction.approve();
      const approvedStatus = transaction.status;

      const originBalanceBefore = originUser.balance;
      const destinationBalanceBefore = destinationUser.balance;

      originUser.debit(transaction.amount);
      destinationUser.credit(transaction.amount);

      transaction.complete();

      // Registrar historial de saldos
      const originHistory = UserBalanceHistory.create(
        originUser.id,
        transaction.id,
        originBalanceBefore,
        originUser.balance,
        BalanceChangeType.DEBIT,
      );
      const destinationHistory = UserBalanceHistory.create(
        destinationUser.id,
        transaction.id,
        destinationBalanceBefore,
        destinationUser.balance,
        BalanceChangeType.CREDIT,
      );
      await tx.userBalanceHistory.save(originHistory);
      await tx.userBalanceHistory.save(destinationHistory);

      // Registrar historial de estado (PENDING -> APPROVED -> COMPLETED)
      const approvedHistory = TransactionStatusHistory.create(
        transaction.id,
        previousStatus,
        TransactionStatus.APPROVED,
        'system',
      );
      await tx.transactionStatusHistory.save(approvedHistory);

      const completedHistory = TransactionStatusHistory.create(
        transaction.id,
        approvedStatus,
        TransactionStatus.COMPLETED,
        'system',
      );
      await tx.transactionStatusHistory.save(completedHistory);

      await tx.users.update(originUser);
      await tx.users.update(destinationUser);
      await tx.transactions.update(transaction);

      return transaction;
    });

    if (insufficientBalance) {
      throw new InsufficientBalanceOnApproveError();
    }

    return result;
  }
}

export const APPROVE_TRANSACTION_USE_CASE = 'ApproveTransactionUseCase';
