import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../../lib/prisma";
import { CategoryService } from "../../lib/services/category.service";

describe("CategoryService Unit Tests", () => {
  let userId: string;
  let otherUserId: string;
  let categoryId: string;
  let otherCategoryId: string;

  beforeAll(async () => {
    // Create primary test user
    const user = await prisma.user.create({
      data: {
        email: `cat-user-${Date.now()}@example.com`,
        name: "Category Test User",
        currency: "EUR",
      },
    });
    userId = user.id;

    // Create secondary test user for isolation tests
    const otherUser = await prisma.user.create({
      data: {
        email: `cat-other-${Date.now()}@example.com`,
        name: "Other Category User",
        currency: "USD",
      },
    });
    otherUserId = otherUser.id;

    // Pre-create a category for the other user
    const otherCat = await prisma.category.create({
      data: {
        userId: otherUserId,
        name: "Other Travel",
        type: "EXPENSE",
        color: "#000000",
        icon: "✈️",
      },
    });
    otherCategoryId = otherCat.id;
  });

  afterAll(async () => {
    // Cleanup users (cascade deletes categories)
    await prisma.user.deleteMany({
      where: {
        id: { in: [userId, otherUserId] },
      },
    });
  });

  it("should return empty categories list and the correct currency initially", async () => {
    const result = await CategoryService.getCategoriesWithCurrency(userId);
    expect(result.categories).toEqual([]);
    expect(result.currency).toBe("EUR");
  });

  it("should successfully create a new category", async () => {
    const cat = await CategoryService.createCategory(userId, {
      name: "Food & Drinks",
      type: "EXPENSE",
      color: "#FF5733",
      icon: "🍔",
    });

    expect(cat).not.toBeNull();
    expect(cat.userId).toBe(userId);
    expect(cat.name).toBe("Food & Drinks");
    categoryId = cat.id;

    const result = await CategoryService.getCategoriesWithCurrency(userId);
    expect(result.categories.length).toBe(1);
    expect(result.categories[0].name).toBe("Food & Drinks");
  });

  it("should fail when creating a category with duplicate name for the same user", async () => {
    await expect(
      CategoryService.createCategory(userId, {
        name: "Food & Drinks",
        type: "EXPENSE",
        color: "#000000",
        icon: "🥤",
      })
    ).rejects.toThrow("CATEGORY_EXISTS");
  });

  it("should successfully create a duplicate name for a DIFFERENT user", async () => {
    const cat = await CategoryService.createCategory(otherUserId, {
      name: "Food & Drinks",
      type: "EXPENSE",
      color: "#111111",
      icon: "🍕",
    });
    expect(cat).not.toBeNull();
    expect(cat.userId).toBe(otherUserId);
  });

  it("should fail to create a category when the 50 category limit is reached", async () => {
    // Create 48 more categories for user to reach 49 (total: 50 including "Food & Drinks")
    const createPromises = [];
    for (let i = 0; i < 48; i++) {
      createPromises.push(
        prisma.category.create({
          data: {
            userId,
            name: `Test Category ${i}`,
            type: "EXPENSE",
            color: "#FFFFFF",
            icon: "📝",
          },
        })
      );
    }
    await Promise.all(createPromises);

    const count = await prisma.category.count({ where: { userId } });
    expect(count).toBe(49);

    // Create the 50th category (should succeed)
    const cat50 = await CategoryService.createCategory(userId, {
      name: "Category 50",
      type: "EXPENSE",
      color: "#FFFFFF",
      icon: "📝",
    });
    expect(cat50).not.toBeNull();

    // Now try to create the 51st category (should fail)
    await expect(
      CategoryService.createCategory(userId, {
        name: "Category 51",
        type: "EXPENSE",
        color: "#FFFFFF",
        icon: "📝",
      })
    ).rejects.toThrow("MAX_CATEGORIES_REACHED");

    // Cleanup extra categories (keep only Food & Drinks)
    await prisma.category.deleteMany({
      where: {
        userId,
        id: { not: categoryId },
      },
    });
  });

  it("should successfully update an owned category", async () => {
    const updated = await CategoryService.updateCategory(userId, categoryId, {
      name: "Food, Drinks & Snacks",
      color: "#FFCC00",
    });

    expect(updated.name).toBe("Food, Drinks & Snacks");
    expect(updated.color).toBe("#FFCC00");
    expect(updated.icon).toBe("🍔"); // remains unchanged
  });

  it("should fail to update a category owned by another user", async () => {
    await expect(
      CategoryService.updateCategory(userId, otherCategoryId, {
        name: "Hacked Category",
      })
    ).rejects.toThrow("NOT_FOUND");
  });

  it("should fail to delete a category owned by another user", async () => {
    await expect(CategoryService.deleteCategory(userId, otherCategoryId)).rejects.toThrow("NOT_FOUND");
  });

  it("should fail to delete a category that does not exist", async () => {
    await expect(CategoryService.deleteCategory(userId, "nonexistent-id")).rejects.toThrow("NOT_FOUND");
  });

  it("should fail to delete a category with associated transactions", async () => {
    // Create a transaction under this category
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        type: "EXPENSE",
        amountMinor: 2000,
        description: "Test transaction",
        date: new Date(),
      },
    });

    await expect(CategoryService.deleteCategory(userId, categoryId)).rejects.toThrow("CATEGORY_HAS_TRANSACTIONS");

    // Clean up the transaction
    await prisma.transaction.delete({
      where: { id: transaction.id },
    });
  });

  it("should successfully delete a category with no transactions", async () => {
    await CategoryService.deleteCategory(userId, categoryId);

    const result = await CategoryService.getCategoriesWithCurrency(userId);
    expect(result.categories).toEqual([]);
  });
});
