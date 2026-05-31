import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { TransactionStatus } from '../../../domain/transaction/transaction-status.enum';

@Entity('transaction_status_history')
export class TransactionStatusHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  transactionId!: string;

  @ManyToOne(() => TransactionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionId' })
  transaction!: TransactionEntity;

  @Column({ type: 'varchar', length: 20, nullable: true })
  previousStatus!: TransactionStatus | null;

  @Column({ type: 'varchar', length: 20 })
  newStatus!: TransactionStatus;

  @CreateDateColumn()
  changedAt!: Date;

  @Column({ type: 'varchar', length: 100, default: 'system' })
  changedBy!: string;
}
