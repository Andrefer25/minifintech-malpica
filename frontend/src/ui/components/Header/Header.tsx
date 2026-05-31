import styles from './Header.module.css';

export interface HeaderProps {
  onCreateTransaction: () => void;
}

export function Header({ onCreateTransaction: _ }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <span className={styles.brand}>
          <span className={styles.brandDot} />
          Belo Challenge
        </span>
      </div>
    </header>
  );
}
