import { TransactionStatus } from '../../../domain/transaction/transaction-status.enum';

export const createTransactionSchema = {
  type: 'object',
  required: ['originUserId', 'destinationUserId', 'amount'],
  properties: {
    originUserId: { type: 'string', format: 'uuid' },
    destinationUserId: { type: 'string', format: 'uuid' },
    amount: { type: 'number', minimum: 0.01 },
  },
};

export const rejectTransactionSchema = {
  type: 'object',
  properties: {
    reason: { type: 'string' },
  },
};

export const listTransactionsQuerySchema = {
  type: 'object',
  properties: {
    userId: { type: 'string', format: 'uuid', description: 'Filter by user ID (origin or destination). Ignored if originUserId or destinationUserId are provided.' },
    originUserId: { type: 'string', format: 'uuid', description: 'Filter by origin user ID' },
    destinationUserId: { type: 'string', format: 'uuid', description: 'Filter by destination user ID' },
    status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'], description: 'Filter by transaction status' },
    fromDate: { type: 'string', format: 'date-time', description: 'Filter by createdAt >= fromDate (ISO 8601)' },
    toDate: { type: 'string', format: 'date-time', description: 'Filter by createdAt <= toDate (ISO 8601)' },
    minAmount: { type: 'number', minimum: 0, description: 'Filter by amount >= minAmount' },
    maxAmount: { type: 'number', minimum: 0, description: 'Filter by amount <= maxAmount' },
    page: { type: 'integer', minimum: 1, default: 1, description: 'Page number for pagination' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 10, description: 'Number of items per page' },
  },
};

export interface CreateTransactionBody {
  originUserId: string;
  destinationUserId: string;
  amount: number;
}

export interface RejectTransactionBody {
  reason?: string;
}

export interface ListTransactionsQuery {
  userId?: string;
  originUserId?: string;
  destinationUserId?: string;
  status?: TransactionStatus;
  fromDate?: string;
  toDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}
