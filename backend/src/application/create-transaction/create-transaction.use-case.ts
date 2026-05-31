import { Transaction } from '../../domain/transaction/transaction';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';
import { TransactionStatusHistory } from '../../domain/transaction/transaction-status-history';
import { User } from '../../domain/user/user';
import { UserBalanceHistory, BalanceChangeType } from '../../domain/user/user-balance-history';
import { UnitOfWork } from '../../domain/shared/unit-of-work';
import {
  InsufficientBalanceError,
  UserNotFoundError,
} from '../../domain/user/errors';

export interface CreateTransactionParams {
  originUserId: string;
  destinationUserId: string;
  amount: number;
}

export interface CreateTransactionResult {
  transaction: Transaction;
  originUser: User;
  destinationUser: User;
}

export class CreateTransactionUseCase {
  constructor(
    private readonly unitOfWork: UnitOfWork,
  ) {}

  async execute(params: CreateTransactionParams): Promise<CreateTransactionResult> {
    const { originUserId, destinationUserId, amount } = params;

    // Construir la transacción dispara las validaciones de dominio
    const transaction = Transaction.create(originUserId, destinationUserId, amount);

    // Ambos casos (PENDING y auto-completada) se ejecutan dentro de una transacción
    return this.unitOfWork.run(async (tx) => {
      const originUser = await tx.users.findById(originUserId);
      if (!originUser) throw new UserNotFoundError(originUserId);

      const destinationUser = await tx.users.findById(destinationUserId);
      if (!destinationUser) throw new UserNotFoundError(destinationUserId);

      if (transaction.status === TransactionStatus.PENDING) {
        // Transacción que requiere aprobación manual
        const savedTransaction = await tx.transactions.save(transaction);

        // Registrar historial de estado inicial (null -> PENDING)
        const statusHistory = TransactionStatusHistory.create(
          transaction.id,
          null,
          TransactionStatus.PENDING,
          'system',
        );
        await tx.transactionStatusHistory.save(statusHistory);

        return { transaction: savedTransaction, originUser, destinationUser };
      }

      // Auto-completada: ejecutar con lock y mover fondos
      const lockedOriginUser = await tx.lockUser(originUserId);
      if (!lockedOriginUser) throw new UserNotFoundError(originUserId);

      if (lockedOriginUser.balance < amount) {
        throw new InsufficientBalanceError();
      }

      const originBalanceBefore = lockedOriginUser.balance;
      const destinationBalanceBefore = destinationUser.balance;

      lockedOriginUser.debit(amount);
      destinationUser.credit(amount);

      const savedTransaction = await tx.transactions.save(transaction);

      // Registrar historial de saldos
      const originHistory = UserBalanceHistory.create(
        lockedOriginUser.id,
        transaction.id,
        originBalanceBefore,
        lockedOriginUser.balance,
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

      // Registrar historial de estado (CREATED -> COMPLETED)
      const statusHistory = TransactionStatusHistory.create(
        transaction.id,
        null,
        TransactionStatus.COMPLETED,
        'system',
      );
      await tx.transactionStatusHistory.save(statusHistory);

      await tx.users.update(lockedOriginUser);
      await tx.users.update(destinationUser);

      return { transaction: savedTransaction, originUser: lockedOriginUser, destinationUser };
    });
  }
}

export const CREATE_TRANSACTION_USE_CASE = 'CreateTransactionUseCase';
