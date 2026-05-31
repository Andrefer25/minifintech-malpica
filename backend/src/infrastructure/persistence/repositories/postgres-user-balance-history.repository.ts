import { Repository } from 'typeorm';
import { UserBalanceHistoryEntity, BalanceChangeType } from '../entities/user-balance-history.entity';
import { UserBalanceHistory } from '../../../domain/user/user-balance-history';
import { UserBalanceHistoryRepository } from '../../../domain/user/user-balance-history.repository';

export class PostgresUserBalanceHistoryRepository implements UserBalanceHistoryRepository {
  constructor(private readonly typeormUserBalanceHistoryRepo: Repository<UserBalanceHistoryEntity>) {}

  private get repository(): Repository<UserBalanceHistoryEntity> {
    return this.typeormUserBalanceHistoryRepo;
  }

  async save(history: UserBalanceHistory): Promise<void> {
    const entity = this.toEntity(history);
    await this.repository.save(entity);
  }

  async findByUserId(userId: string): Promise<UserBalanceHistory[]> {
    const entities = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findByTransactionId(transactionId: string): Promise<UserBalanceHistory[]> {
    const entities = await this.repository.find({
      where: { transactionId },
      order: { createdAt: 'DESC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  private toDomain(entity: UserBalanceHistoryEntity): UserBalanceHistory {
    return new UserBalanceHistory(
      entity.id,
      entity.userId,
      entity.transactionId,
      Number(entity.balanceBefore),
      Number(entity.balanceAfter),
      entity.type as BalanceChangeType,
      entity.createdAt,
    );
  }

  private toEntity(history: UserBalanceHistory): UserBalanceHistoryEntity {
    const entity = new UserBalanceHistoryEntity();
    entity.id = history.id;
    entity.userId = history.userId;
    entity.transactionId = history.transactionId;
    entity.balanceBefore = history.balanceBefore;
    entity.balanceAfter = history.balanceAfter;
    entity.type = history.type as BalanceChangeType;
    entity.createdAt = history.createdAt;
    return entity;
  }
}
