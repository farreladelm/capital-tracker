import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { CategoryService } from "@/lib/services/category.service";

const CategorySchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(["INCOME", "EXPENSE"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  icon: z.string().min(1).max(10), // Emojis
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const { categories, currency } = await CategoryService.getCategoriesWithCurrency(session.user.id);

    return NextResponse.json({ categories, currency });
  } catch (error) {
    console.error("[categories GET API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

    const body = await req.json();
    const result = CategorySchema.safeParse(body);
    
    if (!result.success) return NextResponse.json({ error: "VALIDATION_FAILED" }, { status: 400 });

    const category = await CategoryService.createCategory(session.user.id, result.data);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error && error.message === "MAX_CATEGORIES_REACHED") {
      return NextResponse.json({ error: "MAX_CATEGORIES_REACHED" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "CATEGORY_EXISTS") {
      return NextResponse.json({ error: "CATEGORY_EXISTS" }, { status: 400 });
    }
    console.error("[categories POST API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
