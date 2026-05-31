import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cx } from '@/utils/cx';
import styles from './Textarea.module.css';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  help?: string;
  showCount?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, help, showCount, maxLength, className, id, value, ...rest },
  ref,
) {
  const reactId = useId();
  const fieldId = id ?? reactId;
  const length = typeof value === 'string' ? value.length : 0;
  return (
    <div className={styles.field}>
      {label && (
        <label htmlFor={fieldId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={fieldId}
        value={value}
        maxLength={maxLength}
        className={cx(styles.textarea, error && styles.error, className)}
        aria-invalid={Boolean(error) || undefined}
        {...rest}
      />
      <div className={styles.footer}>
        <span className={cx(error && styles.helpError)}>{error ?? help ?? ''}</span>
        {showCount && maxLength && (
          <span>
            {length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});
