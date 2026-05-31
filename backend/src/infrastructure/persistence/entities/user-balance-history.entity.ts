import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { TransactionEntity } from './transaction.entity';

export enum BalanceChangeType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Entity('user_balance_history')
export class UserBalanceHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'userId' })
  user!: UserEntity;

  @Column('uuid', { nullable: true })
  transactionId!: string | null;

  @ManyToOne(() => TransactionEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'transactionId' })
  transaction!: TransactionEntity | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceBefore!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balanceAfter!: number;

  @Column({
    type: 'enum',
    enum: BalanceChangeType,
  })
  type!: BalanceChangeType;

  @CreateDateColumn()
  createdAt!: Date;
}
