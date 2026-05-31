import type { TransactionEvent } from '@/ui/components/Timeline/timeline-builder';
import { formatDateTime } from '@/utils/format-date';
import { cx } from '@/utils/cx';
import styles from './Timeline.module.css';

const LABELS: Record<TransactionEvent['type'], string> = {
  CREATED: 'Transacción creada',
  PENDING: 'Pendiente de aprobación',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  COMPLETED: 'Completada',
};

function getLabel(ev: TransactionEvent): string {
  if (ev.future && (ev.type === 'APPROVED' || ev.type === 'REJECTED')) {
    return 'Aprobada / Rechazada';
  }
  return LABELS[ev.type];
}

function dotClass(ev: TransactionEvent): string | undefined {
  if (ev.future) return undefined;
  if (ev.type === 'REJECTED') return styles.dotError;
  return styles.dotSuccess;
}

export function Timeline({ events }: { events: TransactionEvent[] }) {
  return (
    <ol className={styles.timeline}>
      {events.map((ev, idx) => (
        <li key={`${ev.type}-${idx}`} className={styles.event}>
          <span className={cx(styles.dot, dotClass(ev))} />
          <div className={styles.content}>
            <span className={cx(styles.label, ev.future ? styles.labelFuture : undefined)}>
              {getLabel(ev)}
            </span>
            {ev.future ? (
              <span className={styles.time}>Pendiente</span>
            ) : (
              <>
                <span className={styles.time}>{formatDateTime(ev.at)}</span>
                {ev.reason && <span className={styles.reason}>Motivo: {ev.reason}</span>}
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
