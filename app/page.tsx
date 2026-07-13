import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransactionList } from "./components/TransactionList";
import { formatCurrency } from "@/lib/format";
import { BottomNav } from "./components/BottomNav";
import { DashboardChatbox } from "./components/DashboardChatbox";
import Link from "next/link";
import { BudgetService } from "@/lib/services/budget.service";
import type { TransactionModel as Transaction, CategoryModel as Category } from "@/generated/prisma/models";
import { DesktopTrendsSection } from "./components/DesktopTrendsSection";
import { TrendsDataProvider } from "./components/TrendsDataProvider";
import { DesktopAIInsights } from "./components/DesktopAIInsights";


type TransactionWithCategory = Transaction & {
  category: Category;
};

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.currency) {
    redirect("/onboarding");
  }

  // Pre-fetch initial data for the dashboard (Current Month)
  const today = new Date();
  const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0, 23, 59, 59, 999));

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startOfMonth, lte: endOfMonth },
    },
    include: { category: true },
    orderBy: { date: "desc" }
  });

  const categories = await prisma.category.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" }
  });

  let totalExpense = 0;
  let totalIncome = 0;
  const categorySums: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

  (transactions as unknown as TransactionWithCategory[]).forEach((txn) => {
    if (txn.type === "EXPENSE") {
      totalExpense += txn.amountMinor;
      if (!categorySums[txn.categoryId]) {
        categorySums[txn.categoryId] = {
          name: txn.category.name,
          color: txn.category.color,
          icon: txn.category.icon,
          amount: 0,
        };
      }
      categorySums[txn.categoryId].amount += txn.amountMinor;
    } else if (txn.type === "INCOME") {
      totalIncome += txn.amountMinor;
    }
  });

  const netCashFlow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 100) : 0;
  const targetSavingsRate = user.targetSavingsRate || 30;

  const expensesByCategory = Object.values(categorySums).sort((a, b) => b.amount - a.amount);
  const topExpense1 = expensesByCategory[0] || null;
  const topExpense2 = expensesByCategory[1] || null;

  const totalBudgetMinor = await BudgetService.getMonthlyBudgetLimit(user.id);
  const hasBudget = totalBudgetMinor > 0;
  const budgetPercentage = hasBudget ? Math.round((totalExpense / totalBudgetMinor) * 100) : 0;
  const remainingMinor = totalBudgetMinor - totalExpense;
  const formattedRemaining = formatCurrency(remainingMinor, user.currency);

  return (
    <TrendsDataProvider>
      {/* Mobile TopAppBar */}
      <header className="md:hidden bg-background/80 dark:bg-background/80 backdrop-blur-xl fixed top-0 w-full flex justify-between items-center px-margin-page h-16 z-50">
        <button className="text-on-surface-variant dark:text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 0` }}>account_balance_wallet</span>
        </button>
        <h1 className="font-headline-md font-bold text-primary dark:text-primary-fixed">Balance</h1>
        <form action={async () => {
            "use server";
            await signOut();
          }} className="flex items-center">
          <button type="submit" className="text-on-surface-variant dark:text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 0` }}>logout</span>
          </button>
        </form>
      </header>

      {/* Main Canvas */}
      <main className="pt-24 px-margin-page flex flex-col gap-stack-lg lg:grid lg:grid-cols-12 lg:gap-8 lg:max-w-6xl lg:mx-auto w-full mb-24 md:mb-36">
        
        {/* MOBILE-ONLY: Greeting & Balance Card */}
        <section className="md:hidden flex flex-col gap-stack-sm items-center text-center relative p-6 backdrop-blur-md bg-white/5 border border-white/20 shadow-2xl rounded-3xl">
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-3xl">
            <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[140%] opacity-40 blur-[80px]" style={{ background: 'radial-gradient(circle at 20% 30%, #5D5FEF 0%, transparent 50%), radial-gradient(circle at 80% 20%, #E2DFFF 0%, transparent 50%), radial-gradient(circle at 50% 80%, #FF8E8E 0%, transparent 50%)' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
          </div>
          <p className="text-xs font-light text-secondary/80">Good morning, {user.name?.split(' ')[0] || "User"}</p>
          <div className="flex flex-col items-center">
            <span className="text-sm uppercase tracking-wider mb-1 text-secondary">Total Spent This Month</span>
            <h2 className="font-display text-on-background drop-shadow-sm">{formatCurrency(totalExpense, user.currency)}</h2>
          </div>

          {/* Budget Bar */}
          <div className="w-full mt-4 bg-surface-container-high rounded-full h-2 overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${hasBudget ? Math.min((totalExpense / totalBudgetMinor) * 100, 100) : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between w-full mt-2">
            <span className="font-label-sm text-secondary">
              {hasBudget ? `${budgetPercentage}% of budget` : "No budget set"}
            </span>
            <span className="font-label-sm text-secondary">
              {hasBudget ? `${formattedRemaining} remaining` : "--"}
            </span>
          </div>
        </section>

        {/* DESKTOP-ONLY: Wide Overview Panel (col-span-12) */}
        <section className="hidden md:flex lg:col-span-12 bg-surface-container-lowest rounded-3xl p-8 soft-card-shadow justify-between items-center gap-8 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-30 blur-[80px]" style={{ background: 'radial-gradient(circle at 10% 20%, #4c4bc6 0%, transparent 40%), radial-gradient(circle at 90% 80%, #595a73 0%, transparent 40%)' }}></div>

          {/* Financial Metrics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-grow w-full">
            {/* Spent Metric */}
            <div className="flex flex-col gap-1 text-left">
              <span className="text-xs uppercase tracking-wider font-semibold text-secondary">Total Spent</span>
              <h2 className="font-display text-3xl text-on-background">{formatCurrency(totalExpense, user.currency)}</h2>
              <span className="text-xs text-secondary/80 mt-1">
                {hasBudget ? `${formattedRemaining} remaining` : "No budget set"}
              </span>
            </div>

            {/* Cash Flow Metric */}
            <div className="flex flex-col gap-1 text-left border-t sm:border-t-0 sm:border-l border-surface-variant/40 pt-4 sm:pt-0 sm:pl-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-secondary">Monthly Cash Flow</span>
              <div className="flex flex-col mt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">Income:</span>
                  <span className="text-green-600 font-semibold">+{formatCurrency(totalIncome, user.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-xs mt-0.5">
                  <span className="text-secondary">Expenses:</span>
                  <span className="text-error font-semibold">-{formatCurrency(totalExpense, user.currency)}</span>
                </div>
              </div>
              <span className={`text-xs font-bold mt-2 ${netCashFlow >= 0 ? "text-green-600" : "text-error"}`}>
                Net: {netCashFlow >= 0 ? "+" : ""}{formatCurrency(netCashFlow, user.currency)}
              </span>
            </div>

            {/* Savings Metric */}
            <div className="flex flex-col gap-1 text-left border-t sm:border-t-0 sm:border-l border-surface-variant/40 pt-4 sm:pt-0 sm:pl-6">
              <span className="text-xs uppercase tracking-wider font-semibold text-secondary">Savings Goal</span>
              <h3 className="text-xl font-bold text-on-background mt-1">
                {savingsRate}% <span className="text-xs font-normal text-secondary">/ {targetSavingsRate}% target</span>
              </h3>
              <p className="text-[10px] text-secondary leading-tight mt-2 font-body">
                {savingsRate >= targetSavingsRate 
                  ? "Great! You are exceeding target." 
                  : `Save ${formatCurrency(Math.max(0, Math.round((totalIncome * targetSavingsRate / 100) - netCashFlow)), user.currency)} more.`}
              </p>
            </div>
          </div>

          {/* Circular Progress Ring */}
          {hasBudget && (
            <div className="flex flex-col items-center justify-center shrink-0 w-32 h-32 relative">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="48" className="stroke-surface-container-high" strokeWidth="8" fill="transparent" />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-primary"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - Math.min(totalExpense / totalBudgetMinor, 1))}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-on-background">{budgetPercentage}%</span>
                <span className="text-[9px] uppercase tracking-wider text-secondary">Budget</span>
              </div>
            </div>
          )}
        </section>

        {/* Row 2 split below */}

        {/* Left Column (Bento Cards) */}
        <div className="flex flex-col gap-stack-lg lg:col-span-8">
          
          {/* Bento Grid: Categories, Weekly Trend, Net Cash Flow, Savings Goal */}
          <section className="grid grid-cols-1 xs:grid-cols-2 gap-gutter">
            
            {/* Categories Summary Card */}
            <Link href="/categories" className="bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40 hover:scale-[1.02] active:scale-[0.98] hover:bg-surface-container-low transition-all duration-200 group cursor-pointer">
              <div className="flex items-center gap-2 text-primary w-full">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>pie_chart</span>
                <span className="font-label-md font-semibold text-primary">Categories</span>
                <span className="material-symbols-outlined ml-auto text-secondary/50 group-hover:text-primary transition-colors" style={{ fontVariationSettings: `"FILL" 0` }}>chevron_right</span>
              </div>
              <div className="w-full">
                {topExpense1 && (
                  <div className="w-full">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-label-sm text-secondary truncate mr-2">{topExpense1.name}</span>
                      <span className="font-label-sm text-on-background font-semibold">{formatCurrency(topExpense1.amount, user.currency)}</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-tertiary rounded-full" style={{ width: `${Math.min((topExpense1.amount / totalExpense) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                )}
                {topExpense2 && (
                  <div className="w-full mt-3">
                    <div className="flex justify-between items-end mb-1">
                      <span className="font-label-sm text-secondary truncate mr-2">{topExpense2.name}</span>
                      <span className="font-label-sm text-on-background font-semibold">{formatCurrency(topExpense2.amount, user.currency)}</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-tertiary-container rounded-full" style={{ width: `${Math.min((topExpense2.amount / totalExpense) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </Link>

            {/* Weekly Trend Card */}
            <div className="bg-primary text-on-primary rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>trending_down</span>
                <span className="font-label-md font-semibold">Weekly Trend</span>
              </div>
              <div className="relative z-10">
                <h3 className="font-headline-lg-mobile mb-1">-12%</h3>
                <p className="font-label-sm text-on-primary/80 leading-tight">You&apos;re spending less than last week.</p>
              </div>
            </div>

            {/* Net Cash Flow Card (Mobile Only) */}
            <div className="md:hidden bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>payments</span>
                <span className="font-label-md font-semibold text-primary">Cash Flow</span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">Income:</span>
                  <span className="text-green-600 font-semibold">{formatCurrency(totalIncome, user.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-secondary">Expenses:</span>
                  <span className="text-error font-semibold">{formatCurrency(totalExpense, user.currency)}</span>
                </div>
                <div className="border-t border-surface-variant/40 mt-1 pt-1 flex justify-between items-center text-sm font-bold text-on-background">
                  <span>Net:</span>
                  <span className={netCashFlow >= 0 ? "text-green-600" : "text-error"}>
                    {netCashFlow >= 0 ? "+" : ""}{formatCurrency(netCashFlow, user.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Savings Goal Card (Mobile Only) */}
            <div className="md:hidden bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40">
              <div className="flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>savings</span>
                <span className="font-label-md font-semibold text-primary">Savings Goal</span>
              </div>
              <div className="flex flex-col">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[10px] text-secondary">Actual vs Target</span>
                  <span className="text-xs font-bold">{savingsRate}% / {targetSavingsRate}%</span>
                </div>
                <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden mt-1">
                  <div 
                    className={`h-full rounded-full ${savingsRate >= targetSavingsRate ? "bg-green-500" : "bg-primary"}`} 
                    style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-secondary mt-2 leading-tight font-body">
                  {savingsRate >= targetSavingsRate 
                    ? "Great! Exceeding savings target." 
                    : `Save ${formatCurrency(Math.max(0, Math.round((totalIncome * targetSavingsRate / 100) - netCashFlow)), user.currency)} more to hit goal.`}
                </p>
              </div>
            </div>

          </section>

          {/* Desktop-only AI Insights */}
          <DesktopAIInsights />

        </div>

        {/* Right Column (Recent Transactions) */}
        <section className="flex flex-col gap-stack-md lg:col-span-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-on-background">Recent</h3>
            <Link href="/history" className="font-label-md text-primary">See all</Link>
          </div>
          <TransactionList initialTransactions={transactions.slice(0, 5)} categories={categories} currency={user.currency} />
        </section>

        {/* Desktop Integrated Trends Section */}
        <DesktopTrendsSection />

      </main>

      <BottomNav />
      <DashboardChatbox />
    </TrendsDataProvider>
  );
}
