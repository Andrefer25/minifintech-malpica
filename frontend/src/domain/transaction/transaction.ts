export const APPROVAL_THRESHOLD = 50_000;

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';

export interface Transaction {
  id: string;
  originUserId: string;
  destinationUserId: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
}

export interface TransactionCriteria {
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

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CreateTransactionInput {
  originUserId: string;
  destinationUserId: string;
  amount: number;
}

export interface CreateTransactionResult {
  id: string;
  status: Extract<TransactionStatus, 'PENDING' | 'COMPLETED'>;
  message: string;
}

export interface MutateTransactionResult {
  id: string;
  status: TransactionStatus;
  message: string;
}

