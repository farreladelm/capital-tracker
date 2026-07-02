"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { TransactionService } from "@/lib/services/transaction.service";

export async function updateTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = formData.get("id") as string;
  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const categoryId = formData.get("categoryId") as string;
  const dateStr = formData.get("date") as string;

  if (!id || !description || !amountStr || !categoryId || !dateStr) return;

  const amountMinor = Math.round(parseFloat(amountStr) * 100);

  try {
    await TransactionService.updateTransaction(session.user.id, id, {
      description,
      amountMinor,
      categoryId,
      date: dateStr,
    });
  } catch (err) {
    console.error("Failed to update transaction in server action:", err);
    return;
  }

  revalidatePath("/");
  revalidatePath("/history");
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = formData.get("id") as string;
  if (!id) return;

  try {
    await TransactionService.deleteTransaction(session.user.id, id);
  } catch (err) {
    console.error("Failed to delete transaction in server action:", err);
    return;
  }

  revalidatePath("/");
  revalidatePath("/history");
}

export async function createTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const description = formData.get("description") as string;
  const amountStr = formData.get("amount") as string;
  const categoryId = formData.get("categoryId") as string;
  const dateStr = formData.get("date") as string;

  if (!description || !amountStr || !categoryId || !dateStr) return { error: "Missing fields" };

  const amountMinor = Math.round(parseFloat(amountStr) * 100);

  try {
    await TransactionService.createTransaction(session.user.id, {
      categoryId,
      amountMinor,
      description,
      date: new Date(dateStr),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create transaction";
    return { error: message };
  }

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}

