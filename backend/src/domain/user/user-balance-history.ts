export enum BalanceChangeType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class UserBalanceHistory {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly transactionId: string | null,
    public readonly balanceBefore: number,
    public readonly balanceAfter: number,
    public readonly type: BalanceChangeType,
    public readonly createdAt: Date,
  ) {}

  static create(
    userId: string,
    transactionId: string | null,
    balanceBefore: number,
    balanceAfter: number,
    type: BalanceChangeType,
  ): UserBalanceHistory {
    return new UserBalanceHistory(
      crypto.randomUUID(),
      userId,
      transactionId,
      balanceBefore,
      balanceAfter,
      type,
      new Date(),
    );
  }
}
