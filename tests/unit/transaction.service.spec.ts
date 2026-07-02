import { describe, it, expect, beforeAll, afterAll, vi, type Mock } from "vitest";
import { prisma } from "../../lib/prisma";
import { TransactionService } from "../../lib/services/transaction.service";
import { parseTransactionInput } from "../../lib/services/aiParser";

// Mock the AI parser
vi.mock("../../lib/services/aiParser", () => ({
  parseTransactionInput: vi.fn(),
  AIParserError: class AIParserError extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = "AIParserError";
    }
  },
}));

describe("TransactionService Unit Tests", () => {
  let userId: string;
  let otherUserId: string;
  let noCategoryUserId: string;
  let expenseCategoryId: string;
  let incomeCategoryId: string;
  let otherCategoryId: string;
  let transactionId: string;

  beforeAll(async () => {
    // Create users
    const user = await prisma.user.create({
      data: {
        email: `txn-user-${Date.now()}@example.com`,
        name: "Transaction User",
        currency: "USD",
      },
    });
    userId = user.id;

    const otherUser = await prisma.user.create({
      data: {
        email: `txn-other-${Date.now()}@example.com`,
        name: "Other Transaction User",
        currency: "USD",
      },
    });
    otherUserId = otherUser.id;

    const noCategoryUser = await prisma.user.create({
      data: {
        email: `txn-nocat-${Date.now()}@example.com`,
        name: "No Category User",
        currency: "USD",
      },
    });
    noCategoryUserId = noCategoryUser.id;

    // Create categories
    const expenseCat = await prisma.category.create({
      data: {
        userId,
        name: "Food",
        type: "EXPENSE",
        color: "#FF5733",
        icon: "🍔",
      },
    });
    expenseCategoryId = expenseCat.id;

    const incomeCat = await prisma.category.create({
      data: {
        userId,
        name: "Salary",
        type: "INCOME",
        color: "#4ECDC4",
        icon: "💰",
      },
    });
    incomeCategoryId = incomeCat.id;

    const otherCat = await prisma.category.create({
      data: {
        userId: otherUserId,
        name: "Other Category",
        type: "EXPENSE",
        color: "#FFFFFF",
        icon: "📝",
      },
    });
    otherCategoryId = otherCat.id;
  });

  afterAll(async () => {
    // Cleanup users
    await prisma.user.deleteMany({
      where: { id: { in: [userId, otherUserId, noCategoryUserId] } },
    });
  });

  it("should get empty transaction list initially", async () => {
    const result = await TransactionService.getTransactions({ userId });
    expect(result.transactions).toEqual([]);
    expect(result.nextCursor).toBeUndefined();
  });

  it("should successfully create a new transaction", async () => {
    const txn = await TransactionService.createTransaction(userId, {
      categoryId: expenseCategoryId,
      type: "EXPENSE",
      amountMinor: 1550, // $15.50
      description: "Burger joint",
      date: new Date().toISOString(),
    });

    expect(txn).not.toBeNull();
    expect(txn.userId).toBe(userId);
    expect(txn.amountMinor).toBe(1550);
    expect(txn.type).toBe("EXPENSE");
    transactionId = txn.id;

    const result = await TransactionService.getTransactions({ userId });
    expect(result.transactions.length).toBe(1);
    expect(result.transactions[0].description).toBe("Burger joint");
  });

  it("should fail to create a transaction for another user's category", async () => {
    await expect(
      TransactionService.createTransaction(userId, {
        categoryId: otherCategoryId,
        type: "EXPENSE",
        amountMinor: 2000,
        description: "Invalid cat",
        date: new Date().toISOString(),
      })
    ).rejects.toThrow("CATEGORY_NOT_FOUND");
  });

  it("should fail to create a transaction if the type does not match the category type", async () => {
    await expect(
      TransactionService.createTransaction(userId, {
        categoryId: expenseCategoryId, // EXPENSE category
        type: "INCOME", // mismatched type
        amountMinor: 2000,
        description: "Mismatched type",
        date: new Date().toISOString(),
      })
    ).rejects.toThrow("TYPE_MISMATCH");
  });

  it("should retrieve filtered transactions by type", async () => {
    // Create an income transaction
    await TransactionService.createTransaction(userId, {
      categoryId: incomeCategoryId,
      type: "INCOME",
      amountMinor: 100000,
      description: "Payday",
      date: new Date().toISOString(),
    });

    const expensesOnly = await TransactionService.getTransactions({ userId, type: "EXPENSE" });
    expect(expensesOnly.transactions.length).toBe(1);
    expect(expensesOnly.transactions[0].type).toBe("EXPENSE");

    const incomesOnly = await TransactionService.getTransactions({ userId, type: "INCOME" });
    expect(incomesOnly.transactions.length).toBe(1);
    expect(incomesOnly.transactions[0].type).toBe("INCOME");
  });

  it("should filter transactions by search description case-insensitively", async () => {
    const searchResult = await TransactionService.getTransactions({ userId, search: "burGeR" });
    expect(searchResult.transactions.length).toBe(1);
    expect(searchResult.transactions[0].description).toBe("Burger joint");
  });

  it("should paginate correctly with limit and cursor", async () => {
    // Create two more transactions to have total of 4
    await TransactionService.createTransaction(userId, {
      categoryId: expenseCategoryId,
      type: "EXPENSE",
      amountMinor: 100,
      description: "Candy 1",
      date: new Date(Date.now() - 10000).toISOString(),
    });
    await TransactionService.createTransaction(userId, {
      categoryId: expenseCategoryId,
      type: "EXPENSE",
      amountMinor: 200,
      description: "Candy 2",
      date: new Date(Date.now() - 20000).toISOString(),
    });

    // Get first page of limit 2
    const page1 = await TransactionService.getTransactions({ userId, limit: 2 });
    expect(page1.transactions.length).toBe(2);
    expect(page1.nextCursor).toBeDefined();

    // Get second page using cursor
    const page2 = await TransactionService.getTransactions({
      userId,
      limit: 2,
      cursor: page1.nextCursor,
    });
    expect(page2.transactions.length).toBe(2);
  });

  it("should successfully update a transaction", async () => {
    const updated = await TransactionService.updateTransaction(userId, transactionId, {
      description: "Premium Burger",
      amountMinor: 2500,
    });

    expect(updated.description).toBe("Premium Burger");
    expect(updated.amountMinor).toBe(2500);
  });

  it("should fail to update a transaction owned by another user", async () => {
    await expect(
      TransactionService.updateTransaction(otherUserId, transactionId, {
        description: "Hacked Burger",
      })
    ).rejects.toThrow("NOT_FOUND");
  });

  it("should successfully delete a transaction", async () => {
    await TransactionService.deleteTransaction(userId, transactionId);

    const result = await TransactionService.getTransactions({ userId, search: "Premium" });
    expect(result.transactions.length).toBe(0);
  });

  it("should parse and save AI transactions successfully", async () => {
    const mockParsed = [
      {
        amount: 25.5,
        category: "Food",
        type: "EXPENSE" as const,
        date: new Date().toISOString(),
        description: "AI Burger",
      },
    ];

    (parseTransactionInput as Mock).mockResolvedValue(mockParsed);

    const txns = await TransactionService.parseAndSaveTransactions(userId, "spent 25.5 on a burger");
    expect(txns.length).toBe(1);
    expect(txns[0].amountMinor).toBe(2550);
    expect(txns[0].categoryId).toBe(expenseCategoryId);
    expect(txns[0].description).toBe("AI Burger");

    expect(parseTransactionInput).toHaveBeenCalledWith(
      "spent 25.5 on a burger",
      expect.any(String),
      expect.arrayContaining(["Food", "Salary"])
    );
  });

  it("should fail to parse and save if user has no categories", async () => {
    await expect(
      TransactionService.parseAndSaveTransactions(noCategoryUserId, "spent 10 on something")
    ).rejects.toThrow("NO_CATEGORIES_FOUND");
  });
});
