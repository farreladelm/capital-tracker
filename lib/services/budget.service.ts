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
  static async setBudget(userId: string, categoryId: string, amountMinor: number | null) {
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
      },
      create: {
        userId,
        categoryId,
        amountMinor,
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
}
