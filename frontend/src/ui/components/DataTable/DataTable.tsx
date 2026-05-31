import type { ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './DataTable.module.css';

export interface DataTableColumn<TRow> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: TRow) => ReactNode;
}

export interface DataTableProps<TRow> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  getRowKey: (row: TRow) => string;
  onRowClick?: (row: TRow) => void;
  footerInfo?: ReactNode;
  pagination?: ReactNode;
  className?: string;
}

export function DataTable<TRow>({
  columns,
  rows,
  getRowKey,
  onRowClick,
  footerInfo,
  pagination,
  className,
}: DataTableProps<TRow>) {
  const hasFooter = footerInfo != null || pagination != null;

  return (
    <div className={cx(styles.panel, className)}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={col.width != null ? { width: col.width } : undefined}
                className={cx(
                  col.align === 'right' && styles.right,
                  col.align === 'center' && styles.center,
                  col.headerClassName,
                )}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={getRowKey(row)}
              className={cx(styles.row, onRowClick != null && styles.clickable)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cx(
                    col.align === 'right' && styles.right,
                    col.align === 'center' && styles.center,
                    col.cellClassName,
                  )}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {hasFooter && (
        <div className={styles.footer}>
          <span className={styles.footerInfo}>{footerInfo}</span>
          {pagination}
        </div>
      )}
    </div>
  );
}
