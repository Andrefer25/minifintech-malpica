import { TransactionStatusHistory } from '../../domain/transaction/transaction-status-history';
import { TransactionStatusHistoryRepository } from '../../domain/transaction/transaction-status-history.repository';
import { TransactionRepository } from '../../domain/transaction/transaction.repository';
import { TransactionNotFoundError } from '../../domain/transaction/errors';

export interface GetTransactionStatusHistoryParams {
  transactionId: string;
}

export class GetTransactionStatusHistoryUseCase {
  constructor(
    private readonly transactionStatusHistoryRepository: TransactionStatusHistoryRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(params: GetTransactionStatusHistoryParams): Promise<TransactionStatusHistory[]> {
    const transaction = await this.transactionRepository.findById(params.transactionId);
    if (!transaction) throw new TransactionNotFoundError(params.transactionId);

    return this.transactionStatusHistoryRepository.findByTransactionId(params.transactionId);
  }
}

export const GET_TRANSACTION_STATUS_HISTORY_USE_CASE = 'GetTransactionStatusHistoryUseCase';
