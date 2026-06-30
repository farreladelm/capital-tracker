import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1).max(10), // Emojis
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const categories = await prisma.category.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    // Validate constraint: Max 50 categories per user
    const count = await prisma.category.count({ where: { userId: session.user.id } });
    if (count >= 50) return NextResponse.json({ error: "MAX_CATEGORIES_REACHED" }, { status: 400 });

    const body = await req.json();
    const result = CategorySchema.safeParse(body);
    
    if (!result.success) return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });

    // Ensure name is unique per user
    const existing = await prisma.category.findFirst({
      where: { userId: session.user.id, name: { equals: result.data.name } }
    });

    if (existing) return NextResponse.json({ error: "CATEGORY_EXISTS" }, { status: 400 });

    const category = await prisma.category.create({
      data: {
        userId: session.user.id,
        ...result.data,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
