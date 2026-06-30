import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MagicBox } from "./components/MagicBox";
import { DonutChart } from "./components/DonutChart";
import { TransactionList } from "./components/TransactionList";
import { LogOut, Tags } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/format";

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

  let totalIncome = 0;
  let totalExpense = 0;
  const categorySums: Record<string, { name: string; amount: number; color: string }> = {};

  transactions.forEach((txn: any) => {
    if (txn.type === "INCOME") {
      totalIncome += txn.amountMinor;
    } else {
      totalExpense += txn.amountMinor;
      if (!categorySums[txn.categoryId]) {
        categorySums[txn.categoryId] = {
          name: txn.category.name,
          color: txn.category.color,
          amount: 0,
        };
      }
      categorySums[txn.categoryId].amount += txn.amountMinor;
    }
  });

  const netTotal = totalIncome - totalExpense;
  const expensesByCategory = Object.values(categorySums).sort((a, b) => b.amount - a.amount);
  const highestSpend = expensesByCategory[0];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md border-b border-slate-100">
        <div className="font-bold tracking-tight text-slate-800">Capital Tracker</div>
        <div className="flex items-center gap-2">
          <Link href="/categories" className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Tags size={20} />
          </Link>
          <form action={async () => {
            "use server";
            await signOut();
          }}>
            <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full flex flex-col gap-8">
        
        {/* Net Total Widget */}
        <section className="flex flex-col items-center">
          <div className="text-sm font-medium text-slate-500 mb-1">This Month</div>
          <div className={`text-5xl font-extrabold tracking-tighter ${netTotal >= 0 ? "text-slate-800" : "text-red-500"}`}>
            {netTotal < 0 ? "-" : ""}{formatCurrency(Math.abs(netTotal), user.currency)}
          </div>
        </section>

        {/* Donut Chart Widget */}
        <section className="flex flex-col items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <DonutChart data={expensesByCategory} currency={user.currency} />
          
          {highestSpend && (
            <div className="mt-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
              Highest spend: <span className="font-bold text-slate-800">{highestSpend.name}</span> ({formatCurrency(highestSpend.amount, user.currency)})
            </div>
          )}
        </section>

        {/* Recent Transactions Widget */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Recent</h2>
          </div>
          <TransactionList initialTransactions={transactions} categories={categories} currency={user.currency} />
        </section>
      </main>

      {/* Floating Magic Box */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent">
        <div className="mx-auto max-w-lg">
          <MagicBox />
        </div>
      </div>
    </div>
  );
}
