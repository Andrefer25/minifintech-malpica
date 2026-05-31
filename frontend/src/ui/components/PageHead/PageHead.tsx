import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './PageHead.module.css';

export interface PageHeadProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  backLabel?: string;
  action?: ReactNode;
}

export function PageHead({ title, subtitle, back, backLabel, action }: PageHeadProps) {
  const navigate = useNavigate();
  return (
    <div className={styles.head}>
      <div className={styles.headLeft}>
        {back && !backLabel && (
          <button
            type="button"
            className={styles.back}
            onClick={() => navigate(-1)}
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          {back && backLabel && (
            <button
              type="button"
              className={styles.backLink}
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={14} />
              {backLabel}
            </button>
          )}
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>
      {action && <div className={styles.headAction}>{action}</div>}
    </div>
  );
}
