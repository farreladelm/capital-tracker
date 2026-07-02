import { prisma } from "@/lib/prisma";
import { parseTransactionInput } from "./aiParser";
import type { CategoryModel as Category } from "@/generated/prisma/models";

export interface GetTransactionsParams {
  userId: string;
  cursor?: string | null;
  limit?: number;
  type?: string | null;
  search?: string | null;
}

export interface CreateTransactionInput {
  categoryId: string;
  /** If omitted, the type is derived from the category. When provided, it must match the category type. */
  type?: "INCOME" | "EXPENSE";
  amountMinor: number;
  description: string;
  date: string | Date;
}

export interface UpdateTransactionInput {
  categoryId?: string;
  type?: "INCOME" | "EXPENSE";
  amountMinor?: number;
  description?: string;
  date?: string;
}

export class TransactionService {
  /**
   * Retrieves a paginated list of transactions for a user.
   */
  static async getTransactions({ userId, cursor, limit = 20, type, search }: GetTransactionsParams) {
    const whereClause: {
      userId: string;
      type?: "INCOME" | "EXPENSE";
      description?: { contains: string };
    } = { userId };

    if (type && (type === "INCOME" || type === "EXPENSE")) {
      whereClause.type = type;
    }
    if (search) {
      // SQLite LIKE is case-insensitive for ASCII characters by default;
      // the `mode` option is PostgreSQL-only and not applicable here.
      whereClause.description = { contains: search };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      take: limit + 1, // Fetch one extra to check if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { date: "desc" },
      include: { category: true },
    });

    let nextCursor: string | undefined = undefined;
    if (transactions.length > limit) {
      const nextItem = transactions.pop();
      nextCursor = nextItem!.id;
    }

    return {
      transactions,
      nextCursor,
    };
  }

  /**
   * Creates a single transaction.
   * Throws "CATEGORY_NOT_FOUND" if the category is not found or does not belong to the user.
   * Throws "TYPE_MISMATCH" if the transaction type does not match the category type.
   */
  static async createTransaction(userId: string, data: CreateTransactionInput) {
    // Validate category belongs to user
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId, userId },
    });

    if (!category) {
      throw new Error("CATEGORY_NOT_FOUND");
    }

    // Derive type from the category; if caller supplies a type it must match.
    const resolvedType = data.type ?? (category.type as "INCOME" | "EXPENSE");
    if (resolvedType !== category.type) {
      throw new Error("TYPE_MISMATCH");
    }

    return prisma.transaction.create({
      data: {
        userId,
        categoryId: data.categoryId,
        type: resolvedType,
        amountMinor: data.amountMinor,
        description: data.description,
        date: new Date(data.date),
      },
    });
  }

  /**
   * Updates an existing transaction.
   * Throws "NOT_FOUND" if the transaction does not exist or doesn't belong to the user.
   */
  static async updateTransaction(userId: string, id: string, data: UpdateTransactionInput) {
    const existing = await prisma.transaction.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    return prisma.transaction.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  /**
   * Deletes a transaction owned by the user.
   * Throws "NOT_FOUND" if the transaction does not exist or doesn't belong to the user.
   */
  static async deleteTransaction(userId: string, id: string) {
    const existing = await prisma.transaction.findUnique({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    await prisma.transaction.delete({
      where: { id },
    });
  }

  /**
   * Parses natural language input using AI, matches the parsed categories
   * with the user's categories, and saves the transactions to the database.
   * Throws "NO_CATEGORIES_FOUND" if the user has no categories provisioned.
   */
  static async parseAndSaveTransactions(userId: string, input: string) {
    // Fetch user's categories to pass to the AI parser
    const userCategories = (await prisma.category.findMany({
      where: { userId },
    })) as Category[];
    const categoryNames = userCategories.map((c) => c.name);

    const currentUtcTime = new Date().toISOString();

    // Attempt AI Parsing
    const parsedTransactions = await parseTransactionInput(input, currentUtcTime, categoryNames);

    const defaultCategory = userCategories.find((c) => c.name.toLowerCase() === "uncategorized");
    const fallbackCategoryId = defaultCategory ? defaultCategory.id : userCategories[0]?.id;

    if (!fallbackCategoryId) {
      throw new Error("NO_CATEGORIES_FOUND");
    }

    const savedTransactions = await prisma.$transaction(
      parsedTransactions.map((parsed) => {
        const matchedCategory = userCategories.find((c) => c.name.toLowerCase() === parsed.category.toLowerCase());
        const finalCategoryId = matchedCategory ? matchedCategory.id : fallbackCategoryId;
        const finalType = matchedCategory ? matchedCategory.type : parsed.type;
        const amountMinor = Math.round(parsed.amount * 100);
        return prisma.transaction.create({
          data: {
            userId,
            categoryId: finalCategoryId,
            type: finalType,
            amountMinor,
            description: parsed.description,
            date: new Date(parsed.date),
          },
        });
      })
    );

    return savedTransactions;
  }
}
