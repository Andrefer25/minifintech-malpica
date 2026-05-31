import {
  PaginatedTransactions,
  TransactionFilters,
  TransactionRepository,
} from '../../domain/transaction/transaction.repository';
import { TransactionStatus } from '../../domain/transaction/transaction-status.enum';
import {
  InvalidAmountRangeError,
  InvalidDateRangeError,
} from '../../domain/transaction/errors';

export interface GetTransactionsParams {
  userId?: string;
  originUserId?: string;
  destinationUserId?: string;
  status?: TransactionStatus;
  fromDate?: Date;
  toDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export interface GetTransactionsResult {
  data: PaginatedTransactions['data'];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export class GetTransactionsUseCase {
  constructor(private readonly transactionRepository: TransactionRepository) {}

  async execute(params: GetTransactionsParams): Promise<GetTransactionsResult> {
    const page = Math.max(1, Math.floor(params.page ?? 1));
    const limit = Math.min(100, Math.max(1, Math.floor(params.limit ?? 10)));

    if (params.fromDate && params.toDate && params.fromDate > params.toDate) {
      throw new InvalidDateRangeError();
    }
    if (
      params.minAmount !== undefined &&
      params.maxAmount !== undefined &&
      params.minAmount > params.maxAmount
    ) {
      throw new InvalidAmountRangeError();
    }

    const filters: TransactionFilters = {
      userId: params.userId,
      originUserId: params.originUserId,
      destinationUserId: params.destinationUserId,
      status: params.status,
      fromDate: params.fromDate,
      toDate: params.toDate,
      minAmount: params.minAmount,
      maxAmount: params.maxAmount,
    };

    const { data, total } = await this.transactionRepository.findPaginated(filters, page, limit);

    return {
      data,
      pagination: { page, limit, total },
    };
  }
}

export const GET_TRANSACTIONS_USE_CASE = 'GetTransactionsUseCase';
