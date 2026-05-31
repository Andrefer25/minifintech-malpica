import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '@/utils/cx';
import styles from './Input.module.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  help?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, help, leftIcon, rightIcon, className, id, containerClassName, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const messageId = `${inputId}-msg`;
  return (
    <div className={cx(styles.field, containerClassName)}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={cx(styles.inputWrapper, error && styles.error)}>
        {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cx(styles.input, className)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error || help ? messageId : undefined}
          {...rest}
        />
        {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
      </div>
      {(error || help) && (
        <span id={messageId} className={cx(styles.help, error && styles.helpError)}>
          {error ?? help}
        </span>
      )}
    </div>
  );
});
