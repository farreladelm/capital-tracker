"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { TrendsService } from "@/lib/services/trends.service";

const ProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long"),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;

  const result = ProfileSchema.safeParse({ name });
  if (!result.success) {
    const errorMsg = result.error.issues[0]?.message || "Invalid inputs";
    return { error: errorMsg };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: result.data.name,
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
