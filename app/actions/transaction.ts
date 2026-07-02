"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return;

  await prisma.transaction.update({
    where: { id, userId: session.user.id },
    data: {
      description,
      amountMinor,
      categoryId,
      type: category.type,
      date: new Date(dateStr)
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
}

export async function deleteTransaction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return;

  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.transaction.delete({
    where: { id, userId: session.user.id }
  });

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

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return { error: "Category not found" };

  await prisma.transaction.create({
    data: {
      userId: session.user.id,
      description,
      amountMinor,
      categoryId,
      type: category.type,
      date: new Date(dateStr)
    }
  });

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}
