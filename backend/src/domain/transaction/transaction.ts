import { TransactionStatus } from './transaction-status.enum';
import {
  InvalidTransactionAmountError,
  TransactionApproveStateError,
  TransactionCompleteStateError,
  TransactionRejectStateError,
  TransactionSameUserError,
} from './errors';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly originUserId: string,
    public readonly destinationUserId: string,
    public readonly amount: number,
    public status: TransactionStatus,
    public rejectionReason: string | null = null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public approvedAt: Date | null = null,
    public rejectedAt: Date | null = null,
    public completedAt: Date | null = null,
  ) {
    this.validate();
  }

  private validate(): void {
    if (this.amount <= 0) {
      throw new InvalidTransactionAmountError();
    }
    if (this.originUserId === this.destinationUserId) {
      throw new TransactionSameUserError();
    }
  }

  approve(): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new TransactionApproveStateError();
    }
    const now = new Date();
    this.status = TransactionStatus.APPROVED;
    this.approvedAt = now;
    this.updatedAt = now;
  }

  complete(): void {
    if (this.status !== TransactionStatus.APPROVED) {
      throw new TransactionCompleteStateError();
    }
    const now = new Date();
    this.status = TransactionStatus.COMPLETED;
    this.completedAt = now;
    this.updatedAt = now;
  }

  reject(reason?: string): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new TransactionRejectStateError();
    }
    this.status = TransactionStatus.REJECTED;
    this.rejectionReason = reason || null;
    this.rejectedAt = new Date();
    this.updatedAt = new Date();
  }

  static create(
    originUserId: string,
    destinationUserId: string,
    amount: number,
  ): Transaction {
    const now = new Date();
    const status = amount > 50000 ? TransactionStatus.PENDING : TransactionStatus.COMPLETED;
    const completedAt = status === TransactionStatus.COMPLETED ? now : null;

    return new Transaction(
      crypto.randomUUID(),
      originUserId,
      destinationUserId,
      amount,
      status,
      null,
      now,
      now,
      null,
      null,
      completedAt,
    );
  }
}
