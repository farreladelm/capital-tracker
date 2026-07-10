import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryService } from "@/lib/services/category.service";
import { CategoriesClient } from "./CategoriesClient";
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // 1. Get user details for currency configuration
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currency: true }
  });

  const currency = user?.currency || "USD";

  // 2. Get categories with counts and budget information
  const categories = await CategoryService.getCategoriesWithCounts(userId);

  // 3. Fetch transactions for the current calendar year to perform weekly, monthly, and yearly spent calculation
  const today = new Date();
  const startOfYearDate = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
  const endOfYearDate = new Date(Date.UTC(today.getUTCFullYear(), 11, 31, 23, 59, 59, 999));

  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: startOfYearDate, lte: endOfYearDate }
    },
    select: {
      categoryId: true,
      amountMinor: true,
      date: true
    }
  });

  // Calculate bounds
  const startOfWeekDate = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const endOfWeekDate = endOfWeek(today, { weekStartsOn: 1 });
  const startOfMonthDate = startOfMonth(today);
  const endOfMonthDate = endOfMonth(today);

  // 4. Aggregate spent totals per category
  const spentData: Record<string, { week: number; month: number; year: number }> = {};
  
  categories.forEach((c) => {
    spentData[c.id] = { week: 0, month: 0, year: 0 };
  });

  transactions.forEach((t) => {
    const tDate = new Date(t.date);
    const catId = t.categoryId;
    
    if (!spentData[catId]) {
      spentData[catId] = { week: 0, month: 0, year: 0 };
    }

    const amount = t.amountMinor / 100;

    // Year spent
    spentData[catId].year += amount;

    // Month spent
    if (tDate >= startOfMonthDate && tDate <= endOfMonthDate) {
      spentData[catId].month += amount;
    }

    // Week spent
    if (tDate >= startOfWeekDate && tDate <= endOfWeekDate) {
      spentData[catId].week += amount;
    }
  });

  // Cast categories to correct client types cleanly
  const typedCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    color: c.color,
    icon: c.icon,
    _count: c._count,
    budget: c.budget ? {
      amountMinor: c.budget.amountMinor,
      period: c.budget.period,
    } : null,
  }));

  return (
    <CategoriesClient
      categories={typedCategories}
      currency={currency}
      spentData={spentData}
    />
  );
}
