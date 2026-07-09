import { prisma } from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export type TrendPoint = {
  day: string;
  amount: number;
};

export type CategoryShare = {
  name: string;
  amount: number;
  color: string;
};

export type BudgetProgress = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: string;
  color: string;
};

export type TrendsData = {
  currency: string;
  locale: string;
  trend: TrendPoint[];
  categories: CategoryShare[];
  budgets: BudgetProgress[];
  comparison: {
    thisPeriod: number;
    prevPeriod: number;
    percentChange: number;
  };
  aiInsight: string;
  hasTransactions: boolean;
  activeMonthsByYear: Record<string, string[]>;
};

const insightsCache = new Map<string, { insight: string; timestamp: number }>();

export class TrendsService {
  static clearCache(userId: string) {
    for (const key of insightsCache.keys()) {
      if (key.startsWith(`${userId}-`)) {
        insightsCache.delete(key);
      }
    }
  }
  static async getTrendsData(
    userId: string,
    monthStr: string,
    yearStr: string
  ): Promise<TrendsData> {
    // 1. Resolve User and Currency Settings
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error("USER_NOT_FOUND");
    const currency = user.currency || "USD";
    const locale = currency === "IDR" ? "id-ID" : currency === "JPY" ? "ja-JP" : "en-US";

    // 1.5 Check if the user has any transactions at all to short-circuit
    const allTransactionDates = await prisma.transaction.findMany({
      where: { userId },
      select: { date: true },
    });

    const hasTransactions = allTransactionDates.length > 0;
    const monthsOrder = ["jan", "feb", "mar", "apr", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];

    if (!hasTransactions) {
      const today = new Date();
      const currentYearStr = today.getUTCFullYear().toString();
      const currentMonthStr = monthsOrder[today.getUTCMonth()];

      return {
        currency,
        locale,
        hasTransactions: false,
        trend: [],
        categories: [],
        budgets: [],
        comparison: {
          thisPeriod: 0,
          prevPeriod: 0,
          percentChange: 0,
        },
        aiInsight: "Log your first transaction to unlock AI-powered insights and financial summaries.",
        activeMonthsByYear: {
          [currentYearStr]: [currentMonthStr],
        },
      };
    }

    // 2. Parse Date Bounds
    const year = parseInt(yearStr, 10);
    const monthMap: Record<string, number> = {
      jan: 1, feb: 2, mar: 3, apr: 4, may: 5, june: 6,
      july: 7, aug: 8, sept: 9, oct: 10, nov: 11, dec: 12
    };
    const month = monthMap[monthStr.toLowerCase()] || 1;

    // Current Month UTC Bounds
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Previous Month UTC Bounds
    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const startOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth - 1, 1));
    const endOfPrevMonth = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));

    // 3. Fetch Transactions for Current and Previous Month
    const currentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: { category: true },
    });

    const prevTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
    });

    // 4. Calculate Spending Trend (Line Chart)
    const dailyExpenses: Record<string, number> = {};
    currentTransactions.forEach((t) => {
      const day = new Date(t.date).getUTCDate().toString();
      dailyExpenses[day] = (dailyExpenses[day] || 0) + t.amountMinor;
    });

    // Generate trend array sorted by day
    const trend: TrendPoint[] = Object.keys(dailyExpenses)
      .map((day) => ({
        day,
        amount: dailyExpenses[day] / 100, // convert to major units
      }))
      .sort((a, b) => parseInt(a.day, 10) - parseInt(b.day, 10));

    // 5. Calculate Category Breakdown (Donut Chart)
    const categoryExpenses: Record<string, { amountMinor: number; color: string }> = {};
    currentTransactions.forEach((t) => {
      const categoryName = t.category?.name || "Uncategorized";
      const categoryColor = t.category?.color || "#95A5A6";
      
      if (!categoryExpenses[categoryName]) {
        categoryExpenses[categoryName] = { amountMinor: 0, color: categoryColor };
      }
      categoryExpenses[categoryName].amountMinor += t.amountMinor;
    });

    const categoriesList: CategoryShare[] = Object.keys(categoryExpenses)
      .map((name) => ({
        name,
        amount: categoryExpenses[name].amountMinor / 100,
        color: categoryExpenses[name].color,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 6. Calculate Budget Progress
    const userBudgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    const budgetsProgressList: BudgetProgress[] = userBudgets.map((b) => {
      // Calculate spent for this category during this month
      const totalSpentMinor = currentTransactions
        .filter((t) => t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + t.amountMinor, 0);

      return {
        id: b.id,
        name: b.category.name,
        spent: totalSpentMinor / 100,
        limit: b.amountMinor / 100,
        icon: b.category.icon || "❓",
        color: b.category.color || "#4c4bc6",
      };
    });

    // 7. Period Comparison
    const thisPeriod = currentTransactions.reduce((sum, t) => sum + t.amountMinor, 0) / 100;
    const prevPeriod = prevTransactions.reduce((sum, t) => sum + t.amountMinor, 0) / 100;

    let percentChange = 0;
    if (prevPeriod > 0) {
      percentChange = Math.round(((thisPeriod - prevPeriod) / prevPeriod) * 100);
    } else if (thisPeriod > 0) {
      percentChange = 100; // 100% increase if last month was 0
    }

    // 8. Call Gemini for AI Insight
    let aiInsight = "";
    const categoriesDetails = categoriesList
      .map((c) => `${c.name}: ${c.amount} ${currency}`)
      .join(", ");
    const budgetsDetails = budgetsProgressList
      .map((b) => `${b.name} (${b.spent}/${b.limit} ${currency})`)
      .join(", ");

    const formattedDiff = Math.abs(thisPeriod - prevPeriod).toFixed(2);
    const comparisonDirection = thisPeriod < prevPeriod ? "less" : "more";

    const defaultInsight = `Your overall spending is ${
      percentChange < 0 ? "down" : "up"
    } ${Math.abs(percentChange)}% this month. You spent ${thisPeriod.toFixed(
      2
    )} ${currency} this period compared to ${prevPeriod.toFixed(
      2
    )} ${currency} in the previous month (a difference of ${formattedDiff} ${currency} ${comparisonDirection}).`;

    const cacheKey = `${userId}-${yearStr}-${monthStr}`;
    const cached = insightsCache.get(cacheKey);
    const now = Date.now();
    const isCurrentMonth =
      year === new Date().getUTCFullYear() && month === new Date().getUTCMonth() + 1;
    
    // Cache current month for 5 minutes (300,000 ms), past months indefinitely
    const CACHE_TTL = 5 * 60 * 1000;
    const isCacheValid = cached && (!isCurrentMonth || now - cached.timestamp < CACHE_TTL);

    if (isCacheValid && cached) {
      aiInsight = cached.insight;
    } else {
      if (process.env.GEMINI_API_KEY) {
        try {
          const userAge = user.birthDate ? calculateAge(user.birthDate) : "Not specified";
          const userGoal = user.financialGoal ? mapGoalText(user.financialGoal) : "General expense tracking";
          const targetSavings = user.targetSavingsRate ? `${user.targetSavingsRate}%` : "Not specified";
          const userGender = user.gender ? user.gender.toLowerCase() : "Not specified";

          const prompt = `
            You are a personal financial advisor. Write a very brief (2-3 sentences), serene, encouraging, and precise summary of the user's spending trends and budgets for this month.
            
            User Context:
            - Age: ${userAge}
            - Gender: ${userGender}
            - Primary Financial Goal: ${userGoal}
            - Target Savings Rate: ${targetSavings}

            Total Spent This Month: ${thisPeriod.toFixed(2)} ${currency}
            Total Spent Last Month: ${prevPeriod.toFixed(2)} ${currency}
            Percentage Change: ${percentChange}%
            Category Breakdown: ${categoriesDetails || "None"}
            Budgets Status: ${budgetsDetails || "No budgets set"}
            
            Guidelines:
            - Write advice tailored specifically to the user's goal, target savings rate, and age where helpful.
            - Keep it plain text under 300 characters.
            - Do NOT use markdown format (like bolding, lists, asterisk, or headers).
            - Be serene, encouraging, and precise.
          `;

          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
          });

          aiInsight = response.text ? response.text.trim() : defaultInsight;
          // Keep cache size bounded to prevent memory leaks (max 100 items)
          if (insightsCache.size >= 100) {
            const firstKey = insightsCache.keys().next().value;
            if (firstKey) insightsCache.delete(firstKey);
          }
          insightsCache.set(cacheKey, { insight: aiInsight, timestamp: now });
        } catch (err) {
          console.error("[Trends AI Insight Generation Failed]:", err);
          aiInsight = defaultInsight;
        }
      } else {
        aiInsight = defaultInsight;
      }
    }
    const activeMonthsByYear: Record<string, string[]> = {};
    
    allTransactionDates.forEach((t) => {
      const dateObj = new Date(t.date);
      const y = dateObj.getUTCFullYear().toString();
      const m = monthsOrder[dateObj.getUTCMonth()];
      if (!activeMonthsByYear[y]) {
        activeMonthsByYear[y] = [];
      }
      if (!activeMonthsByYear[y].includes(m)) {
        activeMonthsByYear[y].push(m);
      }
    });

    // Sort months within each year according to calendar order
    for (const y in activeMonthsByYear) {
      activeMonthsByYear[y].sort((a, b) => monthsOrder.indexOf(a) - monthsOrder.indexOf(b));
    }

    return {
      currency,
      locale,
      hasTransactions: true,
      trend: categoriesList.length > 0 ? trend : [], // Ensure trend is empty if no transactions in target month
      categories: categoriesList,
      budgets: budgetsProgressList,
      comparison: {
        thisPeriod,
        prevPeriod,
        percentChange,
      },
      aiInsight,
      activeMonthsByYear,
    };
  }
}

function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getUTCFullYear() - birthDate.getUTCFullYear();
  const m = today.getUTCMonth() - birthDate.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < birthDate.getUTCDate())) {
    age--;
  }
  return age;
}

function mapGoalText(goal: string): string {
  switch (goal) {
    case "TRACKING":
      return "Simple Expense Tracking";
    case "DEBT_PAYOFF":
      return "Debt Payoff";
    case "EMERGENCY_FUND":
      return "Building Emergency Fund";
    case "BIG_PURCHASE":
      return "Saving for Big Purchase";
    default:
      return "General Expense Tracking";
  }
}
