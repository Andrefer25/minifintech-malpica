import type { TransactionGateway } from '@/application/ports/transaction.gateway';
import type {
  CreateTransactionInput,
  CreateTransactionResult,
  MutateTransactionResult,
  Paginated,
  Transaction,
  TransactionCriteria,
  TransactionStatus,
} from '@/domain/transaction/transaction';
import type { HttpClient } from './http-client';

interface TransactionDto {
  id: string;
  originUserId: string;
  destinationUserId: string;
  amount: number | string;
  status: TransactionStatus;
  createdAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  completedAt?: string | null;
  rejectionReason?: string | null;
}

interface PaginatedDto<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number };
}

function toTransaction(dto: TransactionDto): Transaction {
  return {
    id: dto.id,
    originUserId: dto.originUserId,
    destinationUserId: dto.destinationUserId,
    amount: typeof dto.amount === 'string' ? Number(dto.amount) : dto.amount,
    status: dto.status,
    createdAt: dto.createdAt,
    approvedAt: dto.approvedAt ?? null,
    rejectedAt: dto.rejectedAt ?? null,
    completedAt: dto.completedAt ?? null,
    rejectionReason: dto.rejectionReason ?? null,
  };
}

export class TransactionHttpGateway implements TransactionGateway {
  constructor(private readonly http: HttpClient) {}

  async list(criteria: TransactionCriteria): Promise<Paginated<Transaction>> {
    const res = await this.http.get<PaginatedDto<TransactionDto>>('/transactions', {
      query: {
        userId: criteria.userId,
        originUserId: criteria.originUserId,
        destinationUserId: criteria.destinationUserId,
        status: criteria.status,
        fromDate: criteria.fromDate,
        toDate: criteria.toDate,
        minAmount: criteria.minAmount,
        maxAmount: criteria.maxAmount,
        page: criteria.page,
        limit: criteria.limit,
      },
    });
    return {
      data: res.data.map(toTransaction),
      pagination: res.pagination,
    };
  }

  async getById(id: string): Promise<Transaction> {
    const dto = await this.http.get<TransactionDto>(`/transactions/${id}`);
    return toTransaction(dto);
  }

  async create(input: CreateTransactionInput): Promise<CreateTransactionResult> {
    return this.http.post<CreateTransactionResult>('/transactions', input);
  }

  async approve(id: string): Promise<MutateTransactionResult> {
    return this.http.patch<MutateTransactionResult>(`/transactions/${id}/approve`);
  }

  async reject(id: string, reason?: string): Promise<MutateTransactionResult> {
    return this.http.patch<MutateTransactionResult>(`/transactions/${id}/reject`, {
      reason: reason ?? '',
    });
  }
}
