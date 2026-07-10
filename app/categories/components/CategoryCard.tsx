"use client";

import { formatCurrency } from "@/lib/utils";
import { CategoryIconBadge } from "@/app/components/CategoryIconBadge";
import { ChevronRight } from "lucide-react";

type CategoryWithDetails = {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  _count: { transactions: number };
  budget: { amountMinor: number; period: string } | null;
};

type CategoryCardProps = {
  category: CategoryWithDetails;
  currency: string;
  spentThisWeek: number;
  spentThisMonth: number;
  spentThisYear: number;
  onEdit: () => void;
};

export function CategoryCard({
  category,
  currency,
  spentThisWeek,
  spentThisMonth,
  spentThisYear,
  onEdit,
}: CategoryCardProps) {
  const hasBudget = category.type === "EXPENSE" && category.budget !== null;
  
  let spent = 0;
  let limit = 0;
  let periodLabel = "";

  if (hasBudget && category.budget) {
    limit = category.budget.amountMinor / 100;
    if (category.budget.period === "WEEKLY") {
      spent = spentThisWeek;
      periodLabel = "week";
    } else if (category.budget.period === "YEARLY") {
      spent = spentThisYear;
      periodLabel = "year";
    } else {
      spent = spentThisMonth;
      periodLabel = "month";
    }
  }

  const isIncome = category.type === "INCOME";
  const ratio = limit > 0 ? spent / limit : 0;
  const isOver = ratio > 1;

  // Format currency values
  const formattedSpent = formatCurrency(spent, currency, { compact: true });
  const formattedLimit = formatCurrency(limit, currency, { compact: true });
  const formattedMonthlySpent = formatCurrency(spentThisMonth, currency, { compact: true });

  return (
    <div 
      onClick={onEdit}
      className="bg-surface-container-lowest p-4 rounded-[20px] soft-card-shadow border border-outline-variant/10 hover:bg-surface-container-low/50 transition-all duration-200 active-press cursor-pointer flex flex-col gap-4 w-full text-left"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Icon and Name */}
        <div className="flex items-center gap-3.5 min-w-0">
          <CategoryIconBadge icon={category.icon} color={category.color} size="md" />
          <div className="min-w-0">
            <h3 className="font-headline text-[14px] font-bold text-on-surface truncate leading-snug">
              {category.name}
            </h3>
            <p className="font-body text-[11px] text-on-surface-variant/70 leading-none mt-0.5">
              {isIncome ? "Income" : "Expense"} • {category._count.transactions} transaction{category._count.transactions !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Right Side: Chevron & Quick Info */}
        <div className="flex items-center gap-2">
          {!hasBudget && (
            <span className="text-[12px] font-bold text-on-surface-variant/80">
              {isIncome ? `+${formattedMonthlySpent} this mo` : `${formattedMonthlySpent} this mo`}
            </span>
          )}
          {hasBudget && (
            <div className="flex flex-col items-end">
              <span className={`text-[12px] font-bold leading-none ${isOver ? "text-error" : "text-on-surface"}`}>
                {formattedSpent}
              </span>
              <span className="text-[9px] font-medium text-on-surface-variant/60 mt-0.5">
                limit: {formattedLimit}/{periodLabel === "week" ? "wk" : periodLabel === "year" ? "yr" : "mo"}
              </span>
            </div>
          )}
          <ChevronRight size={16} className="text-on-surface-variant/40 shrink-0" />
        </div>
      </div>

      {/* Progress Bar (if budget exists) */}
      {hasBudget && (
        <div className="flex flex-col gap-1.5 w-full">
          <div className="w-full bg-surface-variant/40 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500" 
              style={{ 
                width: `${Math.min(ratio * 100, 100)}%`,
                backgroundColor: isOver ? "var(--color-error)" : category.color
              }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-on-surface-variant/60">
            <span>
              {isOver 
                ? `${formatCurrency(spent - limit, currency, { compact: true })} over limit` 
                : `${formatCurrency(limit - spent, currency, { compact: true })} remaining`
              }
            </span>
            <span>
              {Math.round(ratio * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
