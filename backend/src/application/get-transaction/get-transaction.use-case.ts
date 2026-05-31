import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { Transaction } from '../../domain/transaction/transaction';
import { TransactionNotFoundError } from '../../domain/transaction/errors';

export interface GetTransactionParams {
  transactionId: string;
}

export class GetTransactionUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(params: GetTransactionParams): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(params.transactionId);
    if (!transaction) throw new TransactionNotFoundError(params.transactionId);
    return transaction;
  }
}

export const GET_TRANSACTION_USE_CASE = 'GetTransactionUseCase';
