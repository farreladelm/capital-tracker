"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { BottomNav } from "@/app/components/BottomNav";
import { TrendChart } from "@/app/components/TrendChart";
import { DonutChart } from "@/app/components/DonutChart";
import Link from "next/link";
import { MainContainer } from "@/app/components/MainContainer";
import { Skeleton } from "@/app/components/Skeleton";
import { MonthSelector } from "@/app/components/MonthSelector";
import { formatCurrency } from "@/lib/utils";

export default function TrendsPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ["jan", "feb", "mar", "apr", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];
    return months[new Date().getUTCMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getUTCFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<any>(null);
  const trendsCacheRef = useRef<Record<string, any>>({});

  useEffect(() => {
    let active = true;
    const cacheKey = `${selectedYear}-${selectedMonth}`;

    if (trendsCacheRef.current[cacheKey]) {
      setTrendsData(trendsCacheRef.current[cacheKey]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    fetch(`/api/trends?month=${selectedMonth}&year=${selectedYear}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trends");
        return res.json();
      })
      .then((data) => {
        if (active) {
          trendsCacheRef.current[cacheKey] = data;
          setTrendsData(data);
          setIsLoading(false);

          // Auto-align selected date parameters with available range if not yet set
          if (data.activeMonthsByYear) {
            const years = Object.keys(data.activeMonthsByYear).sort((a, b) => b.localeCompare(a));
            if (years.length > 0) {
              let targetYear = selectedYear;
              if (!data.activeMonthsByYear[selectedYear]) {
                targetYear = years[0];
                setSelectedYear(years[0]);
              }
              const months = data.activeMonthsByYear[targetYear] || [];
              if (months.length > 0 && !months.includes(selectedMonth)) {
                setSelectedMonth(months[months.length - 1]);
              }
            }
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (monthId: string) => {
    if (monthId === selectedMonth) return;
    setSelectedMonth(monthId);
  };

  const handleYearChange = (yearId: string) => {
    if (yearId === selectedYear) return;

    // Auto-align month if it's not active in the newly selected year to prevent double fetch
    const activeMonthsInYear = trendsData?.activeMonthsByYear?.[yearId] || [];
    if (activeMonthsInYear.length > 0 && !activeMonthsInYear.includes(selectedMonth)) {
      setSelectedMonth(activeMonthsInYear[activeMonthsInYear.length - 1]);
    }
    setSelectedYear(yearId);
  };

  const budgetsWithStatus = useMemo(() => {
    if (!trendsData?.budgets) return [];
    const userCurrency = trendsData.currency || "USD";
    const userLocale = trendsData.locale || "en-US";


    const getStatusText = (spent: number, limit: number) => {
      const diff = limit - spent;
      const formattedDiff = formatCurrency(Math.abs(diff), userCurrency, { locale: userLocale, compact: true });
      return diff >= 0 ? `${formattedDiff} remaining` : `${formattedDiff} over limit`;
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
        statusText: getStatusText(b.spent, b.limit),
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
    <>
      {/* TopAppBar (Desktop) */}
      <header className="hidden md:flex justify-between items-center px-margin-page h-16 w-full z-50 fixed top-0 bg-background/80 dark:bg-background/80 backdrop-blur-xl border-b border-surface-variant/50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary dark:text-primary-fixed">account_balance_wallet</span>
          <span className="font-headline-md font-bold text-primary dark:text-primary-fixed">Balance</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-on-surface-variant hover:opacity-80 transition-opacity font-label-md">Home</Link>
          <Link href="/history" className="text-on-surface-variant hover:opacity-80 transition-opacity font-label-md">History</Link>
          <Link href="/trends" className="text-primary dark:text-primary-fixed font-semibold hover:opacity-80 transition-opacity font-label-md">Trends</Link>
          <Link href="/account" className="text-on-surface-variant hover:opacity-80 transition-opacity font-label-md">Profile</Link>
        </div>
        <div className="active-press transition-transform">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </div>
      </header>

      {/* Main Content */}
      <MainContainer className="pt-8 md:pt-24 gap-stack-lg max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <section className="text-left flex flex-col gap-1">
            <span className="font-label-sm text-primary uppercase tracking-wider">Overview</span>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface">Analytics</h1>
          </section>

          <MonthSelector 
            selectedMonth={selectedMonth} 
            onMonthChange={handleMonthChange} 
            selectedYear={selectedYear} 
            onYearChange={handleYearChange} 
            activeMonthsByYear={trendsData?.activeMonthsByYear}
          />
        </div>

        {trendsData && !trendsData.hasTransactions ? (
          <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 border border-outline-variant bg-surface-container-lowest/80 rounded-3xl gap-5 relative overflow-hidden shadow-sm">
            {/* Subtle ambient glow matching our brand colors */}
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
                Once you log your first income or expense, your monthly trends, category distributions, and AI-powered insights will appear here.
              </p>
            </div>

            <div className="mt-2 flex flex-col items-center gap-2">
              <span className="font-label-sm text-secondary/70">
                Tap the <strong className="text-primary font-bold">+</strong> button below to log your first transaction
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Insights Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* AI Insights Card */}
          <div className="relative overflow-hidden md:col-span-3 bg-gradient-to-br from-primary/10 via-tertiary/10 to-surface-container-lowest/90 dark:from-primary/15 dark:via-tertiary/10 dark:to-background border border-primary/25 dark:border-primary/20 rounded-2xl p-5 shadow-sm flex items-start gap-4">
            {/* Glowing AI Blobs matching our design system (Primary & Tertiary) */}
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
                  {trendsData?.aiInsight}
                </p>
              )}
            </div>
          </div>
          
          {/* Spending Trend (Line Chart) */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-headline-md text-on-surface">Spending Trend</h2>
            </div>
            
            {isLoading ? (
              <div className="flex-grow flex flex-col justify-between min-h-[250px] py-2">
                {/* Fake grid lines skeleton */}
                <div className="w-full flex-grow flex flex-col justify-between pb-6 pt-2">
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                  <Skeleton className="h-[1.5px] w-full" />
                </div>
                {/* Fake X-axis labels skeleton */}
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
            <h2 className="font-headline-md text-on-surface mb-6">Categories</h2>
            
            {isLoading ? (
              <div className="flex-grow w-full flex flex-col items-center justify-center min-h-[300px]">
                {/* Donut Chart Skeleton */}
                <div className="relative w-44 h-44 mb-8 shrink-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-[14px] border-surface-variant/20 animate-pulse" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Skeleton className="h-2 w-12 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                {/* Legend Skeleton */}
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
                <h2 className="font-headline-md text-on-surface">Comparison</h2>
                
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

            {/* Pace Details grid */}
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

          {/* Budget Progress Card inside Bento Grid */}
          <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between">
            <div className="flex flex-col flex-grow">
              <h2 className="font-headline-md text-on-surface mb-5">Budgets</h2>
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
                            <span 
                              className={`material-symbols-outlined shrink-0 text-[16px] leading-none ${budget.iconColor}`}
                              style={{ fontVariationSettings: budget.iconFill ? '"FILL" 1' : '"FILL" 0' }}
                            >
                              {budget.iconName}
                            </span>
                            <div>
                              <h3 className="text-[14px] font-bold text-on-surface leading-tight">{budget.name}</h3>
                              <p className="text-[11px] font-medium text-secondary mt-0.5 leading-none font-body">
                                {budget.statusText}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 text-on-surface">
                            <span className="text-[14px] font-bold">
                              {formatCurrency(budget.spent, userCurrency, { locale: userLocale, compact: true })}
                            </span>
                            <span className="text-[10px] font-medium text-secondary">
                              / {formatCurrency(budget.limit, userCurrency, { locale: userLocale, compact: true })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Micro Progress Bar */}
                        <div className="w-full bg-surface-variant/50 rounded-full h-1.5">
                          <div 
                            className={`${budget.barColor} h-1.5 rounded-full transition-all duration-500`} 
                            style={{ width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Footer to absorb grid stretch and anchor layout */}
            <div className="mt-6 pt-4 border-t border-surface-variant/40 flex justify-between items-center">
              <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">
                {isLoading ? "Loading budgets..." : `${budgetsWithStatus.length} active budget${budgetsWithStatus.length !== 1 ? "s" : ""}`}
              </span>
              <Link href="/settings" className="text-xs font-semibold text-primary hover:opacity-85 transition-opacity flex items-center gap-1 active-press">
                Manage Budgets
                <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
              </Link>
            </div>
          </div>

        </div>
        </>
        )}

      </MainContainer>

      <BottomNav />
    </>
  );
}
