import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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

    const whereClause: {
      userId: string;
      type?: "INCOME" | "EXPENSE";
      description?: { contains: string; mode: string };
    } = { userId: session.user.id };
    if (type && (type === "INCOME" || type === "EXPENSE")) {
      whereClause.type = type;
    }
    if (search) {
      whereClause.description = { contains: search, mode: "insensitive" };
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      take: limit + 1, // Fetch one extra to check if there's a next page
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: { date: "desc" },
      include: { category: true },
    });

    let nextCursor: typeof cursor | undefined = undefined;
    if (transactions.length > limit) {
      const nextItem = transactions.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      transactions,
      nextCursor,
    });
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

    // Validate category belongs to user
    const category = await prisma.category.findUnique({
      where: { id: result.data.categoryId, userId: session.user.id }
    });

    if (!category) return NextResponse.json({ error: "CATEGORY_NOT_FOUND" }, { status: 400 });
    
    // Type must match Category type
    if (category.type !== result.data.type) {
      return NextResponse.json({ error: "TYPE_MISMATCH" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        categoryId: result.data.categoryId,
        type: result.data.type,
        amountMinor: result.data.amountMinor,
        description: result.data.description,
        date: new Date(result.data.date),
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("[transactions POST API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
