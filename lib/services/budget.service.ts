import { prisma } from "@/lib/prisma";
import { TrendsService } from "./trends.service";

export class BudgetService {
  /**
   * Retrieves all budgets for a user.
   */
  static async getBudgets(userId: string) {
    return prisma.budget.findMany({
      where: { userId },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
      orderBy: {
        category: {
          name: "asc",
        },
      },
    });
  }

  /**
   * Sets or updates a budget for a category.
   * If amountMinor is null, the budget is deleted.
   */
  static async setBudget(userId: string, categoryId: string, amountMinor: number | null, period: string = "MONTHLY") {
    // Verify category exists and belongs to the user
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.userId !== userId) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // If amountMinor is null, delete the budget (remove it)
    if (amountMinor === null) {
      const existingBudget = await prisma.budget.findUnique({
        where: { categoryId },
      });

      if (existingBudget) {
        await prisma.budget.delete({
          where: { categoryId },
        });
      }
      TrendsService.clearCache(userId);
      return null;
    }

    // Otherwise, create or update the budget
    const budget = await prisma.budget.upsert({
      where: { categoryId },
      update: {
        amountMinor,
        period,
      },
      create: {
        userId,
        categoryId,
        amountMinor,
        period,
      },
      include: {
        category: {
          select: {
            name: true,
            icon: true,
            color: true,
          },
        },
      },
    });

    TrendsService.clearCache(userId);
    return budget;
  }

  /**
   * Calculates the total monthly budget limit for a user.
   * Weekly budgets are multiplied by 4, yearly budgets are divided by 12.
   */
  static async getMonthlyBudgetLimit(userId: string): Promise<number> {
    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    let totalBudgetMinor = 0;
    budgets.forEach((budget) => {
      if (budget.period === "WEEKLY") {
        totalBudgetMinor += budget.amountMinor * 4;
      } else if (budget.period === "YEARLY") {
        totalBudgetMinor += Math.round(budget.amountMinor / 12);
      } else {
        totalBudgetMinor += budget.amountMinor;
      }
    });

    return totalBudgetMinor;
  }
}

