import type { User } from '@/domain/user/user';
import type { TransactionStatus } from '@/domain/transaction/transaction';
import { Input } from '@/ui/components/Input/Input';
import { Button } from '@/ui/components/Button/Button';
import { UserCombobox } from '@/ui/components/UserCombobox/UserCombobox';
import styles from './TransactionFiltersPanel.module.css';

export interface FiltersState {
  status: TransactionStatus | '';
  fromDate: string;
  toDate: string;
  userId: string;
}

export const EMPTY_FILTERS: FiltersState = {
  status: '',
  fromDate: '',
  toDate: '',
  userId: '',
};

const STATUS_OPTIONS: { value: TransactionStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'APPROVED', label: 'Aprobada' },
  { value: 'COMPLETED', label: 'Completada' },
  { value: 'REJECTED', label: 'Rechazada' },
];

interface TransactionFiltersPanelProps {
  variant: 'mobile' | 'desktop';
  filters: FiltersState;
  users: User[];
  onFilterChange: (patch: Partial<FiltersState>) => void;
  onClear: () => void;
}

export function TransactionFiltersPanel({
  variant,
  filters,
  users,
  onFilterChange,
  onClear,
}: TransactionFiltersPanelProps) {
  if (variant === 'mobile') {
    return (
      <div className={styles.filtersBody}>
        <Input
          label="Fecha desde"
          type="date"
          value={filters.fromDate}
          onChange={(e) => onFilterChange({ fromDate: e.target.value })}
        />
        <Input
          label="Fecha hasta"
          type="date"
          value={filters.toDate}
          onChange={(e) => onFilterChange({ toDate: e.target.value })}
        />
        <div className={styles.mobileSelectGroup}>
          <span className={styles.mobileSelectLabel}>Estado</span>
          <select
            className={styles.mobileSelect}
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value as TransactionStatus | '' })}
          >
            <option value="">Todos</option>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.mobileSelectGroup}>
          <UserCombobox
            label="Usuario"
            users={users}
            value={filters.userId}
            onChange={(uid) => onFilterChange({ userId: uid })}
            placeholder="Buscar por nombre…"
          />
        </div>
        <div className={styles.filterActions}>
          <Button variant="ghost" onClick={onClear}>
            Limpiar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.toolField}>
        <label>Fecha desde</label>
        <input
          type="date"
          className={styles.toolInput}
          value={filters.fromDate}
          onChange={(e) => onFilterChange({ fromDate: e.target.value })}
        />
      </div>
      <div className={styles.toolField}>
        <label>Fecha hasta</label>
        <input
          type="date"
          className={styles.toolInput}
          value={filters.toDate}
          onChange={(e) => onFilterChange({ toDate: e.target.value })}
        />
      </div>
      <div className={styles.toolField}>
        <label>Estado</label>
        <select
          className={styles.toolInput}
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value as TransactionStatus | '' })}
        >
          <option value="">Todos</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div className={`${styles.toolField} ${styles.toolSearchField}`}>
        <label>Usuario</label>
        <UserCombobox
          users={users}
          value={filters.userId}
          onChange={(uid) => onFilterChange({ userId: uid })}
          placeholder="Buscar por nombre…"
        />
      </div>
      <div className={styles.toolActions}>
        <Button variant="ghost" onClick={onClear}>
          Limpiar
        </Button>
      </div>
    </>
  );
}
