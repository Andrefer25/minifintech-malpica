import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '@/utils/cx';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  compact?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

function generatePages(current: number, total: number): (number | '...')[] {
  if (total <= 1) return [1];
  const candidates = new Set<number>([1, total]);
  if (current - 1 >= 1) candidates.add(current - 1);
  candidates.add(current);
  if (current + 1 <= total) candidates.add(current + 1);
  const sorted = Array.from(candidates).sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}

function Controls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = generatePages(page, totalPages);
  return (
    <div className={styles.controls}>
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={cx(styles.pageBtn, p === page && styles.active)}
            onClick={() => onPageChange(p as number)}
          >
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        className={styles.pageBtn}
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  compact = false,
  pageSizeOptions,
  onPageSizeChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const sizeSelect =
    pageSizeOptions && onPageSizeChange ? (
      <label className={styles.sizeLabel}>
        Filas
        <select
          className={styles.sizeSelect}
          value={limit}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    ) : null;

  if (compact) {
    return sizeSelect ? (
      <div className={styles.compactRow}>
        {sizeSelect}
        <Controls page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    ) : (
      <Controls page={page} totalPages={totalPages} onPageChange={onPageChange} />
    );
  }

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={styles.pagination}>
      <span className={styles.info}>
        {total === 0 ? 'Sin resultados' : `${from}–${to} de ${total}`}
      </span>
      <div className={styles.compactRow}>
        {sizeSelect}
        <Controls page={page} totalPages={totalPages} onPageChange={onPageChange} />
      </div>
    </div>
  );
}
