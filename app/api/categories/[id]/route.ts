import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    const existing = await prisma.category.findUnique({
      where: { id: resolvedParams.id, userId: session.user.id }
    });

    if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const updated = await prisma.category.update({
      where: { id: resolvedParams.id },
      data: result.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[category PATCH API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    
    const resolvedParams = await params;

    const existing = await prisma.category.findUnique({
      where: { id: resolvedParams.id, userId: session.user.id },
      include: {
        _count: { select: { transactions: true } }
      }
    });

    if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    // Block deletion if transactions exist
    if (existing._count.transactions > 0) {
      return NextResponse.json({ error: "CATEGORY_HAS_TRANSACTIONS" }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id: resolvedParams.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[category DELETE API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
