import type { ReactNode } from 'react';
import type { TransactionStatus } from '@/domain/transaction/transaction';
import { cx } from '@/utils/cx';
import styles from './Badge.module.css';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  withDot?: boolean;
  className?: string;
}

export function Badge({ variant = 'neutral', withDot, children, className }: BadgeProps) {
  return (
    <span className={cx(styles.badge, styles[variant], className)}>
      {withDot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

const STATUS_MAP: Record<TransactionStatus, { variant: BadgeVariant; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pendiente' },
  APPROVED: { variant: 'info', label: 'Aprobada' },
  REJECTED: { variant: 'error', label: 'Rechazada' },
  COMPLETED: { variant: 'success', label: 'Completada' },
};

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const entry = STATUS_MAP[status] ?? { variant: 'neutral' as BadgeVariant, label: String(status) };
  return (
    <Badge variant={entry.variant} withDot>
      {entry.label}
    </Badge>
  );
}
