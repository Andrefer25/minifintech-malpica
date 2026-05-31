import { InsufficientBalanceError, InvalidAmountError } from './errors';

export class User {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public balance: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  debit(amount: number): void {
    if (amount <= 0) {
      throw new InvalidAmountError();
    }
    if (this.balance < amount) {
      throw new InsufficientBalanceError();
    }
    this.balance -= amount;
    this.updatedAt = new Date();
  }

  credit(amount: number): void {
    if (amount <= 0) {
      throw new InvalidAmountError();
    }
    this.balance += amount;
    this.updatedAt = new Date();
  }

  static create(name: string, email: string, initialBalance: number = 0): User {
    const now = new Date();
    return new User(
      crypto.randomUUID(),
      name,
      email,
      initialBalance,
      now,
      now,
    );
  }
}
