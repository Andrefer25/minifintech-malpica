import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Skeleton } from '@/ui/components/Skeleton/Skeleton';
import styles from './InfiniteList.module.css';

interface InfiniteListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getItemKey: (item: T) => string;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  emptyState?: ReactNode;
  skeletonCount?: number;
  skeletonHeight?: number;
}

export function InfiniteList<T>({
  items,
  renderItem,
  getItemKey,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  emptyState,
  skeletonCount = 3,
  skeletonHeight = 72,
}: InfiniteListProps<T>) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          onLoadMore();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (items.length === 0 && !isFetchingNextPage) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <div key={getItemKey(item)}>{renderItem(item)}</div>
      ))}

      {isFetchingNextPage && (
        <div className={styles.loadingMore}>
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <Skeleton key={i} height={skeletonHeight} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />
    </div>
  );
}
