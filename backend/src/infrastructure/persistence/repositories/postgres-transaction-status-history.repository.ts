import { Repository } from 'typeorm';
import { TransactionStatusHistoryEntity } from '../entities/transaction-status-history.entity';
import { TransactionStatusHistory } from '../../../domain/transaction/transaction-status-history';
import { TransactionStatusHistoryRepository } from '../../../domain/transaction/transaction-status-history.repository';
import { TransactionStatus } from '../../../domain/transaction/transaction-status.enum';

export class PostgresTransactionStatusHistoryRepository implements TransactionStatusHistoryRepository {
  constructor(private readonly typeormTransactionStatusHistoryRepo: Repository<TransactionStatusHistoryEntity>) {}

  private get repository(): Repository<TransactionStatusHistoryEntity> {
    return this.typeormTransactionStatusHistoryRepo;
  }

  async save(history: TransactionStatusHistory): Promise<void> {
    const entity = this.toEntity(history);
    await this.repository.save(entity);
  }

  async findByTransactionId(transactionId: string): Promise<TransactionStatusHistory[]> {
    const entities = await this.repository.find({
      where: { transactionId },
      order: { changedAt: 'ASC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  private toDomain(entity: TransactionStatusHistoryEntity): TransactionStatusHistory {
    return new TransactionStatusHistory(
      entity.id,
      entity.transactionId,
      entity.previousStatus as TransactionStatus | null,
      entity.newStatus as TransactionStatus,
      entity.changedAt,
      entity.changedBy,
    );
  }

  private toEntity(history: TransactionStatusHistory): TransactionStatusHistoryEntity {
    const entity = new TransactionStatusHistoryEntity();
    entity.id = history.id;
    entity.transactionId = history.transactionId;
    entity.previousStatus = history.previousStatus;
    entity.newStatus = history.newStatus;
    entity.changedAt = history.changedAt;
    entity.changedBy = history.changedBy;
    return entity;
  }
}
