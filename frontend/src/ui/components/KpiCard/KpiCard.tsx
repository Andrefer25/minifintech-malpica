import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { cx } from '@/utils/cx';
import styles from './KpiCard.module.css';

export type Trend = 'up' | 'down' | 'neutral';
export type KpiTone = 'default' | 'warn';
export type KpiValueTone = 'default' | 'primary';

export interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  trend?: Trend;
  trendValue?: string;
  loading?: boolean;
  to?: string;
  footLabel?: string;
  tone?: KpiTone;
  valueTone?: KpiValueTone;
}

export function KpiCard({
  label,
  value,
  icon,
  trend,
  trendValue,
  loading,
  to,
  footLabel,
  tone = 'default',
  valueTone = 'default',
}: KpiCardProps) {
  const content = (
    <>
      <span className={styles.label}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {label}
      </span>
      <div className={styles.valueWrap}>
        {loading ? (
          <Skeleton width="60%" height={28} />
        ) : (
          <span className={cx(styles.value, valueTone === 'primary' && styles.valuePrimary)}>
            {value}
          </span>
        )}
      </div>
      {trend && trendValue && (
        <span
          className={cx(
            styles.trend,
            trend === 'up' && styles.trendUp,
            trend === 'down' && styles.trendDown,
            trend === 'neutral' && styles.trendNeutral,
          )}
        >
          {trend === 'up' && <TrendingUp size={12} />}
          {trend === 'down' && <TrendingDown size={12} />}
          {trend === 'neutral' && <Minus size={12} />}
          {trendValue}
        </span>
      )}
      {footLabel && (
        <span className={styles.foot}>
          {footLabel} <ArrowRight size={13} />
        </span>
      )}
    </>
  );

  const className = cx(styles.kpi, tone === 'warn' && styles.kpiWarn, to && styles.kpiLink);

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }
  return <div className={className}>{content}</div>;
}
