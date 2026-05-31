import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useUserById } from '@/infrastructure/react-query/hooks/useUserById';
import { useUsersList } from '@/infrastructure/react-query/hooks/useUsersList';
import { useTransactionsList } from '@/infrastructure/react-query/hooks/useTransactionsList';
import { Card, CardHeader } from '@/ui/components/Card/Card';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { StatusBadge } from '@/ui/components/Badge/Badge';
import { ErrorBanner } from '@/ui/components/ErrorBanner/ErrorBanner';
import { EmptyState } from '@/ui/components/EmptyState/EmptyState';
import { formatCurrency } from '@/utils/format-currency';
import { formatDate, formatDateTime } from '@/utils/format-date';
import styles from './UserDetailScreen.module.css';

export function UserDetailScreen() {
  const { id = '' } = useParams<{ id: string }>();

  const userQuery = useUserById(id);
  const usersQuery = useUsersList();
  const txQuery = useTransactionsList({ userId: id, page: 1, limit: 4 });

  const userById = (uid: string) => usersQuery.data?.find((u) => u.id === uid);
  const nameOf = (uid: string) => userById(uid)?.name ?? uid.slice(0, 8);

  if (userQuery.isError) {
    return <ErrorBanner message="Error al cargar usuario" onRetry={() => userQuery.refetch()} />;
  }

  return (
    <>
      <div className={styles.pageTop}>
        <Link to="/usuarios" className={styles.backLink}>
          <ArrowLeft size={14} />
          Volver a usuarios
        </Link>
        <h1 className={styles.pageTitle}>Detalle de Usuario</h1>
      </div>

      <div className={styles.detailGrid}>
        <Card>
          <CardHeader title="Información del usuario" />
          {userQuery.isLoading || !userQuery.data ? (
            <div className={styles.kvList}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.kv}>
                  <Skeleton width="30%" height={14} />
                  <Skeleton width="40%" height={14} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.kvList}>
              <div className={styles.kv}>
                <span className={styles.kvLabel}>ID</span>
                <span className={`${styles.kvValue} ${styles.mono}`}>{userQuery.data.id}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.kvLabel}>Nombre</span>
                <span className={styles.kvValue}>{userQuery.data.name}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.kvLabel}>Email</span>
                <span className={styles.kvValue}>{userQuery.data.email}</span>
              </div>
              <div className={styles.kv}>
                <span className={styles.kvLabel}>Saldo actual</span>
                <span className={`${styles.kvValue} ${styles.green}`}>
                  {formatCurrency(userQuery.data.balance)}
                </span>
              </div>
              {userQuery.data.createdAt && (
                <div className={styles.kv}>
                  <span className={styles.kvLabel}>Fecha de creación</span>
                  <span className={styles.kvValue}>{formatDate(userQuery.data.createdAt)}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Transacciones recientes"
            action={
              <Link
                to={`/transacciones?userId=${id}`}
                className={styles.viewAll}
              >
                Ver todas <ArrowRight size={13} />
              </Link>
            }
          />
          {txQuery.isError ? (
            <ErrorBanner
              message="Error al cargar transacciones"
              onRetry={() => txQuery.refetch()}
            />
          ) : txQuery.isLoading ? (
            <div className={styles.txList}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} height={54} />
              ))}
            </div>
          ) : (txQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState title="Sin movimientos" />
          ) : (
            <div className={styles.txList}>
              {txQuery.data!.data.map((tx) => {
                const isOut = tx.originUserId === id;
                const counterId = isOut ? tx.destinationUserId : tx.originUserId;
                return (
                  <Link key={tx.id} to={`/transacciones/${tx.id}`} className={styles.txItem}>
                    <div className={styles.txLeft}>
                      <span className={`${styles.txDesc} ${isOut ? styles.txOut : styles.txIn}`}>
                        {isOut ? 'ENVIADA a ' : 'RECIBIDA de '}
                        {nameOf(counterId)}
                      </span>
                    </div>
                    <div className={styles.txMiddle}>
                      <span className={`${styles.txAmount} ${isOut ? styles.txAmountOut : styles.txAmountIn}`}>
                        {isOut ? '−' : '+'}{formatCurrency(tx.amount)}
                      </span>
                      <span className={styles.txDate}>{formatDateTime(tx.createdAt)}</span>
                    </div>
                    <StatusBadge status={tx.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
