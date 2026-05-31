import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { buildDisplayTimeline } from '@/ui/components/Timeline/timeline-builder';
import { useTransactionById } from '@/infrastructure/react-query/hooks/useTransactionById';
import { useUserById } from '@/infrastructure/react-query/hooks/useUserById';
import { Card, CardHeader } from '@/ui/components/Card/Card';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { StatusBadge } from '@/ui/components/Badge/Badge';
import { Timeline } from '@/ui/components/Timeline/Timeline';
import { Button } from '@/ui/components/Button/Button';
import { ErrorBanner } from '@/ui/components/ErrorBanner/ErrorBanner';
import { ApproveTransactionModal } from '@/ui/modals/ApproveTransactionModal/ApproveTransactionModal';
import { RejectTransactionModal } from '@/ui/modals/RejectTransactionModal/RejectTransactionModal';
import { formatCurrency } from '@/utils/format-currency';
import { formatDateTime } from '@/utils/format-date';
import { PageHead } from '@/ui/components/PageHead/PageHead';
import styles from './TransactionDetailScreen.module.css';

export function TransactionDetailScreen() {
  const { id = '' } = useParams<{ id: string }>();
  const txQuery = useTransactionById(id);
  const tx = txQuery.data;
  const originQuery = useUserById(tx?.originUserId);
  const destinationQuery = useUserById(tx?.destinationUserId);

  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  if (txQuery.isError) {
    return <ErrorBanner message="Error al cargar transacción" onRetry={() => txQuery.refetch()} />;
  }

  if (txQuery.isLoading || !tx) {
    return (
      <>
        <Skeleton height={120} />
        <Skeleton height={180} />
      </>
    );
  }

  const events = buildDisplayTimeline(tx);

  return (
    <>
      <PageHead title="Detalle de Transacción" back backLabel="Volver a transacciones" />
      <div className={styles.detailGrid}>
        <Card>
          <CardHeader
            title="Información principal"
            action={
              tx.status === 'PENDING' ? (
                <div className={styles.cardActions}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<X size={14} />}
                    onClick={() => setRejectOpen(true)}
                  >
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<Check size={14} />}
                    onClick={() => setApproveOpen(true)}
                  >
                    Aprobar
                  </Button>
                </div>
              ) : undefined
            }
          />
          <div className={styles.kvList}>
            <div className={styles.kv}>
              <span className={styles.kvLabel}>ID</span>
              <span className={styles.kvValue}>{tx.id}</span>
            </div>
            <div className={styles.kv}>
              <span className={styles.kvLabel}>Origen</span>
              <span className={styles.kvValue}>
                {originQuery.data?.name ?? tx.originUserId}
              </span>
            </div>
            <div className={styles.kv}>
              <span className={styles.kvLabel}>Destino</span>
              <span className={styles.kvValue}>
                {destinationQuery.data?.name ?? tx.destinationUserId}
              </span>
            </div>
            <div className={styles.kv}>
              <span className={styles.kvLabel}>Monto</span>
              <span className={`${styles.kvValue} ${styles.amount}`}>
                {formatCurrency(tx.amount)}
              </span>
            </div>
            <div className={styles.kv}>
              <span className={styles.kvLabel}>Estado</span>
              <span className={styles.kvValue}><StatusBadge status={tx.status} /></span>
            </div>
            <div className={styles.kv}>
              <span className={styles.kvLabel}>Fecha de creación</span>
              <span className={styles.kvValue}>{formatDateTime(tx.createdAt)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Línea de tiempo" />
          <Timeline events={events} />
        </Card>

      </div>

      <ApproveTransactionModal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        transaction={tx}
        origin={originQuery.data}
        destination={destinationQuery.data}
      />
      <RejectTransactionModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        transaction={tx}
        origin={originQuery.data}
        destination={destinationQuery.data}
      />
    </>
  );
}
