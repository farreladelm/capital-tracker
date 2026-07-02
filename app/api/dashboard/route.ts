import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { DashboardService } from "@/lib/services/dashboard.service";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly"; // 'monthly' | 'weekly'
    
    const summary = await DashboardService.getDashboardSummary(session.user.id, period);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("[dashboard API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}

