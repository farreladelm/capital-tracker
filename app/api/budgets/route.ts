import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { BudgetService } from "@/lib/services/budget.service";

const BudgetSchema = z.object({
  categoryId: z.string().min(1),
  amountMinor: z.number().int().nonnegative().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const budgets = await BudgetService.getBudgets(session.user.id);
    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("[budgets GET API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const body = await req.json();
    const result = BudgetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });
    }

    const { categoryId, amountMinor } = result.data;

    try {
      const budget = await BudgetService.setBudget(session.user.id, categoryId, amountMinor);
      return NextResponse.json({ success: true, budget });
    } catch (err: any) {
      if (err.message === "CATEGORY_NOT_FOUND") {
        return NextResponse.json({ error: "CATEGORY_NOT_FOUND" }, { status: 404 });
      }
      throw err;
    }
  } catch (error) {
    console.error("[budgets POST API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
