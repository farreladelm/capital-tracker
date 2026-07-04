"use client";

import { useState, useEffect, useMemo } from "react";
import { BottomNav } from "@/app/components/BottomNav";
import { TrendChart } from "@/app/components/TrendChart";
import { DonutChart } from "@/app/components/DonutChart";
import Link from "next/link";
import { MainContainer } from "@/app/components/MainContainer";
import { Skeleton } from "@/app/components/Skeleton";
import { MonthSelector } from "@/app/components/MonthSelector";
import { formatCurrency } from "@/lib/utils";

export default function TrendsPage() {
  const [selectedMonth, setSelectedMonth] = useState("july");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [isLoading, setIsLoading] = useState(true);

  // Localized Multi-Currency Testing Mock
  // Toggle userCurrency to "IDR" and userLocale to "id-ID" to test Rupiah compact formatting immediately!
  const userCurrency = "IDR"; 
  const userLocale = "id-ID";
  const multiplier = userCurrency === "IDR" ? 15000 : 1;


  useEffect(() => {
    // Initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleMonthChange = (monthId: string) => {
    if (monthId === selectedMonth) return;
    setIsLoading(true);
    setSelectedMonth(monthId);
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleYearChange = (yearId: string) => {
    if (yearId === selectedYear) return;
    setIsLoading(true);
    setSelectedYear(yearId);
    // Simulate API fetch delay
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  // Mock Data by Month (determinsitic fallback if month not explicitly mapped)
  const monthlyData: Record<string, {
    trend: { day: string; amount: number }[];
    categories: { name: string; amount: number; color: string }[];
    budgets: any[];
    comparison: { thisPeriod: number; prevPeriod: number; percentChange: number };
  }> = {
    july: {
      trend: [
        { day: "1", amount: 150 }, { day: "5", amount: 300 }, { day: "10", amount: 250 },
        { day: "15", amount: 400 }, { day: "20", amount: 350 }, { day: "25", amount: 600 },
        { day: "30", amount: 500 },
      ],
      categories: [
        { name: "Food", amount: 480, color: "#4c4bc6" },
        { name: "Transport", amount: 300, color: "#6665e0" },
        { name: "Entertainment", amount: 240, color: "#72728c" },
        { name: "Other", amount: 180, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 480, limit: 500, barColor: "bg-primary", statusText: "$20 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 300, limit: 250, barColor: "bg-error", statusText: "$50 over", statusColor: "text-error" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 240, limit: 300, barColor: "bg-primary", statusText: "$60 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 180, limit: 200, barColor: "bg-primary", statusText: "$20 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 1200, prevPeriod: 1450, percentChange: -17 }
    },
    june: {
      trend: [
        { day: "1", amount: 200 }, { day: "5", amount: 150 }, { day: "10", amount: 320 },
        { day: "15", amount: 180 }, { day: "20", amount: 450 }, { day: "25", amount: 300 },
        { day: "30", amount: 280 },
      ],
      categories: [
        { name: "Food", amount: 350, color: "#4c4bc6" },
        { name: "Transport", amount: 250, color: "#6665e0" },
        { name: "Entertainment", amount: 180, color: "#72728c" },
        { name: "Other", amount: 120, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 350, limit: 500, barColor: "bg-primary", statusText: "$150 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 250, limit: 250, barColor: "bg-primary", statusText: "$0 left", statusColor: "text-secondary" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 180, limit: 300, barColor: "bg-primary", statusText: "$120 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 120, limit: 200, barColor: "bg-primary", statusText: "$80 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 900, prevPeriod: 1050, percentChange: -14 }
    },
    may: {
      trend: [
        { day: "1", amount: 100 }, { day: "5", amount: 250 }, { day: "10", amount: 400 },
        { day: "15", amount: 220 }, { day: "20", amount: 300 }, { day: "25", amount: 480 },
        { day: "30", amount: 410 },
      ],
      categories: [
        { name: "Food", amount: 500, color: "#4c4bc6" },
        { name: "Transport", amount: 200, color: "#6665e0" },
        { name: "Entertainment", amount: 300, color: "#72728c" },
        { name: "Other", amount: 150, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 500, limit: 500, barColor: "bg-primary", statusText: "$0 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 200, limit: 250, barColor: "bg-primary", statusText: "$50 left", statusColor: "text-secondary" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 300, limit: 300, barColor: "bg-primary", statusText: "$0 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 150, limit: 200, barColor: "bg-primary", statusText: "$50 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 1150, prevPeriod: 980, percentChange: 17 }
    },
    apr: {
      trend: [
        { day: "1", amount: 180 }, { day: "5", amount: 220 }, { day: "10", amount: 300 },
        { day: "15", amount: 250 }, { day: "20", amount: 400 }, { day: "25", amount: 350 },
        { day: "30", amount: 320 },
      ],
      categories: [
        { name: "Food", amount: 400, color: "#4c4bc6" },
        { name: "Transport", amount: 220, color: "#6665e0" },
        { name: "Entertainment", amount: 280, color: "#72728c" },
        { name: "Other", amount: 140, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 400, limit: 500, barColor: "bg-primary", statusText: "$100 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 220, limit: 250, barColor: "bg-primary", statusText: "$30 left", statusColor: "text-secondary" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 280, limit: 300, barColor: "bg-primary", statusText: "$20 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 140, limit: 200, barColor: "bg-primary", statusText: "$60 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 1040, prevPeriod: 1120, percentChange: -7 }
    },
    mar: {
      trend: [
        { day: "1", amount: 90 }, { day: "5", amount: 180 }, { day: "10", amount: 320 },
        { day: "15", amount: 200 }, { day: "20", amount: 280 }, { day: "25", amount: 420 },
        { day: "30", amount: 360 },
      ],
      categories: [
        { name: "Food", amount: 380, color: "#4c4bc6" },
        { name: "Transport", amount: 180, color: "#6665e0" },
        { name: "Entertainment", amount: 220, color: "#72728c" },
        { name: "Other", amount: 110, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 380, limit: 400, barColor: "bg-primary", statusText: "$20 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 180, limit: 200, barColor: "bg-primary", statusText: "$20 left", statusColor: "text-secondary" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 220, limit: 250, barColor: "bg-primary", statusText: "$30 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 110, limit: 150, barColor: "bg-primary", statusText: "$40 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 890, prevPeriod: 810, percentChange: 9 }
    },
    feb: {
      trend: [
        { day: "1", amount: 120 }, { day: "5", amount: 200 }, { day: "10", amount: 280 },
        { day: "15", amount: 190 }, { day: "20", amount: 310 }, { day: "25", amount: 390 },
        { day: "30", amount: 300 },
      ],
      categories: [
        { name: "Food", amount: 340, color: "#4c4bc6" },
        { name: "Transport", amount: 200, color: "#6665e0" },
        { name: "Entertainment", amount: 190, color: "#72728c" },
        { name: "Other", amount: 100, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 340, limit: 400, barColor: "bg-primary", statusText: "$60 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 220, limit: 200, barColor: "bg-primary", statusText: "$20 over", statusColor: "text-secondary" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 190, limit: 250, barColor: "bg-primary", statusText: "$60 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 100, limit: 150, barColor: "bg-primary", statusText: "$50 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 830, prevPeriod: 710, percentChange: 16 }
    },
    jan: {
      trend: [
        { day: "1", amount: 80 }, { day: "5", amount: 140 }, { day: "10", amount: 220 },
        { day: "15", amount: 170 }, { day: "20", amount: 260 }, { day: "25", amount: 350 },
        { day: "30", amount: 290 },
      ],
      categories: [
        { name: "Food", amount: 300, color: "#4c4bc6" },
        { name: "Transport", amount: 150, color: "#6665e0" },
        { name: "Entertainment", amount: 170, color: "#72728c" },
        { name: "Other", amount: 90, color: "#e4e1ec" },
      ],
      budgets: [
        { id: "b1", name: "Food", icon: "restaurant", iconColor: "text-primary", spent: 300, limit: 400, barColor: "bg-primary", statusText: "$100 left", statusColor: "text-secondary" },
        { id: "b2", name: "Transport", icon: "directions_car", iconColor: "text-primary", spent: 150, limit: 200, barColor: "bg-primary", statusText: "$50 left", statusColor: "text-secondary" },
        { id: "b3", name: "Entertainment", icon: "sports_esports", iconColor: "text-tertiary", spent: 170, limit: 250, barColor: "bg-primary", statusText: "$80 left", statusColor: "text-secondary" },
        { id: "b4", name: "Other", icon: "payments", iconColor: "text-secondary", spent: 90, limit: 150, barColor: "bg-primary", statusText: "$60 left", statusColor: "text-secondary" }
      ],
      comparison: { thisPeriod: 710, prevPeriod: 650, percentChange: 9 }
    }
  };

  const currentData = useMemo(() => {
    const raw = monthlyData[selectedMonth] || monthlyData["july"];

    const getStatusText = (spent: number, limit: number) => {
      const diff = limit - spent;
      const formattedDiff = formatCurrency(Math.abs(diff), userCurrency, { locale: userLocale, compact: true });
      return diff >= 0 ? `${formattedDiff} left` : `${formattedDiff} over`;
    };

    return {
      ...raw,
      trend: raw.trend.map(t => ({ ...t, amount: t.amount * multiplier })),
      categories: raw.categories.map(c => ({ ...c, amount: c.amount * multiplier })),
      budgets: raw.budgets.map(b => {
        const newSpent = b.spent * multiplier;
        const newLimit = b.limit * multiplier;
        const ratio = newLimit > 0 ? newSpent / newLimit : 0;
        
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
          spent: newSpent,
          limit: newLimit,
          statusText: getStatusText(newSpent, newLimit),
          statusColor,
          barColor,
          iconName,
          iconColor,
          iconFill
        };
      }),
      comparison: {
        thisPeriod: raw.comparison.thisPeriod * multiplier,
        prevPeriod: raw.comparison.prevPeriod * multiplier,
        percentChange: raw.comparison.percentChange
      }
    };
  }, [selectedMonth, multiplier]);

  const getAIInsight = (month: string, currency: string, multiplier: number) => {
    const fmt = (val: number) => formatCurrency(val * multiplier, currency, { locale: userLocale, compact: true });
    
    const insights: Record<string, string> = {
      july: `Your overall spending is down 17% this month. You managed to stay on track for Food, saving ${fmt(20)} under limit, but Transport exceeded your target by ${fmt(20)}. Overall, you saved ${fmt(250)} compared to last month.`,
      june: `Excellent month! You spent ${fmt(250)} less than the previous period (a 17% reduction). Your biggest saving was in Entertainment where you stayed ${fmt(60)} under budget.`,
      may: `Spending increased by 17% this month. This was driven by a rise in Entertainment and Food costs. Consider scaling back on dining out next period to recover your savings rate.`,
      apr: `A stable period. Your total expenses dropped by 7%. You kept the Other category tightly controlled, staying ${fmt(50)} under budget, offsetting a small overage in Transport.`,
      mar: `Expenses rose slightly by 9%. Food was your highest category, but you remained within your limits. Try batch-cooking to reduce your daily burn rate of ${fmt(27)}.`,
      feb: `Great progress! You saw a 16% decrease in total spending. Your Transport budget was optimal, and you saved ${fmt(110)} on Food limits.`,
      jan: `Your spending is stable. You stayed under budget on Food by ${fmt(100)} and Transport by ${fmt(50)}. Your daily burn rate averaged ${fmt(23)} per day.`
    };
    
    return insights[month] || insights["july"];
  };

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
          />
        </div>

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
                  {getAIInsight(selectedMonth, userCurrency, multiplier)}
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
                <TrendChart data={currentData.trend} currencyCode={userCurrency} locale={userLocale} />
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
                <DonutChart data={currentData.categories} currencyCode={userCurrency} locale={userLocale} />
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
                    currentData.comparison.percentChange < 0 
                      ? "bg-green-100/60 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
                      : "bg-red-100/60 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {currentData.comparison.percentChange < 0 ? "trending_down" : "trending_up"}
                    </span>
                    {Math.abs(currentData.comparison.percentChange)}%
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
                      currentData.comparison.percentChange < 0 ? "text-primary dark:text-primary-fixed" : "text-error"
                    }`}>
                      {currentData.comparison.percentChange < 0 ? "-" : "+"}
                      {formatCurrency(Math.abs(currentData.comparison.thisPeriod - currentData.comparison.prevPeriod), userCurrency, { locale: userLocale, compact: true })}
                    </h3>
                    <span className="text-xs font-semibold text-secondary">
                      {currentData.comparison.percentChange < 0 ? "less" : "more"}
                    </span>
                  </div>
                  <p className="font-label-sm text-secondary mt-3 leading-relaxed">
                    You spent <strong className="text-on-surface font-semibold">{formatCurrency(currentData.comparison.thisPeriod, userCurrency, { locale: userLocale })}</strong> this period compared to <strong className="text-on-surface-variant font-medium">{formatCurrency(currentData.comparison.prevPeriod, userCurrency, { locale: userLocale })}</strong> in the previous month.
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
                    {formatCurrency(currentData.comparison.thisPeriod / 30, userCurrency, { locale: userLocale, compact: true })} / day
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-secondary font-medium">Previous Burn Rate</span>
                {isLoading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span className="font-medium text-on-surface-variant">
                    {formatCurrency(currentData.comparison.prevPeriod / 30, userCurrency, { locale: userLocale, compact: true })} / day
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
                  {currentData.budgets.map((budget) => {
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
                              <p className="text-[11px] font-medium text-secondary mt-0.5 leading-none">
                                {isOver 
                                  ? `${formatCurrency(budget.spent - budget.limit, userCurrency, { locale: userLocale, compact: true })} over limit` 
                                  : `${formatCurrency(budget.limit - budget.spent, userCurrency, { locale: userLocale, compact: true })} remaining`
                                }
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
              <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">4 active budgets</span>
              <Link href="/settings" className="text-xs font-semibold text-primary hover:opacity-85 transition-opacity flex items-center gap-1 active-press">
                Manage Budgets
                <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
              </Link>
            </div>
          </div>

        </div>

      </MainContainer>

      <BottomNav />
    </>
  );
}
