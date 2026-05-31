import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Card.module.css';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  warningOutline?: boolean;
  flat?: boolean;
}

export function Card({ warningOutline, flat, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cx(
        styles.card,
        flat && styles.flat,
        warningOutline && styles.warningOutline,
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div>
        <div className={styles.title}>{title}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}
