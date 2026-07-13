"use client";

import { useMemo } from "react";
import { TrendChart } from "@/app/components/TrendChart";
import { DonutChart } from "@/app/components/DonutChart";
import Link from "next/link";
import { Skeleton } from "@/app/components/Skeleton";
import { MonthSelector } from "@/app/components/MonthSelector";
import { formatCurrency } from "@/lib/utils";
import { useTrendsData } from "./TrendsDataProvider";

export function DesktopTrendsSection() {
  const { selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, trendsData, isLoading } = useTrendsData();

  const budgetsWithStatus = useMemo(() => {
    if (!trendsData?.budgets) return [];
    const userCurrency = trendsData.currency || "USD";
    const userLocale = trendsData.locale || "en-US";

    const getStatusText = (spent: number, limit: number, period: string) => {
      const diff = limit - spent;
      const formattedDiff = formatCurrency(Math.abs(diff), userCurrency, { locale: userLocale, compact: true });
      
      let suffix = "";
      if (period === "WEEKLY") suffix = " this week";
      else if (period === "YEARLY") suffix = " this year";
      else suffix = " remaining";

      if (diff >= 0) {
        return `${formattedDiff} remaining${suffix}`;
      } else {
        return `${formattedDiff} over limit${suffix}`;
      }
    };

    return trendsData.budgets.map((b: any) => {
      const ratio = b.limit > 0 ? b.spent / b.limit : 0;
      
      let statusColor = "text-secondary";
      let barColor = "bg-green-600 dark:bg-green-500";
      let iconName = "check_circle";
      let iconColor = "text-green-600 dark:text-green-400";
      let iconFill = false;

      if (ratio > 1.0) {
        statusColor = "text-error";
        barColor = "bg-error";
        iconName = "error";
        iconColor = "text-error";
        iconFill = true;
      } else if (ratio >= 0.7) {
        statusColor = "text-amber-600 dark:text-amber-400";
        barColor = "bg-amber-500 dark:bg-amber-400";
        iconName = "warning";
        iconColor = "text-amber-500 dark:text-amber-400";
        iconFill = true;
      }

      return {
        ...b,
        statusText: getStatusText(b.spent, b.limit, b.period),
        statusColor,
        barColor,
        iconName,
        iconColor,
        iconFill,
      };
    });
  }, [trendsData]);

  const userCurrency = trendsData?.currency || "USD";
  const userLocale = trendsData?.locale || "en-US";

  return (
    <div id="trends" className="hidden md:flex flex-col gap-stack-lg lg:col-span-12 border-t border-surface-variant/40 pt-12 mt-12 scroll-mt-20 text-on-surface">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <section className="text-left flex flex-col gap-1">
          <span className="font-label-sm text-primary uppercase tracking-wider">Overview</span>
          <h2 className="font-headline-lg text-on-surface">Analytics & Trends</h2>
        </section>

        <MonthSelector 
          selectedMonth={selectedMonth} 
          onMonthChange={setSelectedMonth} 
          selectedYear={selectedYear} 
          onYearChange={setSelectedYear} 
          activeMonthsByYear={trendsData?.activeMonthsByYear}
        />
      </div>

      {trendsData && !trendsData.hasTransactions ? (
        <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 border border-outline-variant bg-surface-container-lowest/80 rounded-3xl gap-5 relative overflow-hidden shadow-sm">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-tertiary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/25">
            <span className="material-symbols-outlined text-[32px] text-primary select-none font-light animate-pulse">
              insights
            </span>
          </div>

          <div className="flex flex-col gap-2 max-w-sm">
            <h3 className="font-headline-sm text-on-surface font-bold">No analytics data yet</h3>
            <p className="font-body-md text-on-surface-variant">
              Log transactions first to see your monthly trends, category distribution, and AI insights.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Spending Trend (Line Chart) */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-on-surface">Spending Trend</h3>
            </div>
            
            {isLoading ? (
              <div className="flex-grow flex flex-col justify-between min-h-[250px] py-2">
                <div className="w-full flex-grow flex flex-col justify-between pb-6 pt-2">
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                </div>
                <div className="flex justify-between px-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            ) : (
              <div className="flex-grow flex items-center justify-center min-h-[250px]">
                <TrendChart data={trendsData?.trend || []} currencyCode={userCurrency} locale={userLocale} />
              </div>
            )}
          </div>

          {/* Category Distribution (Donut Chart) */}
          <div className="bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col">
            <h3 className="font-headline-md text-on-surface mb-6">Categories</h3>
            
            {isLoading ? (
              <div className="flex-grow w-full flex flex-col items-center justify-center min-h-[300px]">
                <div className="relative w-44 h-44 mb-8 shrink-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-[14px] border-surface-variant/20 animate-pulse" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Skeleton className="h-2 w-12 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="w-full grid grid-cols-1 gap-4 px-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between w-full">
                      <div className="flex items-center flex-1 pr-2">
                        <Skeleton className="w-3 h-3 rounded-full mr-3 shrink-0" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center">
                <DonutChart data={trendsData?.categories || []} currencyCode={userCurrency} locale={userLocale} />
              </div>
            )}
          </div>

          {/* Monthly Comparison Card */}
          <div className="bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between min-h-[300px]">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-on-surface">Comparison</h3>
                
                {isLoading ? (
                  <Skeleton className="h-5 w-16 rounded-full" />
                ) : (
                  <span className={`font-label-sm px-2.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                    (trendsData?.comparison?.percentChange || 0) < 0 
                      ? "bg-green-100/60 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
                      : "bg-red-100/60 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {(trendsData?.comparison?.percentChange || 0) < 0 ? "trending_down" : "trending_up"}
                    </span>
                    {Math.abs(trendsData?.comparison?.percentChange || 0)}%
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex flex-col gap-2 py-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-4 w-full mt-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div className="py-2">
                  <span className="text-[10px] text-secondary uppercase tracking-wider block mb-1">Net Difference</span>
                  <div className="flex items-baseline gap-1.5">
                    <h3 className={`text-4xl font-extrabold tracking-tight ${
                      (trendsData?.comparison?.percentChange || 0) < 0 ? "text-primary dark:text-primary-fixed" : "text-error"
                    }`}>
                      {(trendsData?.comparison?.percentChange || 0) < 0 ? "-" : "+"}
                      {formatCurrency(Math.abs((trendsData?.comparison?.thisPeriod || 0) - (trendsData?.comparison?.prevPeriod || 0)), userCurrency, { locale: userLocale, compact: true })}
                    </h3>
                    <span className="text-xs font-semibold text-secondary">
                      {(trendsData?.comparison?.percentChange || 0) < 0 ? "less" : "more"}
                    </span>
                  </div>
                  <p className="font-label-sm text-secondary mt-3 leading-relaxed">
                    You spent <strong className="text-on-surface font-semibold">{formatCurrency(trendsData?.comparison?.thisPeriod || 0, userCurrency, { locale: userLocale })}</strong> this period compared to <strong className="text-on-surface-variant font-medium">{formatCurrency(trendsData?.comparison?.prevPeriod || 0, userCurrency, { locale: userLocale })}</strong> in the previous month.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-surface-variant/40 pt-4 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary font-medium">Daily Burn Rate</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-semibold text-on-surface">
                    {formatCurrency((trendsData?.comparison?.thisPeriod || 0) / 30, userCurrency, { locale: userLocale, compact: true })} / day
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary font-medium">Previous Burn Rate</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-medium text-on-surface-variant">
                    {formatCurrency((trendsData?.comparison?.prevPeriod || 0) / 30, userCurrency, { locale: userLocale, compact: true })} / day
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Budget Progress Card */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between">
            <div className="flex flex-col flex-grow">
              <h3 className="font-headline-md text-on-surface mb-5">Budgets</h3>
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 flex-grow">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-[18px] h-[18px] rounded-full shrink-0" />
                          <div className="flex flex-col gap-1.5">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-2.5 w-24" />
                          </div>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <Skeleton className="h-3 w-10" />
                          <Skeleton className="h-2.5 w-8" />
                        </div>
                      </div>
                      <div className="w-full bg-surface-variant/30 rounded-full h-1.5 animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 flex-grow">
                  {budgetsWithStatus.map((budget: any) => {
                    const isOver = budget.spent > budget.limit;
                    return (
                      <div key={budget.id} className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${budget.iconColor}`} style={{ fontVariationSettings: `"FILL" ${budget.iconFill ? 1 : 0}` }}>
                              {budget.iconName}
                            </span>
                            <div className="flex flex-col text-left">
                              <span className="font-label-md font-semibold text-on-surface">{budget.categoryName}</span>
                              <span className={`font-label-sm ${budget.statusColor}`}>{budget.statusText}</span>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1 text-xs">
                            <span className="font-semibold text-on-surface">
                              {formatCurrency(budget.spent, userCurrency, { locale: userLocale, compact: true })}
                            </span>
                            <span className="text-secondary">
                              / {formatCurrency(budget.limit, userCurrency, { locale: userLocale, compact: true })}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full ${budget.barColor}`} style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                  {budgetsWithStatus.length === 0 && (
                    <div className="flex-grow flex items-center justify-center py-4">
                      <span className="font-label-md text-secondary">No budgets defined.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
