import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, ChevronUp, Eye, Plus } from 'lucide-react';
import type { TransactionCriteria, Transaction } from '@/domain/transaction/transaction';
import { useTransactionsList } from '@/infrastructure/react-query/hooks/useTransactionsList';
import { useInfiniteTransactionsList } from '@/infrastructure/react-query/hooks/useInfiniteTransactionsList';
import { useUsersList } from '@/infrastructure/react-query/hooks/useUsersList';
import { Card } from '@/ui/components/Card/Card';
import { Button } from '@/ui/components/Button/Button';
import { TransactionFiltersPanel, FiltersState, EMPTY_FILTERS } from '@/ui/components/TransactionFiltersPanel/TransactionFiltersPanel';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { StatusBadge } from '@/ui/components/Badge/Badge';
import { EmptyState } from '@/ui/components/EmptyState/EmptyState';
import { ErrorBanner } from '@/ui/components/ErrorBanner/ErrorBanner';
import { Pagination } from '@/ui/components/Pagination/Pagination';
import { DataTable } from '@/ui/components/DataTable/DataTable';
import type { DataTableColumn } from '@/ui/components/DataTable/DataTable';
import { InfiniteList } from '@/ui/components/InfiniteList/InfiniteList';
import { useCreateTransaction } from '@/ui/layout/AppLayout/CreateTransactionContext';
import { usePageSize } from '@/ui/hooks/usePageSize';
import { formatCurrency } from '@/utils/format-currency';
import { formatDateTime } from '@/utils/format-date';
import { PageHead } from '@/ui/components/PageHead/PageHead';
import styles from './TransactionsScreen.module.css';

export function TransactionsScreen() {
  const navigate = useNavigate();
  const { openCreate } = useCreateTransaction();
  const [searchParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<FiltersState>({
    ...EMPTY_FILTERS,
    userId: searchParams.get('userId') ?? '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = usePageSize('pref_txLimit', [5, 10, 20, 50], 10);

  const usersQuery = useUsersList();
  const userById = (id: string) => usersQuery.data?.find((u) => u.id === id);
  const nameOf = (id: string) => userById(id)?.name ?? id.slice(0, 8);

  // Mobile: infinite query driven by same filter criteria
  const mobileCriteria = useMemo(
    () => ({
      userId: filters.userId || undefined,
      status: filters.status || undefined,
      fromDate: filters.fromDate ? new Date(filters.fromDate).toISOString() : undefined,
      toDate: filters.toDate ? new Date(filters.toDate).toISOString() : undefined,
    }),
    [filters.userId, filters.status, filters.fromDate, filters.toDate],
  );
  const infiniteQuery = useInfiniteTransactionsList(mobileCriteria);
  const allMobileTx = useMemo(
    () => infiniteQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [infiniteQuery.data],
  );

  const renderTxCard = (tx: Transaction) => (
    <Link to={`/transacciones/${tx.id}`} className={styles.txItem}>
      <div className={styles.txTop}>
        <span className={styles.txId}>{tx.id.slice(0, 8)}…</span>
        <StatusBadge status={tx.status} />
      </div>
      <span className={styles.txParticipants}>
        {nameOf(tx.originUserId)} → {nameOf(tx.destinationUserId)}
      </span>
      <div className={styles.txBottom}>
        <span className={styles.txMeta}>{formatDateTime(tx.createdAt)}</span>
        <span className={styles.txAmount}>{formatCurrency(tx.amount)}</span>
      </div>
    </Link>
  );

  const txColumns: DataTableColumn<Transaction>[] = [
    {
      key: 'id',
      label: 'ID',
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
      cellClassName: styles.amount,
      render: (tx) => formatCurrency(tx.amount),
    },
    {
      key: 'status',
      label: 'Estado',
      render: (tx) => <StatusBadge status={tx.status} />,
    },
    {
      key: 'date',
      label: 'Fecha',
      cellClassName: styles.muted,
      render: (tx) => formatDateTime(tx.createdAt),
    },
    {
      key: 'actions',
      label: 'Acciones',
      align: 'center',
      render: () => (
        <span className={styles.eye} aria-label="Ver detalle">
          <Eye size={16} />
        </span>
      ),
    },
  ];

  const criteria: TransactionCriteria = {
    page,
    limit,
    userId: filters.userId || undefined,
    status: filters.status || undefined,
    fromDate: filters.fromDate ? new Date(filters.fromDate).toISOString() : undefined,
    toDate: filters.toDate ? new Date(filters.toDate).toISOString() : undefined,
  };
  const txQuery = useTransactionsList(criteria);

  const filteredRows = txQuery.data?.data ?? [];

  const handleFilterChange = (patch: Partial<FiltersState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }

  return (
    <>
      <PageHead
        title="Transacciones"
        action={
          <span className="desktopOnly">
            <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
              Nueva Transacción
            </Button>
          </span>
        }
      />
      {/* Mobile collapsible filters */}
      <div className={styles.mobileFilters}>
        <Card>
          <button
            type="button"
            className={styles.filtersBar}
            onClick={() => setFiltersOpen((v) => !v)}
            style={{ background: 'transparent', border: 'none', width: '100%' }}
          >
            <span className={styles.filtersTitle}>Filtros</span>
            {filtersOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {filtersOpen && (
            <TransactionFiltersPanel
              variant="mobile"
              filters={filters}
              users={usersQuery.data ?? []}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
            />
          )}
        </Card>
      </div>

      {/* Desktop toolbar */}
      <div className={styles.toolbar}>
        <TransactionFiltersPanel
          variant="desktop"
          filters={filters}
          users={usersQuery.data ?? []}
          onFilterChange={handleFilterChange}
          onClear={clearFilters}
        />
      </div>

      {/* Mobile infinite list */}
      <div className="mobileOnly">
        {infiniteQuery.isError ? (
          <ErrorBanner message="Error al cargar transacciones" onRetry={() => infiniteQuery.refetch()} />
        ) : infiniteQuery.isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={88} />
            ))}
          </div>
        ) : (
          <InfiniteList
            items={allMobileTx}
            renderItem={renderTxCard}
            getItemKey={(tx) => tx.id}
            hasNextPage={infiniteQuery.hasNextPage}
            isFetchingNextPage={infiniteQuery.isFetchingNextPage}
            onLoadMore={infiniteQuery.fetchNextPage}
            skeletonHeight={88}
            emptyState={
              <EmptyState
                title="No se encontraron transacciones"
                description="Probá ajustar los filtros."
                action={
                  <Button variant="ghost" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                }
              />
            }
          />
        )}
      </div>

      {/* Desktop table */}
      <div className="desktopOnly">
        {txQuery.isError ? (
          <ErrorBanner message="Error al cargar transacciones" onRetry={() => txQuery.refetch()} />
        ) : txQuery.isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} height={52} />
            ))}
          </div>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            title="No se encontraron transacciones"
            description="Probá ajustar los filtros."
            action={
              <Button variant="ghost" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <DataTable
            columns={txColumns}
            rows={filteredRows}
            getRowKey={(tx) => tx.id}
            onRowClick={(tx) => navigate(`/transacciones/${tx.id}`)}
            footerInfo={`Mostrando ${Math.min((page - 1) * limit + 1, txQuery.data!.pagination.total)}–${Math.min(page * limit, txQuery.data!.pagination.total)} de ${txQuery.data!.pagination.total} transacciones`}
            pagination={
              <Pagination
                compact
                page={page}
                limit={limit}
                total={txQuery.data!.pagination.total}
                onPageChange={setPage}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageSizeChange={(size) => { setLimit(size); setPage(1); }}
              />
            }
          />
        )}
      </div>
    </>
  );
}
