"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { CategoryService } from "@/lib/services/category.service";
import { BudgetService } from "@/lib/services/budget.service";

const CategoryActionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color format"),
  icon: z.string().min(1, "Icon is required").max(50, "Icon is too long"),
  budgetAmount: z.number().nonnegative("Budget must be positive").nullable(),
  budgetPeriod: z.enum(["WEEKLY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
});

export async function createCategoryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;
  const budgetAmountRaw = formData.get("budgetAmount") as string;
  const budgetPeriodRaw = formData.get("budgetPeriod") as "WEEKLY" | "MONTHLY" | "YEARLY";

  let budgetAmount: number | null = null;
  if (budgetAmountRaw && budgetAmountRaw.trim() !== "") {
    const parsed = parseFloat(budgetAmountRaw);
    if (!isNaN(parsed) && parsed > 0) {
      budgetAmount = parsed;
    } else if (parsed !== 0) {
      return { error: "Budget amount must be a positive number" };
    }
  }

  const validation = CategoryActionSchema.safeParse({
    name,
    type,
    color,
    icon,
    budgetAmount,
    budgetPeriod: budgetPeriodRaw || "MONTHLY",
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid inputs" };
  }

  try {
    const category = await CategoryService.createCategory(session.user.id, {
      name: validation.data.name,
      type: validation.data.type,
      color: validation.data.color,
      icon: validation.data.icon,
    });

    if (validation.data.type === "EXPENSE" && validation.data.budgetAmount !== null) {
      const amountMinor = Math.round(validation.data.budgetAmount * 100);
      await BudgetService.setBudget(
        session.user.id,
        category.id,
        amountMinor,
        validation.data.budgetPeriod
      );
    }
  } catch (err: any) {
    console.error("Failed to create category:", err);
    if (err.message === "MAX_CATEGORIES_REACHED") {
      return { error: "Category limit reached (max 50)" };
    }
    if (err.message === "CATEGORY_EXISTS") {
      return { error: "A category with this name already exists" };
    }
    return { error: "Failed to create category" };
  }

  revalidatePath("/categories");
  revalidatePath("/");
  revalidatePath("/trends");
  return { success: true };
}

export async function updateCategoryAction(categoryId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const type = formData.get("type") as "INCOME" | "EXPENSE";
  const color = formData.get("color") as string;
  const icon = formData.get("icon") as string;
  const budgetAmountRaw = formData.get("budgetAmount") as string;
  const budgetPeriodRaw = formData.get("budgetPeriod") as "WEEKLY" | "MONTHLY" | "YEARLY";

  let budgetAmount: number | null = null;
  if (budgetAmountRaw && budgetAmountRaw.trim() !== "") {
    const parsed = parseFloat(budgetAmountRaw);
    if (!isNaN(parsed) && parsed > 0) {
      budgetAmount = parsed;
    } else if (parsed !== 0) {
      return { error: "Budget amount must be a positive number" };
    }
  }

  const validation = CategoryActionSchema.safeParse({
    name,
    type,
    color,
    icon,
    budgetAmount,
    budgetPeriod: budgetPeriodRaw || "MONTHLY",
  });

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "Invalid inputs" };
  }

  try {
    await CategoryService.updateCategory(session.user.id, categoryId, {
      name: validation.data.name,
      type: validation.data.type,
      color: validation.data.color,
      icon: validation.data.icon,
    });

    if (validation.data.type === "EXPENSE" && validation.data.budgetAmount !== null) {
      const amountMinor = Math.round(validation.data.budgetAmount * 100);
      await BudgetService.setBudget(
        session.user.id,
        categoryId,
        amountMinor,
        validation.data.budgetPeriod
      );
    } else {
      // Clear budget if set to null or if type is INCOME
      await BudgetService.setBudget(session.user.id, categoryId, null);
    }
  } catch (err: any) {
    console.error("Failed to update category:", err);
    if (err.message === "NOT_FOUND") {
      return { error: "Category not found" };
    }
    return { error: "Failed to update category" };
  }

  revalidatePath("/categories");
  revalidatePath("/");
  revalidatePath("/trends");
  return { success: true };
}

export async function deleteCategoryAction(categoryId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await CategoryService.deleteCategory(session.user.id, categoryId);
  } catch (err: any) {
    console.error("Failed to delete category:", err);
    if (err.message === "NOT_FOUND") {
      return { error: "Category not found" };
    }
    if (err.message === "CATEGORY_HAS_TRANSACTIONS") {
      return { error: "Cannot delete category with active transactions" };
    }
    return { error: "Failed to delete category" };
  }

  revalidatePath("/categories");
  revalidatePath("/");
  revalidatePath("/trends");
  return { success: true };
}
