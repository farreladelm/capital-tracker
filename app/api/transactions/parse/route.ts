import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { parseTransactionInput, AIParserError } from "@/lib/services/aiParser";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RequestSchema = z.object({
  input: z.string().min(1).max(255),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const userId = session.user.id;

    // Rate Limiting: 10 requests per minute
    if (!checkRateLimit(userId, 10, 60000)) {
      return NextResponse.json({ error: "RATE_LIMIT_EXCEEDED" }, { status: 429 });
    }

    const body = await req.json();
    const result = RequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });
    }

    const currentUtcTime = new Date().toISOString();
    
    // Attempt AI Parsing
    const parsedTransactions = await parseTransactionInput(result.data.input, currentUtcTime);

    // Fetch user's categories to map the AI's string output to real Category IDs
    const userCategories = await prisma.category.findMany({
      where: { userId },
    });

    const defaultCategory = userCategories.find((c: any) => c.name.toLowerCase() === "uncategorized");
    const fallbackCategoryId = defaultCategory ? defaultCategory.id : userCategories[0]?.id;

    if (!fallbackCategoryId) {
      // User hasn't finished onboarding or categories aren't provisioned
      return NextResponse.json({ error: "NO_CATEGORIES_FOUND" }, { status: 400 });
    }

    // Save transactions
    const savedTransactions = [];
    for (const parsed of parsedTransactions) {
      // Find exact or closest match, ignore case
      const matchedCategory = userCategories.find((c: any) => c.name.toLowerCase() === parsed.category.toLowerCase());
      const finalCategoryId = matchedCategory ? matchedCategory.id : fallbackCategoryId;
      
      // Ensure transaction type matches category type if we found a match, else trust the AI type
      const finalType = matchedCategory ? matchedCategory.type : parsed.type;

      // Convert decimal amount to minor unit (e.g. 15.50 -> 1550 for USD)
      // Since amountMinor is an int, we multiply by 100 as a simple heuristic for standard currencies. 
      // In a real app we'd fetch the user's currency and determine the multiplier.
      const multiplier = 100; // Hardcoded to 100 for v1 MVP
      const amountMinor = Math.round(parsed.amount * multiplier);

      const txn = await prisma.transaction.create({
        data: {
          userId,
          categoryId: finalCategoryId,
          type: finalType,
          amountMinor,
          description: parsed.description,
          date: new Date(parsed.date),
        }
      });
      savedTransactions.push(txn);
    }

    return NextResponse.json({ transactions: savedTransactions });

  } catch (error) {
    if (error instanceof AIParserError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: 400 });
    }
    console.error("[parseTransaction API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
