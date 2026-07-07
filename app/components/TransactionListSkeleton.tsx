"use client";

import { Skeleton } from "./Skeleton";

export function TransactionCardSkeleton() {
  return (
    <div className="flex items-center justify-between py-4 border-b border-surface-variant last:border-b-0 gap-4">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
          <Skeleton className="h-4 w-28 rounded" />
          <Skeleton className="h-3.5 w-20 rounded" />
        </div>
      </div>
      <Skeleton className="h-4 w-16 rounded shrink-0" />
    </div>
  );
}

export function TransactionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl soft-card-shadow flex flex-col overflow-hidden px-4">
      {Array.from({ length: count }).map((_, i) => (
        <TransactionCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function HistorySkeleton() {
  return (
    <div className="space-y-7 pb-4">
      <div>
        {/* Date label skeleton */}
        <div className="pt-4 pb-1 mb-2">
          <Skeleton className="h-3.5 w-16 rounded" />
        </div>
        <TransactionListSkeleton count={3} />
      </div>

      <div>
        {/* Date label skeleton */}
        <div className="pt-4 pb-1 mb-2">
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>
        <TransactionListSkeleton count={2} />
      </div>
    </div>
  );
}
