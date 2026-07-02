import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { CategoryService } from "@/lib/services/category.service";

const PatchSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().min(1).max(10).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const resolvedParams = await params;
    
    const body = await req.json();
    const result = PatchSchema.safeParse(body);
    
    if (!result.success) return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });

    const updated = await CategoryService.updateCategory(session.user.id, resolvedParams.id, result.data);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    console.error("[category PATCH API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    
    const resolvedParams = await params;

    await CategoryService.deleteCategory(session.user.id, resolvedParams.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "CATEGORY_HAS_TRANSACTIONS") {
      return NextResponse.json({ error: "CATEGORY_HAS_TRANSACTIONS" }, { status: 400 });
    }
    console.error("[category DELETE API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
