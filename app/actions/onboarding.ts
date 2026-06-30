"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currency = formData.get("currency") as string;
  if (!currency) throw new Error("Currency is required");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (user?.currency) {
    redirect("/"); // Already onboarded
  }

  // Set currency and provision default categories
  const defaultCategories = [
    { name: "Food", type: "EXPENSE", color: "#FF6B6B", icon: "🍔", userId: session.user.id },
    { name: "Transport", type: "EXPENSE", color: "#4ECDC4", icon: "🚗", userId: session.user.id },
    { name: "Utilities", type: "EXPENSE", color: "#45B7D1", icon: "⚡", userId: session.user.id },
    { name: "Fun", type: "EXPENSE", color: "#96CEB4", icon: "🎉", userId: session.user.id },
    { name: "Salary", type: "INCOME", color: "#FFEEAD", icon: "💰", userId: session.user.id },
    { name: "Uncategorized", type: "EXPENSE", color: "#95A5A6", icon: "❓", userId: session.user.id },
  ];

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { currency },
    }),
    prisma.category.createMany({
      data: defaultCategories,
    }),
  ]);

  redirect("/");
}
