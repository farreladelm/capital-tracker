import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma";
import { TrendsService } from "../../lib/services/trends.service";

describe("TrendsService Unit Tests", () => {
  let userId: string;
  let foodCategoryId: string;
  let transportCategoryId: string;
  let budgetId: string;

  beforeAll(async () => {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: `trends-user-${Date.now()}@example.com`,
        name: "Trends Test User",
        currency: "USD",
      },
    });
    userId = user.id;

    // Create categories
    const foodCat = await prisma.category.create({
      data: {
        userId,
        name: "Food",
        type: "EXPENSE",
        color: "#4c4bc6",
        icon: "restaurant",
      },
    });
    foodCategoryId = foodCat.id;

    const transCat = await prisma.category.create({
      data: {
        userId,
        name: "Transport",
        type: "EXPENSE",
        color: "#6665e0",
        icon: "🚗",
      },
    });
    transportCategoryId = transCat.id;

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        amountMinor: 50000, // $500.00
      },
    });
    budgetId = budget.id;
  });

  afterAll(async () => {
    // Delete user (cascades transactions and categories)
    await prisma.user.delete({
      where: { id: userId },
    });
  });

  it("should calculate correct trends metrics, categories, budgets, and comparison", async () => {
    // Seed transactions for current month: July 2026
    const txn1 = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 10000, // $100.00
        description: "Grocery",
        date: new Date("2026-07-05T12:00:00Z"),
      },
    });

    const txn2 = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 5000, // $50.00
        description: "Dinner",
        date: new Date("2026-07-05T18:00:00Z"),
      },
    });

    const txn3 = await prisma.transaction.create({
      data: {
        userId,
        categoryId: transportCategoryId,
        type: "EXPENSE",
        amountMinor: 3000, // $30.00
        description: "Taxi",
        date: new Date("2026-07-10T09:00:00Z"),
      },
    });

    // Seed transaction for previous month: June 2026
    const txnPrev = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 12000, // $120.00
        description: "Previous Grocery",
        date: new Date("2026-06-15T12:00:00Z"),
      },
    });

    // Fetch Trends
    const data = await TrendsService.getTrendsData(userId, "july", "2026");

    // Assert currency & locale
    expect(data.currency).toBe("USD");
    expect(data.locale).toBe("en-US");

    // Assert trend points (grouped by day, sum in major units)
    // Day 5 should have 100 + 50 = $150
    // Day 10 should have $30
    expect(data.trend.length).toBe(2);
    expect(data.trend[0]).toEqual({ day: "5", amount: 150 });
    expect(data.trend[1]).toEqual({ day: "10", amount: 30 });

    // Assert categories breakdown (sorted descending)
    expect(data.categories.length).toBe(2);
    expect(data.categories[0]).toEqual({ name: "Food", amount: 150, color: "#4c4bc6" });
    expect(data.categories[1]).toEqual({ name: "Transport", amount: 30, color: "#6665e0" });

    // Assert budgets progress
    expect(data.budgets.length).toBe(1);
    expect(data.budgets[0]).toEqual({
      id: budgetId,
      name: "Food",
      spent: 150,
      limit: 500,
      icon: "restaurant",
      color: "#4c4bc6",
      period: "MONTHLY",
    });

    // Assert comparison stats
    expect(data.comparison.thisPeriod).toBe(180); // 150 + 30
    expect(data.comparison.prevPeriod).toBe(120);
    // (180 - 120) / 120 = 50%
    expect(data.comparison.percentChange).toBe(50);

    // Assert active months/years filtering range
    expect(data.activeMonthsByYear).toEqual({
      "2026": ["june", "july"]
    });

    // Assert AI insights contains fallback string since GEMINI_API_KEY is not defined in tests
    expect(data.aiInsight).toContain("Your overall spending is up 50% this month");

    // Clean up test transactions
    await prisma.transaction.deleteMany({
      where: { id: { in: [txn1.id, txn2.id, txn3.id, txnPrev.id] } },
    });
  }, 30000);

  it("should personalize AI insights when user has demographic profile data", async () => {
    // 1. Update user with profile details
    await prisma.user.update({
      where: { id: userId },
      data: {
        gender: "FEMALE",
        birthDate: new Date("1995-12-17T00:00:00Z"),
        financialGoal: "DEBT_PAYOFF",
        targetSavingsRate: 25,
      },
    });

    // Clear cache to force generation if needed
    TrendsService.clearCache(userId);

    // 2. Fetch trends data (this triggers TrendsService with user profile context)
    const data = await TrendsService.getTrendsData(userId, "july", "2026");

    // 3. Assert it returns correctly and generated insights are defined
    expect(data.currency).toBe("USD");
    expect(data.aiInsight).toBeDefined();

    // 4. Reset user profile details
    await prisma.user.update({
      where: { id: userId },
      data: {
        gender: null,
        birthDate: null,
        financialGoal: null,
        targetSavingsRate: null,
      },
    });
  }, 30000);
});
