import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { TransactionService } from "@/lib/services/transaction.service";

const PatchSchema = z.object({
  categoryId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  amountMinor: z.number().int().positive().optional(),
  description: z.string().max(255).optional(),
  date: z.string().datetime().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    
    const resolvedParams = await params;

    const body = await req.json();
    const result = PatchSchema.safeParse(body);
    
    if (!result.success) return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });

    const updated = await TransactionService.updateTransaction(session.user.id, resolvedParams.id, result.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    console.error("[transaction PATCH API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const resolvedParams = await params;
    
    await TransactionService.deleteTransaction(session.user.id, resolvedParams.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    console.error("[transaction DELETE API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
