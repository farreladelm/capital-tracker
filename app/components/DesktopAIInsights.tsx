"use client";

import { useTrendsData } from "./TrendsDataProvider";
import { Skeleton } from "@/app/components/Skeleton";

export function DesktopAIInsights() {
  const { trendsData, isLoading } = useTrendsData();

  if (trendsData && !trendsData.hasTransactions) return null;

  return (
    <div className="hidden md:flex relative overflow-hidden bg-gradient-to-br from-primary/10 via-tertiary/10 to-surface-container-lowest/90 dark:from-primary/15 dark:via-tertiary/10 dark:to-background border border-primary/25 dark:border-primary/20 rounded-2xl p-5 shadow-sm items-start gap-4">
      <div className="absolute top-[-50px] right-[-50px] w-[200px] h-[200px] rounded-full bg-tertiary/20 dark:bg-tertiary/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-40px] left-[-40px] w-[150px] h-[150px] rounded-full bg-primary/20 dark:bg-primary/15 blur-2xl pointer-events-none" />

      <span className="material-symbols-outlined shrink-0 text-[20px] select-none mt-0.5 animate-pulse bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent font-bold">
        auto_awesome
      </span>
      <div className="flex flex-col gap-1.5 text-left relative z-10">
        <span className="font-label-sm uppercase tracking-wider font-extrabold bg-gradient-to-r from-primary to-tertiary dark:from-primary-fixed dark:to-tertiary-fixed bg-clip-text text-transparent font-bold">
          AI Insight
        </span>
        {isLoading ? (
          <div className="flex flex-col gap-2 mt-1.5 min-w-[200px]">
            <Skeleton className="h-3.5 w-full bg-tertiary/15" />
            <Skeleton className="h-3.5 w-5/6 bg-tertiary/15" />
          </div>
        ) : (
          <p className="text-[13.5px] text-on-surface-variant/90 dark:text-on-surface-variant font-medium leading-relaxed mt-0.5">
            {trendsData?.aiInsight || "No insights available for this month yet."}
          </p>
        )}
      </div>
    </div>
  );
}
