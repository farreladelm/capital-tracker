import { prisma } from "@/lib/prisma";
import { TrendsService } from "./trends.service";

export interface CreateCategoryInput {
  name: string;
  type: "INCOME" | "EXPENSE";
  color: string;
  icon: string;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: "INCOME" | "EXPENSE";
  color?: string;
  icon?: string;
}

export class CategoryService {
  /**
   * Retrieves all categories for a user, along with the user's currency.
   */
  static async getCategoriesWithCurrency(userId: string) {
    const [categories, user] = await Promise.all([
      prisma.category.findMany({
        where: { userId },
        orderBy: { name: "asc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { currency: true },
      }),
    ]);

    return {
      categories,
      currency: user?.currency || "USD",
    };
  }

  /**
   * Retrieves all categories for a user with transaction counts, ordered by creation date.
   */
  static async getCategoriesWithCounts(userId: string) {
    return prisma.category.findMany({
      where: { userId },
      include: {
        _count: { select: { transactions: true } },
        budget: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Creates a new category for a user.
   * Throws "MAX_CATEGORIES_REACHED" if the user already has 50 or more categories.
   * Throws "CATEGORY_EXISTS" if a category with the same name already exists for the user.
   */
  static async createCategory(userId: string, data: CreateCategoryInput) {
    // Validate constraint: Max 50 categories per user
    const count = await prisma.category.count({ where: { userId } });
    if (count >= 50) {
      throw new Error("MAX_CATEGORIES_REACHED");
    }

    // Ensure name is unique per user
    const existing = await prisma.category.findFirst({
      where: { userId, name: { equals: data.name } },
    });

    if (existing) {
      throw new Error("CATEGORY_EXISTS");
    }

    return prisma.category.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  /**
   * Updates an existing category owned by the user.
   * Throws "NOT_FOUND" if the category does not exist or doesn't belong to the user.
   */
  static async updateCategory(userId: string, id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    const updated = await prisma.category.update({
      where: { id },
      data,
    });

    TrendsService.clearCache(userId);
    return updated;
  }

  /**
   * Deletes a category owned by the user.
   * Throws "NOT_FOUND" if the category does not exist or doesn't belong to the user.
   * Throws "CATEGORY_HAS_TRANSACTIONS" if the category is associated with existing transactions.
   */
  static async deleteCategory(userId: string, id: string) {
    const existing = await prisma.category.findUnique({
      where: { id, userId },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // Block deletion if transactions exist
    if (existing._count.transactions > 0) {
      throw new Error("CATEGORY_HAS_TRANSACTIONS");
    }

    await prisma.category.delete({
      where: { id },
    });

    TrendsService.clearCache(userId);
  }
}
