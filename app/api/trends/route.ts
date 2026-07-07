import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { TrendsService } from "@/lib/services/trends.service";

const TrendsParamsSchema = z.object({
  month: z.enum([
    "jan", "feb", "mar", "apr", "may", "june",
    "july", "aug", "sept", "oct", "nov", "dec"
  ]),
  year: z.string().regex(/^\d{4}$/, { message: "Invalid 4-digit year" }),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawMonth = searchParams.get("month") || "";
    const rawYear = searchParams.get("year") || "";

    const validationResult = TrendsParamsSchema.safeParse({
      month: rawMonth.toLowerCase(),
      year: rawYear,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "VALIDATION_FAILED", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { month, year } = validationResult.data;
    const result = await TrendsService.getTrendsData(session.user.id, month, year);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[trends GET API Error]:", error);
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
