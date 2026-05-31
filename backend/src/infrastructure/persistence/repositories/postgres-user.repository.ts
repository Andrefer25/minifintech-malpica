import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { User } from '../../../domain/user/user';
import { PaginatedUsers, UserRepository } from '../../../domain/user/user.repository';

export class PostgresUserRepository implements UserRepository {
  constructor(private readonly typeormUserRepo: Repository<UserEntity>) {}

  private get repository(): Repository<UserEntity> {
    return this.typeormUserRepo;
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async findAllPaginated(page: number, limit: number): Promise<PaginatedUsers> {
    const skip = (page - 1) * limit;
    const [entities, total] = await this.repository.findAndCount({
      skip,
      take: limit,
    });
    return {
      data: entities.map(entity => this.toDomain(entity)),
      total,
    };
  }

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  update(user: User): Promise<User> {
    return this.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async countAll(): Promise<number> {
    return this.repository.count();
  }

  async sumBalances(): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('u')
      .select('COALESCE(SUM(u.balance), 0)', 'total')
      .getRawOne<{ total: string | number }>();
    return Number(result?.total ?? 0);
  }

  private toDomain(entity: UserEntity): User {
    return new User(
      entity.id,
      entity.name,
      entity.email,
      Number(entity.balance),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id;
    entity.name = user.name;
    entity.email = user.email;
    entity.balance = user.balance;
    entity.createdAt = user.createdAt;
    entity.updatedAt = user.updatedAt;
    return entity;
  }
}
