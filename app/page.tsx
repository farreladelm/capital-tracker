import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TransactionList } from "./components/TransactionList";
import { formatCurrency } from "@/lib/format";
import { BottomNav } from "./components/BottomNav";
import Link from "next/link";
import { BudgetService } from "@/lib/services/budget.service";
import type { TransactionModel as Transaction, CategoryModel as Category } from "@/generated/prisma/models";


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
    }
  });

  const expensesByCategory = Object.values(categorySums).sort((a, b) => b.amount - a.amount);
  const topExpense1 = expensesByCategory[0] || null;
  const topExpense2 = expensesByCategory[1] || null;

  const totalBudgetMinor = await BudgetService.getMonthlyBudgetLimit(user.id);
  const hasBudget = totalBudgetMinor > 0;
  const budgetPercentage = hasBudget ? Math.round((totalExpense / totalBudgetMinor) * 100) : 0;
  const remainingMinor = totalBudgetMinor - totalExpense;
  const formattedRemaining = formatCurrency(remainingMinor, user.currency);

  return (

    <>
      {/* TopAppBar */}
      <header className="bg-background/80 dark:bg-background/80 backdrop-blur-xl fixed top-0 w-full flex justify-between items-center px-margin-page h-16 z-50">
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
      <main className="pt-24 px-margin-page flex flex-col gap-stack-lg">
        {/* Greeting & Balance */}
        <section className="flex flex-col gap-stack-sm items-center text-center relative p-6 backdrop-blur-md bg-white/5 border border-white/20 shadow-2xl rounded-3xl">
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

        {/* Bento Grid: Categories & Insights */}
        <div className="absolute left-0 w-full h-64 -z-10 opacity-20 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg"><path d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,149.3C672,149,768,203,864,218.7C960,235,1056,213,1152,186.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" fill="#4c4bc6"></path></svg>
        </div>
        <section className="grid grid-cols-2 gap-gutter">
          {/* Categories Summary Card */}
          <Link href="/categories" className="bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40 hover:scale-[1.02] active:scale-[0.98] hover:bg-surface-container-low transition-all duration-200 group cursor-pointer">
            <div className="flex items-center gap-2 text-primary w-full">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>pie_chart</span>
              <span className="font-label-md font-semibold text-primary">Categories</span>
              <span className="material-symbols-outlined ml-auto text-secondary/50 group-hover:text-primary transition-colors" style={{ fontVariationSettings: `"FILL" 0` }}>chevron_right</span>
            </div>
            <div>
              {topExpense1 && (
                <>
                  <div className="flex justify-between items-end mb-1">
                    <span className="font-label-sm text-secondary truncate mr-2">{topExpense1.name}</span>
                    <span className="font-label-sm text-on-background font-semibold">{formatCurrency(topExpense1.amount, user.currency)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: `${Math.min((topExpense1.amount / totalExpense) * 100, 100)}%` }}></div>
                  </div>
                </>
              )}
              {topExpense2 && (
                <>
                  <div className="flex justify-between items-end mt-3 mb-1">
                    <span className="font-label-sm text-secondary truncate mr-2">{topExpense2.name}</span>
                    <span className="font-label-sm text-on-background font-semibold">{formatCurrency(topExpense2.amount, user.currency)}</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-tertiary-container rounded-full" style={{ width: `${Math.min((topExpense2.amount / totalExpense) * 100, 100)}%` }}></div>
                  </div>
                </>
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
        </section>

        {/* Recent Transactions */}
        <section className="flex flex-col gap-stack-md mb-24">
          <div className="flex justify-between items-center">
            <h3 className="font-headline-md text-on-background">Recent</h3>
            <Link href="/history" className="font-label-md text-primary">See all</Link>
          </div>
          <TransactionList initialTransactions={transactions.slice(0, 5)} categories={categories} currency={user.currency} />
        </section>
      </main>

      <BottomNav />
    </>
  );
}
