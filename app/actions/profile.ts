"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TrendsService } from "@/lib/services/trends.service";

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).nullable(),
  birthDate: z.string().datetime().nullable(),
  financialGoal: z.enum(["TRACKING", "DEBT_PAYOFF", "EMERGENCY_FUND", "BIG_PURCHASE"]).nullable(),
  targetSavingsRate: z.number().int().min(0).max(100).nullable(),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const genderRaw = formData.get("gender") as string;
  const birthDateRaw = formData.get("birthDate") as string;
  const financialGoalRaw = formData.get("financialGoal") as string;
  const targetSavingsRateRaw = formData.get("targetSavingsRate");

  const gender = genderRaw ? genderRaw : null;
  const financialGoal = financialGoalRaw ? financialGoalRaw : null;

  let birthDate: string | null = null;
  if (birthDateRaw) {
    const dateObj = new Date(birthDateRaw);
    if (!isNaN(dateObj.getTime())) {
      // Ensure it's formatted as a full datetime string for Zod's .datetime() validator
      birthDate = dateObj.toISOString();
    } else {
      return { error: "Invalid birth date" };
    }
  }

  let targetSavingsRate: number | null = null;
  if (targetSavingsRateRaw !== null && targetSavingsRateRaw !== "") {
    const rate = parseInt(targetSavingsRateRaw as string, 10);
    if (!isNaN(rate)) {
      targetSavingsRate = rate;
    } else {
      return { error: "Invalid target savings rate" };
    }
  }

  const result = ProfileSchema.safeParse({
    name,
    gender,
    birthDate,
    financialGoal,
    targetSavingsRate,
  });

  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message || "Invalid inputs";
    return { error: errorMsg };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.name,
        gender: result.data.gender,
        birthDate: result.data.birthDate ? new Date(result.data.birthDate) : null,
        financialGoal: result.data.financialGoal,
        targetSavingsRate: result.data.targetSavingsRate,
      },
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { error: "An unexpected error occurred while saving." };
  }

  revalidatePath("/");
  revalidatePath("/account");

  return { success: true };
}
