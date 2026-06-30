import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    // Validate ownership
    const existing = await prisma.transaction.findUnique({
      where: { id: resolvedParams.id, userId: session.user.id }
    });

    if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    const updated = await prisma.transaction.update({
      where: { id: resolvedParams.id },
      data: {
        ...result.data,
        date: result.data.date ? new Date(result.data.date) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const resolvedParams = await params;
    
    const existing = await prisma.transaction.findUnique({
      where: { id: resolvedParams.id, userId: session.user.id }
    });

    if (!existing) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

    await prisma.transaction.delete({
      where: { id: resolvedParams.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
