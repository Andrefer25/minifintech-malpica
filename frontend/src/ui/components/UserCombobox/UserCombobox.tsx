import { useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { User } from '@/domain/user/user';
import { cx } from '@/utils/cx';
import styles from './UserCombobox.module.css';

export interface UserComboboxProps {
  users: User[];
  value: string;
  onChange: (userId: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  help?: string;
  disabled?: boolean;
  getSecondaryLabel?: (user: User) => string;
  debounceMs?: number;
}

export function UserCombobox({
  users,
  value,
  onChange,
  label,
  placeholder = 'Buscar usuario…',
  error,
  help,
  disabled = false,
  getSecondaryLabel = (u) => u.email,
  debounceMs = 200,
}: UserComboboxProps) {
  const inputId = useId();
  const selectedUser = users.find((u) => u.id === value) ?? null;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const filtered = debouncedQuery.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(debouncedQuery.toLowerCase().trim()))
    : users;

  function select(user: User) {
    onChange(user.id);
    setQuery('');
    setDebouncedQuery('');
    setOpen(false);
  }

  function clear() {
    onChange('');
    setQuery('');
    setDebouncedQuery('');
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        setDebouncedQuery('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className={styles.field} ref={containerRef}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={cx(styles.inputWrap, error && styles.errorWrap, disabled && styles.disabledWrap)}>
        <Search size={14} className={styles.icon} />
        {selectedUser ? (
          <span className={styles.selected}>{selectedUser.name}</span>
        ) : (
          <input
            id={inputId}
            type="text"
            className={styles.input}
            placeholder={disabled ? 'Seleccionar origen primero…' : placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            disabled={disabled}
          />
        )}
        {!disabled && (selectedUser || query) && (
          <button type="button" className={styles.clear} onClick={clear} aria-label="Limpiar">
            <X size={14} />
          </button>
        )}
      </div>

      {(error || help) && (
        <span className={cx(styles.helpText, error && styles.helpError)}>
          {error ?? help}
        </span>
      )}

      {open && !selectedUser && !disabled && (
        <ul className={styles.dropdown} role="listbox">
          {filtered.length === 0 ? (
            <li className={styles.empty}>Sin resultados</li>
          ) : (
            filtered.slice(0, 8).map((u) => (
              <li key={u.id} className={styles.option} role="option" aria-selected={false} onMouseDown={() => select(u)}>
                <span className={styles.optionName}>{u.name}</span>
                <span className={styles.optionEmail}>{getSecondaryLabel(u)}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
