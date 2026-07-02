import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { TransactionService } from "@/lib/services/transaction.service";

const TransactionSchema = z.object({
  categoryId: z.string(),
  type: z.enum(["INCOME", "EXPENSE"]),
  amountMinor: z.number().int().positive(),
  description: z.string().max(255),
  date: z.string().datetime(),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const result = await TransactionService.getTransactions({
      userId: session.user.id,
      cursor,
      limit,
      type,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[transactions GET API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await req.json();
    const result = TransactionSchema.safeParse(body);
    
    if (!result.success) return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });

    const transaction = await TransactionService.createTransaction(session.user.id, result.data);
    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
      return NextResponse.json({ error: "CATEGORY_NOT_FOUND" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "TYPE_MISMATCH") {
      return NextResponse.json({ error: "TYPE_MISMATCH" }, { status: 400 });
    }
    console.error("[transactions POST API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
