import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "monthly"; // 'monthly' | 'weekly'
    
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === "weekly") {
      startDate = startOfWeek(now, { weekStartsOn: 1 }); // Start on Monday
      endDate = endOfWeek(now, { weekStartsOn: 1 });
    } else {
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const categorySums: Record<string, { name: string; amount: number; color: string }> = {};

    transactions.forEach((txn: any) => {
      if (txn.type === "INCOME") {
        totalIncome += txn.amountMinor;
      } else {
        totalExpense += txn.amountMinor;
        
        // Sum for donut chart
        if (!categorySums[txn.categoryId]) {
          categorySums[txn.categoryId] = {
            name: txn.category.name,
            color: txn.category.color,
            amount: 0,
          };
        }
        categorySums[txn.categoryId].amount += txn.amountMinor;
      }
    });

    const expensesByCategory = Object.values(categorySums).sort((a, b) => b.amount - a.amount);
    
    return NextResponse.json({
      netTotal: totalIncome - totalExpense,
      totalIncome,
      totalExpense,
      expensesByCategory,
      period: { start: startDate, end: endDate }
    });

  } catch (error) {
    console.error("[dashboard API]", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
