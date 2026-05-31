import type { Transaction } from '@/domain/transaction/transaction';

export type TransactionEventType =
  | 'CREATED'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export interface TransactionEvent {
  type: TransactionEventType;
  at: string;
  reason?: string | null;
  future?: boolean;
}

export function buildDisplayTimeline(tx: Transaction): TransactionEvent[] {
  const events = buildTimeline(tx);
  if (tx.status === 'PENDING') {
    events.push({ type: 'APPROVED', at: '', future: true });
  }
  return events;
}

export function buildTimeline(tx: Transaction): TransactionEvent[] {
  const events: TransactionEvent[] = [{ type: 'CREATED', at: tx.createdAt }];
  if (tx.status === 'PENDING') {
    events.push({ type: 'PENDING', at: tx.createdAt });
  }
  if (tx.status === 'APPROVED') {
    if (tx.approvedAt && tx.approvedAt !== tx.createdAt) {
      events.push({ type: 'PENDING', at: tx.createdAt });
    }
    events.push({ type: 'APPROVED', at: tx.approvedAt ?? tx.createdAt });
  }
  if (tx.status === 'COMPLETED') {
    if (tx.completedAt && tx.completedAt !== tx.createdAt) {
      events.push({ type: 'PENDING', at: tx.createdAt });
    }
    if (tx.approvedAt) {
      events.push({ type: 'APPROVED', at: tx.approvedAt });
    }
    events.push({ type: 'COMPLETED', at: tx.completedAt ?? tx.approvedAt ?? tx.createdAt });
  }
  if (tx.status === 'REJECTED') {
    if (tx.rejectedAt && tx.rejectedAt !== tx.createdAt) {
      events.push({ type: 'PENDING', at: tx.createdAt });
    }
    events.push({
      type: 'REJECTED',
      at: tx.rejectedAt ?? tx.createdAt,
      reason: tx.rejectionReason ?? null,
    });
  }
  return events;
}
