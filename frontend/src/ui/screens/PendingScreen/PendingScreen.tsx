import { useState } from 'react';
import { usePageSize } from '@/ui/hooks/usePageSize';
import { Check, X } from 'lucide-react';
import type { Transaction } from '@/domain/transaction/transaction';
import { usePendingTransactions } from '@/infrastructure/react-query/hooks/usePendingTransactions';
import { useUsersList } from '@/infrastructure/react-query/hooks/useUsersList';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { Button } from '@/ui/components/Button/Button';
import { Badge } from '@/ui/components/Badge/Badge';
import { EmptyState } from '@/ui/components/EmptyState/EmptyState';
import { ErrorBanner } from '@/ui/components/ErrorBanner/ErrorBanner';
import { Pagination } from '@/ui/components/Pagination/Pagination';
import { DataTable } from '@/ui/components/DataTable/DataTable';
import type { DataTableColumn } from '@/ui/components/DataTable/DataTable';
import { ApproveTransactionModal } from '@/ui/modals/ApproveTransactionModal/ApproveTransactionModal';
import { RejectTransactionModal } from '@/ui/modals/RejectTransactionModal/RejectTransactionModal';
import { formatCurrency } from '@/utils/format-currency';
import { formatDateTime } from '@/utils/format-date';
import { PageHead } from '@/ui/components/PageHead/PageHead';
import styles from './PendingScreen.module.css';

export function PendingScreen() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = usePageSize('pref_pendingLimit', [5, 10, 20, 50], 10);
  const pending = usePendingTransactions({ page, limit });
  const usersQuery = useUsersList();
  const [approveTx, setApproveTx] = useState<Transaction | null>(null);
  const [rejectTx, setRejectTx] = useState<Transaction | null>(null);

  const userById = (id: string) => usersQuery.data?.find((u) => u.id === id);
  const nameOf = (id: string) => userById(id)?.name ?? id.slice(0, 8);

  const pendingColumns: DataTableColumn<Transaction>[] = [
    {
      key: 'id',
      label: 'ID',
      width: 100,
      cellClassName: styles.mono,
      render: (tx) => `${tx.id.slice(0, 8)}…`,
    },
    {
      key: 'origin',
      label: 'Origen',
      cellClassName: styles.bold,
      render: (tx) => nameOf(tx.originUserId),
    },
    {
      key: 'destination',
      label: 'Destino',
      cellClassName: styles.muted,
      render: (tx) => nameOf(tx.destinationUserId),
    },
    {
      key: 'amount',
      label: 'Monto',
      width: 130,
      cellClassName: styles.amountCell,
      render: (tx) => formatCurrency(tx.amount),
    },
    {
      key: 'date',
      label: 'Fecha',
      width: 185,
      cellClassName: styles.muted,
      render: (tx) => formatDateTime(tx.createdAt),
    },
    {
      key: 'actions',
      label: 'Acciones',
      width: 220,
      render: (tx) => (
        <div className={styles.rowActions}>
          <button type="button" className={styles.btnApprove} onClick={() => setApproveTx(tx)}>
            <Check size={14} /> Aprobar
          </button>
          <button type="button" className={styles.btnReject} onClick={() => setRejectTx(tx)}>
            <X size={14} /> Rechazar
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHead
        title="Pendientes"
        action={<Badge variant="warning">{pending.data?.pagination.total ?? 0} pendientes</Badge>}
      />

      {pending.isError ? (
        <ErrorBanner message="Error al cargar pendientes" onRetry={() => pending.refetch()} />
      ) : pending.isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={76} />
          ))}
        </div>
      ) : (pending.data?.data.length ?? 0) === 0 ? (
        <EmptyState title="No hay pendientes" description="Todo al día." />
      ) : (
        <>
          {/* Mobile list */}
          <div className="mobileOnly">
          <div className={styles.list}>
            {pending.data!.data.map((tx) => (
              <div key={tx.id} className={styles.item}>
                <div className={styles.itemTop}>
                  <span className={styles.participants}>
                    {nameOf(tx.originUserId)} → {nameOf(tx.destinationUserId)}
                  </span>
                  <span className={styles.amount}>{formatCurrency(tx.amount)}</span>
                </div>
                <div className={styles.itemBottom}>
                  <span className={styles.meta}>{formatDateTime(tx.createdAt)}</span>
                  <div className={styles.actions}>
                    <Button
                      size="sm"
                      leftIcon={<Check size={14} />}
                      onClick={() => setApproveTx(tx)}
                    >
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      leftIcon={<X size={14} />}
                      onClick={() => setRejectTx(tx)}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>

          {/* Desktop table */}
          <div className="desktopOnly">
            <DataTable
              columns={pendingColumns}
              rows={pending.data!.data}
              getRowKey={(tx) => tx.id}
              footerInfo={`Mostrando ${Math.min((page - 1) * limit + 1, pending.data!.pagination.total)}–${Math.min(page * limit, pending.data!.pagination.total)} de ${pending.data!.pagination.total} pendientes`}
              pagination={
                <Pagination
                  compact
                  page={page}
                  limit={limit}
                  total={pending.data!.pagination.total}
                  onPageChange={setPage}
                  pageSizeOptions={[5, 10, 20, 50]}
                  onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
                />
              }
            />
          </div>
        </>
      )}

      <ApproveTransactionModal
        open={Boolean(approveTx)}
        onClose={() => setApproveTx(null)}
        transaction={approveTx}
        origin={approveTx ? userById(approveTx.originUserId) : null}
        destination={approveTx ? userById(approveTx.destinationUserId) : null}
      />
      <RejectTransactionModal
        open={Boolean(rejectTx)}
        onClose={() => setRejectTx(null)}
        transaction={rejectTx}
        origin={rejectTx ? userById(rejectTx.originUserId) : null}
        destination={rejectTx ? userById(rejectTx.destinationUserId) : null}
      />
    </>
  );
}
