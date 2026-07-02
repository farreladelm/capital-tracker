import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { AIParserError } from "@/lib/services/aiParser";
import { checkRateLimit } from "@/lib/rateLimit";
import { z } from "zod";
import { TransactionService } from "@/lib/services/transaction.service";

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

    const savedTransactions = await TransactionService.parseAndSaveTransactions(userId, result.data.input);
    return NextResponse.json({ transactions: savedTransactions });
  } catch (error) {
    if (error instanceof AIParserError) {
      return NextResponse.json({ error: error.code, message: error.message }, { status: 400 });
    }
    if (error instanceof Error && error.message === "NO_CATEGORIES_FOUND") {
      return NextResponse.json({ error: "NO_CATEGORIES_FOUND" }, { status: 400 });
    }
    console.error("[parseTransaction API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
