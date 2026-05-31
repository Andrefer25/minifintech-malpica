import { Repository } from 'typeorm';
import { TransactionEntity } from '../entities/transaction.entity';
import { Transaction } from '../../../domain/transaction/transaction';
import { TransactionStatus } from '../../../domain/transaction/transaction-status.enum';
import {
  PaginatedTransactions,
  TransactionFilters,
  TransactionRepository,
} from '../../../domain/transaction/transaction.repository';

function getTodayUtcRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export class PostgresTransactionRepository implements TransactionRepository {
  constructor(private readonly typeormTransactionRepo: Repository<TransactionEntity>) {}

  private get repository(): Repository<TransactionEntity> {
    return this.typeormTransactionRepo;
  }

  async findPaginated(
    filters: TransactionFilters,
    page: number,
    limit: number,
  ): Promise<PaginatedTransactions> {
    const {
      userId,
      originUserId,
      destinationUserId,
      status,
      fromDate,
      toDate,
      minAmount,
      maxAmount,
    } = filters;

    const qb = this.repository.createQueryBuilder('tx');

    if (originUserId || destinationUserId) {
      if (originUserId) {
        qb.andWhere('tx.originUserId = :originUserId', { originUserId });
      }
      if (destinationUserId) {
        qb.andWhere('tx.destinationUserId = :destinationUserId', { destinationUserId });
      }
    } else if (userId) {
      qb.andWhere('(tx.originUserId = :userId OR tx.destinationUserId = :userId)', { userId });
    }

    if (status) {
      qb.andWhere('tx.status = :status', { status });
    }
    if (fromDate) {
      qb.andWhere('tx.createdAt >= :fromDate', { fromDate });
    }
    if (toDate) {
      qb.andWhere('tx.createdAt <= :toDate', { toDate });
    }
    if (minAmount !== undefined) {
      qb.andWhere('tx.amount >= :minAmount', { minAmount });
    }
    if (maxAmount !== undefined) {
      qb.andWhere('tx.amount <= :maxAmount', { maxAmount });
    }

    qb.orderBy('tx.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();
    return {
      data: entities.map((entity) => this.toDomain(entity)),
      total,
    };
  }

  async countByStatus(status: TransactionStatus): Promise<number> {
    return this.repository.count({ where: { status } });
  }

  async countCreatedToday(): Promise<number> {
    const { start, end } = getTodayUtcRange();
    return this.repository
      .createQueryBuilder('tx')
      .where('tx.createdAt >= :start AND tx.createdAt < :end', { start, end })
      .getCount();
  }

  async sumApprovedVolumeToday(): Promise<number> {
    const { start, end } = getTodayUtcRange();
    const result = await this.repository
      .createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount), 0)', 'total')
      .where('tx.status = :status', { status: TransactionStatus.APPROVED })
      .andWhere('tx.approvedAt >= :start AND tx.approvedAt < :end', { start, end })
      .getRawOne<{ total: string | number }>();
    return Number(result?.total ?? 0);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const entity = this.toEntity(transaction);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  update(transaction: Transaction): Promise<Transaction> {
    return this.save(transaction);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  private toDomain(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.originUserId,
      entity.destinationUserId,
      Number(entity.amount),
      entity.status as TransactionStatus,
      entity.rejectionReason,
      entity.createdAt,
      entity.updatedAt,
      entity.approvedAt,
      entity.rejectedAt,
      entity.completedAt,
    );
  }

  private toEntity(transaction: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.originUserId = transaction.originUserId;
    entity.destinationUserId = transaction.destinationUserId;
    entity.amount = transaction.amount;
    entity.status = transaction.status;
    entity.rejectionReason = transaction.rejectionReason;
    entity.createdAt = transaction.createdAt;
    entity.updatedAt = transaction.updatedAt;
    entity.approvedAt = transaction.approvedAt;
    entity.rejectedAt = transaction.rejectedAt;
    entity.completedAt = transaction.completedAt;
    return entity;
  }
}
