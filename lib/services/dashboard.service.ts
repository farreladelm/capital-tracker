import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import type { TransactionModel as Transaction, CategoryModel as Category } from "@/generated/prisma/models";

type TransactionWithCategory = Transaction & {
  category: Category;
};

export class DashboardService {
  /**
   * Retrieves dashboard summary for a user based on the selected period (weekly or monthly).
   */
  static async getDashboardSummary(userId: string, period: string = "monthly") {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === "weekly") {
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categorySums: Record<string, { name: string; amount: number; color: string }> = {};

    (transactions as unknown as TransactionWithCategory[]).forEach((txn) => {
      if (txn.type === "INCOME") {
        totalIncome += txn.amountMinor;
      } else {
        totalExpense += txn.amountMinor;

        // Sum for donut chart
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

    const expensesByCategory = Object.values(categorySums).sort((a, b) => b.amount - a.amount);

    return {
      netTotal: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      expensesByCategory,
      period: { start: startDate, end: endDate },
    };
  }
}
