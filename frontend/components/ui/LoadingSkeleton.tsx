'use client';

import styles from './LoadingSkeleton.module.css';

interface LoadingSkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function LoadingSkeleton({
  width = '100%',
  height = '1rem',
  className = '',
}: LoadingSkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <LoadingSkeleton width="60%" height="1.5rem" />
      <LoadingSkeleton width="40%" height="1rem" className={styles.marginTop} />
      <LoadingSkeleton width="80%" height="1rem" className={styles.marginTop} />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className={styles.listSkeleton}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
