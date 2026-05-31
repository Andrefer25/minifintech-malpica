import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Eye } from 'lucide-react';
import type { User } from '@/domain/user/user';
import { useDebounce } from '@/ui/hooks/useDebounce';
import { useUsersList } from '@/infrastructure/react-query/hooks/useUsersList';
import { useInfiniteUsersList } from '@/infrastructure/react-query/hooks/useInfiniteUsersList';
import { Input } from '@/ui/components/Input/Input';
import { Avatar } from '@/ui/components/Avatar/Avatar';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import { EmptyState } from '@/ui/components/EmptyState/EmptyState';
import { ErrorBanner } from '@/ui/components/ErrorBanner/ErrorBanner';
import { DataTable } from '@/ui/components/DataTable/DataTable';
import type { DataTableColumn } from '@/ui/components/DataTable/DataTable';
import { InfiniteList } from '@/ui/components/InfiniteList/InfiniteList';
import { formatCurrency } from '@/utils/format-currency';
import { formatDate } from '@/utils/format-date';
import { PageHead } from '@/ui/components/PageHead/PageHead';
import styles from './UsersScreen.module.css';

const COLUMNS: DataTableColumn<User>[] = [
  {
    key: 'id',
    label: 'ID',
    cellClassName: styles.mono,
    render: (u) => `${u.id.slice(0, 8)}…`,
  },
  {
    key: 'name',
    label: 'Nombre',
    cellClassName: styles.bold,
    render: (u) => u.name,
  },
  {
    key: 'email',
    label: 'Email',
    cellClassName: styles.muted,
    render: (u) => u.email,
  },
  {
    key: 'balance',
    label: 'Saldo',
    cellClassName: styles.amount,
    render: (u) => formatCurrency(u.balance),
  },
  {
    key: 'createdAt',
    label: 'Creado',
    cellClassName: styles.muted,
    render: (u) => (u.createdAt ? formatDate(u.createdAt) : '—'),
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

export function UsersScreen() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 250);

  // Desktop: full list for table + client-side filter
  const usersQuery = useUsersList();
  const filteredDesktop = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    const list = usersQuery.data ?? [];
    if (!q) return list;
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }, [usersQuery.data, debounced]);

  // Mobile: infinite paginated query
  const infiniteQuery = useInfiniteUsersList();
  const allMobileItems = useMemo(
    () => infiniteQuery.data?.pages.flatMap((p) => p.data) ?? [],
    [infiniteQuery.data],
  );
  const filteredMobile = useMemo(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return allMobileItems;
    return allMobileItems.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q),
    );
  }, [allMobileItems, debounced]);

  const renderUserCard = (u: User) => (
    <Link to={`/usuarios/${u.id}`} className={styles.userItem}>
      <Avatar name={u.name} />
      <div className={styles.userInfo}>
        <span className={styles.userName}>{u.name}</span>
        <span className={styles.userEmail}>{u.email}</span>
      </div>
      <div className={styles.userRight}>
        <div className={styles.userBalance}>{formatCurrency(u.balance)}</div>
        <span className={styles.viewLink}>
          Ver <ChevronRight size={12} style={{ verticalAlign: 'middle' }} />
        </span>
      </div>
    </Link>
  );

  return (
    <>
      <PageHead title="Usuarios" />
      <div className={styles.search}>
        <Input
          placeholder="Buscar por nombre, email o ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={18} />}
        />
      </div>

      {/* Mobile infinite list */}
      <div className="mobileOnly">
        {infiniteQuery.isError ? (
          <ErrorBanner message="Error al cargar usuarios" onRetry={() => infiniteQuery.refetch()} />
        ) : infiniteQuery.isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={72} />
            ))}
          </div>
        ) : (
          <InfiniteList
            items={filteredMobile}
            renderItem={renderUserCard}
            getItemKey={(u) => u.id}
            hasNextPage={infiniteQuery.hasNextPage}
            isFetchingNextPage={infiniteQuery.isFetchingNextPage}
            onLoadMore={infiniteQuery.fetchNextPage}
            skeletonHeight={72}
            emptyState={
              <EmptyState
                title="No se encontraron usuarios"
                description={debounced ? 'Probá con otros términos de búsqueda' : undefined}
              />
            }
          />
        )}
      </div>

      {/* Desktop table */}
      <div className="desktopOnly">
        {usersQuery.isError ? (
          <ErrorBanner message="Error al cargar usuarios" onRetry={() => usersQuery.refetch()} />
        ) : usersQuery.isLoading ? (
          <div className={styles.list}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={52} />
            ))}
          </div>
        ) : filteredDesktop.length === 0 ? (
          <EmptyState
            title="No se encontraron usuarios"
            description={debounced ? 'Probá con otros términos de búsqueda' : undefined}
          />
        ) : (
          <DataTable
            columns={COLUMNS}
            rows={filteredDesktop}
            getRowKey={(u) => u.id}
            onRowClick={(u) => navigate(`/usuarios/${u.id}`)}
            footerInfo={`Mostrando ${filteredDesktop.length} de ${usersQuery.data?.length ?? 0} usuarios`}
          />
        )}
      </div>
    </>
  );
}
