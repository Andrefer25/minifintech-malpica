import { cx } from '@/utils/cx';
import styles from './Skeleton.module.css';

export interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  rounded?: boolean;
}

export function Skeleton({ width, height = 16, className, rounded }: SkeletonProps) {
  return (
    <span
      className={cx(styles.skeleton, className)}
      style={{
        width: typeof width === 'number' ? `${width}px` : (width ?? '100%'),
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: rounded ? '999px' : undefined,
      }}
    />
  );
}
