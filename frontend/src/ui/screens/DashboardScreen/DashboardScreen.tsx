import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users as UsersIcon,
  Wallet,
  ArrowLeftRight,
  Clock,
  ArrowRight,
} from 'lucide-react';
import type { Transaction } from '@/domain/transaction/transaction';
import { useDashboardKpis } from '@/infrastructure/react-query/hooks/useDashboardKpis';
import { useTransactionsList } from '@/infrastructure/react-query/hooks/useTransactionsList';
import { usePendingTransactions } from '@/infrastructure/react-query/hooks/usePendingTransactions';
import { useUsersList } from '@/infrastructure/react-query/hooks/useUsersList';
import { KpiCard } from '@/ui/components/KpiCard/KpiCard';
import { Button } from '@/ui/components/Button/Button';
import { StatusBadge } from '@/ui/components/Badge/Badge';
import { ErrorBanner } from '@/ui/components/ErrorBanner/ErrorBanner';
import { EmptyState } from '@/ui/components/EmptyState/EmptyState';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { ApproveTransactionModal } from '@/ui/modals/ApproveTransactionModal/ApproveTransactionModal';
import { RejectTransactionModal } from '@/ui/modals/RejectTransactionModal/RejectTransactionModal';
import { PageHead } from '@/ui/components/PageHead/PageHead';
import { formatCurrency } from '@/utils/format-currency';
import { formatRelativeTime, formatDateTime } from '@/utils/format-date';
import styles from './DashboardScreen.module.css';

export function DashboardScreen() {
  const navigate = useNavigate();
  const kpis = useDashboardKpis();
  const recent = useTransactionsList({ page: 1, limit: 5 });
  const pending = usePendingTransactions({ page: 1, limit: 4 });
  const users = useUsersList();

  const [approveTx, setApproveTx] = useState<Transaction | null>(null);
  const [rejectTx, setRejectTx] = useState<Transaction | null>(null);

  const userById = (id: string) => users.data?.find((u) => u.id === id);
  const nameOf = (id: string) => userById(id)?.name ?? id.slice(0, 8);

  return (
    <>
      <PageHead title="Dashboard" subtitle="Resumen general de la operación" />
      <div className={styles.kpiGrid}>
        <KpiCard
          label="Usuarios"
          icon={<UsersIcon size={14} />}
          value={kpis.data?.totalUsers ?? '—'}
          loading={kpis.isLoading}
          to="/usuarios"
          footLabel="Ver usuarios"
        />
        <KpiCard
          label="Saldo total"
          icon={<Wallet size={14} />}
          value={formatCurrency(kpis.data?.totalBalance)}
          loading={kpis.isLoading}
          to="/usuarios"
          footLabel="Ver detalles"
          valueTone="primary"
        />
        <KpiCard
          label="Transacciones (hoy)"
          icon={<ArrowLeftRight size={14} />}
          value={kpis.data?.transactionsToday ?? '—'}
          loading={kpis.isLoading}
          to="/transacciones"
          footLabel="Ver todas"
        />
        <KpiCard
          label="Pendientes"
          icon={<Clock size={14} />}
          value={kpis.data?.pendingCount ?? '—'}
          loading={kpis.isLoading}
          to="/pendientes"
          footLabel="Aprobar"
          tone="warn"
        />
      </div>

      {/* Desktop: two-column panels (table + mini-list) */}
      <div className={styles.cols2}>
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Transacciones recientes</h3>
            <Link to="/transacciones" className={styles.linkGreen}>
              Ver todas <ArrowRight size={13} />
            </Link>
          </div>
          {recent.isError ? (
            <ErrorBanner
              message="Error al cargar transacciones"
              onRetry={() => recent.refetch()}
            />
          ) : recent.isLoading ? (
            <div className={styles.tableLoader}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={40} />
              ))}
            </div>
          ) : (recent.data?.data.length ?? 0) === 0 ? (
            <EmptyState title="No hay transacciones recientes" />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Origen</th>
                  <th>Destino</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recent.data!.data.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => navigate(`/transacciones/${tx.id}`)}
                    className={styles.tableRow}
                  >
                    <td className={styles.mono}>{tx.id.slice(0, 8)}…</td>
                    <td>{nameOf(tx.originUserId)}</td>
                    <td className={styles.muted}>{nameOf(tx.destinationUserId)}</td>
                    <td className={styles.amountCell}>{formatCurrency(tx.amount)}</td>
                    <td>
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className={styles.muted}>{formatDateTime(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Pendientes de aprobación</h3>
          </div>
          {pending.isLoading ? (
            <div className={styles.pendListLoader}>
              <Skeleton height={48} />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </div>
          ) : (pending.data?.data.length ?? 0) === 0 ? (
            <EmptyState title="No hay pendientes" description="Todo al día." />
          ) : (
            <div className={styles.pendList}>
              {pending.data!.data.map((tx) => (
                <Link
                  key={tx.id}
                  to={`/transacciones/${tx.id}`}
                  className={styles.pendLi}
                >
                  <div className={styles.pendTop}>
                    <span className={styles.pendId}>{tx.id.slice(0, 8)}…</span>
                    <span className={styles.pendAmt}>{formatCurrency(tx.amount)}</span>
                  </div>
                  <div className={styles.pendRoute}>
                    {nameOf(tx.originUserId)} <ArrowRight size={14} />{' '}
                    {nameOf(tx.destinationUserId)}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className={styles.panelFoot}>
            <Link to="/pendientes" className={styles.linkGreen}>
              Ver todos los pendientes <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile: stacked sections (unchanged) */}
      <section className={`${styles.section} mobileOnly`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Transacciones Recientes</h2>
          <Link to="/transacciones">
            <Button size="sm" variant="ghost">
              Ver todas
            </Button>
          </Link>
        </div>
        {recent.isError ? (
          <ErrorBanner
            message="Error al cargar transacciones"
            onRetry={() => recent.refetch()}
          />
        ) : recent.isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height={64} />
            ))}
          </div>
        ) : (recent.data?.data.length ?? 0) === 0 ? (
          <EmptyState title="No hay transacciones recientes" />
        ) : (
          <div className={styles.list}>
            {recent.data!.data.slice(0, 3).map((tx) => (
              <Link key={tx.id} to={`/transacciones/${tx.id}`} className={styles.txItem}>
                <div className={styles.txMain}>
                  <span className={styles.txParticipants}>
                    {nameOf(tx.originUserId)} → {nameOf(tx.destinationUserId)}
                  </span>
                  <span className={styles.txMeta}>{formatRelativeTime(tx.createdAt)}</span>
                </div>
                <div className={styles.txRight}>
                  <span className={styles.txAmount}>{formatCurrency(tx.amount)}</span>
                  <StatusBadge status={tx.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>


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
