import { TransactionStatus } from './transaction-status.enum';

export class TransactionStatusHistory {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly previousStatus: TransactionStatus | null,
    public readonly newStatus: TransactionStatus,
    public readonly changedAt: Date,
    public readonly changedBy: string,
  ) {}

  static create(
    transactionId: string,
    previousStatus: TransactionStatus | null,
    newStatus: TransactionStatus,
    changedBy: string = 'system',
  ): TransactionStatusHistory {
    return new TransactionStatusHistory(
      crypto.randomUUID(),
      transactionId,
      previousStatus,
      newStatus,
      new Date(),
      changedBy,
    );
  }
}
