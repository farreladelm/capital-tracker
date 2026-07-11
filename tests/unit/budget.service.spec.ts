import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma";
import { BudgetService } from "../../lib/services/budget.service";

describe("BudgetService Unit Tests", () => {
  let userId: string;
  let categoryId: string;
  let otherUserId: string;
  let otherCategoryId: string;

  beforeAll(async () => {
    // 1. Create main test user and category
    const user = await prisma.user.create({
      data: {
        email: `unit-user-${Date.now()}@example.com`,
        name: "Unit Test User",
        currency: "USD",
      },
    });
    userId = user.id;

    const category = await prisma.category.create({
      data: {
        userId,
        name: "Unit Test Food",
        type: "EXPENSE",
        color: "#FF5733",
        icon: "restaurant",
      },
    });
    categoryId = category.id;

    // 2. Create another user and category to test isolation/authorization
    const otherUser = await prisma.user.create({
      data: {
        email: `unit-other-${Date.now()}@example.com`,
        name: "Other Test User",
        currency: "USD",
      },
    });
    otherUserId = otherUser.id;

    const otherCategory = await prisma.category.create({
      data: {
        userId: otherUserId,
        name: "Other Food",
        type: "EXPENSE",
        color: "#4ECDC4",
        icon: "directions_car",
      },
    });
    otherCategoryId = otherCategory.id;
  });

  afterAll(async () => {
    // Cleanup users (deletions will cascade delete categories & budgets)
    await prisma.user.deleteMany({
      where: {
        id: { in: [userId, otherUserId] },
      },
    });
  });

  it("should get empty budget list initially", async () => {
    const budgets = await BudgetService.getBudgets(userId);
    expect(budgets).toEqual([]);
  });

  it("should successfully create a new budget for owned category", async () => {
    const budget = await BudgetService.setBudget(userId, categoryId, 50000); // $500.00
    expect(budget).not.toBeNull();
    expect(budget?.userId).toBe(userId);
    expect(budget?.categoryId).toBe(categoryId);
    expect(budget?.amountMinor).toBe(50000);
    expect(budget?.category.name).toBe("Unit Test Food");

    // Retrieve and verify from database
    const dbBudget = await prisma.budget.findUnique({
      where: { categoryId },
    });
    expect(dbBudget).not.toBeNull();
    expect(dbBudget?.amountMinor).toBe(50000);
  });

  it("should get the list containing the created budget", async () => {
    const budgets = await BudgetService.getBudgets(userId);
    expect(budgets.length).toBe(1);
    expect(budgets[0].categoryId).toBe(categoryId);
    expect(budgets[0].amountMinor).toBe(50000);
  });

  it("should successfully update an existing budget", async () => {
    const budget = await BudgetService.setBudget(userId, categoryId, 75000); // $750.00
    expect(budget).not.toBeNull();
    expect(budget?.amountMinor).toBe(75000);

    // Retrieve and verify from database
    const dbBudget = await prisma.budget.findUnique({
      where: { categoryId },
    });
    expect(dbBudget?.amountMinor).toBe(75000);
  });

  it("should fail when setting a budget for a category owned by another user", async () => {
    await expect(
      BudgetService.setBudget(userId, otherCategoryId, 20000)
    ).rejects.toThrow("CATEGORY_NOT_FOUND");
  });

  it("should fail when setting a budget for a nonexistent category", async () => {
    await expect(
      BudgetService.setBudget(userId, "nonexistent-category-id", 20000)
    ).rejects.toThrow("CATEGORY_NOT_FOUND");
  });

  it("should successfully set and update budget period", async () => {
    const budget = await BudgetService.setBudget(userId, categoryId, 40000, "WEEKLY");
    expect(budget).not.toBeNull();
    expect(budget?.amountMinor).toBe(40000);
    expect(budget?.period).toBe("WEEKLY");

    const dbBudget = await prisma.budget.findUnique({
      where: { categoryId },
    });
    expect(dbBudget?.period).toBe("WEEKLY");
  });

  it("should delete the budget when passing null as amountMinor", async () => {
    const result = await BudgetService.setBudget(userId, categoryId, null);
    expect(result).toBeNull();

    // Verify it is gone from the database
    const dbBudget = await prisma.budget.findUnique({
      where: { categoryId },
    });
    expect(dbBudget).toBeNull();

    // Verify list is empty again
    const budgets = await BudgetService.getBudgets(userId);
    expect(budgets).toEqual([]);
  });

  describe("getMonthlyBudgetLimit", () => {
    it("should return 0 when no budgets are set", async () => {
      const limit = await BudgetService.getMonthlyBudgetLimit(userId);
      expect(limit).toBe(0);
    });

    it("should sum up multiple budgets with correct period scaling", async () => {
      // Create a weekly budget: $100.00 / week -> should scale to $400.00 (40000 minor)
      await BudgetService.setBudget(userId, categoryId, 10000, "WEEKLY");

      // Create another category for monthly budget
      const monthlyCategory = await prisma.category.create({
        data: {
          userId,
          name: "Unit Test Rent",
          type: "EXPENSE",
          color: "#0000FF",
          icon: "home",
        },
      });
      // Monthly budget: $1200.00 / month -> should stay $1200.00 (120000 minor)
      await BudgetService.setBudget(userId, monthlyCategory.id, 120000, "MONTHLY");

      // Create a yearly budget category
      const yearlyCategory = await prisma.category.create({
        data: {
          userId,
          name: "Unit Test Insurance",
          type: "EXPENSE",
          color: "#00FF00",
          icon: "shield",
        },
      });
      // Yearly budget: $1200.00 / year -> should scale to $100.00 (10000 minor)
      await BudgetService.setBudget(userId, yearlyCategory.id, 120000, "YEARLY");

      // Total expected = (10000 * 4) + 120000 + Math.round(120000 / 12)
      //                = 40000 + 120000 + 10000 = 170000
      const limit = await BudgetService.getMonthlyBudgetLimit(userId);
      expect(limit).toBe(170000);

      // Cleanup extra categories
      await prisma.category.deleteMany({
        where: {
          id: { in: [monthlyCategory.id, yearlyCategory.id] },
        },
      });
    });
  });
});

