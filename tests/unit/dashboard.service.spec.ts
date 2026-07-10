import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma";
import { DashboardService } from "../../lib/services/dashboard.service";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

describe("DashboardService Unit Tests", () => {
  let userId: string;
  let foodCategoryId: string;
  let salaryCategoryId: string;

  beforeAll(async () => {
    // Create user
    const user = await prisma.user.create({
      data: {
        email: `dash-user-${Date.now()}@example.com`,
        name: "Dashboard Test User",
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
        color: "#FF5733",
        icon: "restaurant",
      },
    });
    foodCategoryId = foodCat.id;

    const salaryCat = await prisma.category.create({
      data: {
        userId,
        name: "Salary",
        type: "INCOME",
        color: "#4ECDC4",
        icon: "💰",
      },
    });
    salaryCategoryId = salaryCat.id;
  });

  afterAll(async () => {
    await prisma.user.delete({
      where: { id: userId },
    });
  });

  it("should calculate correct totals for monthly transactions", async () => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);

    // Create test transactions inside current month
    const txn1 = await prisma.transaction.create({
      data: {
        userId,
        categoryId: salaryCategoryId,
        type: "INCOME",
        amountMinor: 500000, // $5000.00
        description: "Monthly salary",
        date: new Date(currentMonthStart.getTime() + 86400000), // Day 2 of month
      },
    });

    const txn2 = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 5000, // $50.00
        description: "Dinner",
        date: new Date(currentMonthStart.getTime() + 86400000 * 2), // Day 3 of month
      },
    });

    const txn3 = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 1500, // $15.00
        description: "Coffee",
        date: new Date(currentMonthStart.getTime() + 86400000 * 3), // Day 4 of month
      },
    });

    // Create a transaction OUTSIDE current month (should be excluded)
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 15);
    const txnOutside = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 10000,
        description: "Next month item",
        date: nextMonthDate,
      },
    });

    const summary = await DashboardService.getDashboardSummary(userId, "monthly");

    expect(summary.totalIncome).toBe(500000);
    expect(summary.totalExpense).toBe(6500); // 5000 + 1500
    expect(summary.netTotal).toBe(493500); // 500000 - 6500
    expect(summary.expensesByCategory.length).toBe(1);
    expect(summary.expensesByCategory[0].name).toBe("Food");
    expect(summary.expensesByCategory[0].amount).toBe(6500);

    // Clean up
    await prisma.transaction.deleteMany({
      where: { id: { in: [txn1.id, txn2.id, txn3.id, txnOutside.id] } },
    });
  });

  it("should calculate correct totals for weekly transactions and ignore rest of month", async () => {
    const now = new Date();
    const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });

    // Transaction inside week
    const txnWeekly = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 3000,
        description: "Weekly lunch",
        date: new Date(currentWeekStart.getTime() + 3600000), // Within week
      },
    });

    // Transaction outside week (but inside month)
    // Try to place it at least 8 days away from currentWeekStart
    let otherDate = new Date(currentWeekStart.getTime() - 86400000 * 2); // 2 days before start of week
    if (otherDate.getMonth() !== now.getMonth()) {
      otherDate = new Date(currentWeekStart.getTime() + 86400000 * 8); // 8 days after start of week
    }

    const txnMonthlyOnly = await prisma.transaction.create({
      data: {
        userId,
        categoryId: foodCategoryId,
        type: "EXPENSE",
        amountMinor: 9000,
        description: "Monthly only dinner",
        date: otherDate,
      },
    });

    const summary = await DashboardService.getDashboardSummary(userId, "weekly");

    expect(summary.totalExpense).toBe(3000);
    expect(summary.expensesByCategory[0].amount).toBe(3000);

    // Clean up
    await prisma.transaction.deleteMany({
      where: { id: { in: [txnWeekly.id, txnMonthlyOnly.id] } },
    });
  });
});
