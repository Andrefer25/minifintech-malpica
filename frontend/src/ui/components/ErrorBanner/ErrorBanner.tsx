import { AlertCircle } from 'lucide-react';
import { Button } from '@/ui/components/Button/Button';
import styles from './ErrorBanner.module.css';

export interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div role="alert" className={styles.banner}>
      <span className={styles.icon}>
        <AlertCircle size={18} />
      </span>
      <span className={styles.message}>{message}</span>
      {onRetry && (
        <span className={styles.action}>
          <Button size="sm" variant="ghost" onClick={onRetry}>
            Reintentar
          </Button>
        </span>
      )}
    </div>
  );
}
