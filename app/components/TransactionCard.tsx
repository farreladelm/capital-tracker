"use client";

import { useState, useEffect } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { formatCurrency } from "@/lib/format";

type TransactionWithCategory = {
  id: string;
  amountMinor: number;
  description: string;
  type: string;
  date: Date | string;
  categoryId: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
};

export function TransactionCard({ 
  txn, 
  currency, 
  showDate = false,
  onClick 
}: { 
  txn: TransactionWithCategory; 
  currency: string;
  showDate?: boolean;
  onClick?: () => void;
}) {
  const isIncome = txn.type === "INCOME";
  
  const [dateText, setDateText] = useState("");

  useEffect(() => {
    if (showDate) {
      const d = new Date(txn.date);
      if (isToday(d)) {
        setDateText("Today");
      } else if (isYesterday(d)) {
        setDateText("Yesterday");
      } else {
        setDateText(format(d, "dd MMM"));
      }
    }
  }, [txn.date, showDate]);

  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between py-4 border-b border-surface-variant last:border-b-0 gap-4 ${onClick ? 'cursor-pointer hover:bg-surface-variant/50 transition-colors' : ''}`}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-primary aspect-square shrink-0">
          {/* We assume txn.category.icon might be an emoji or an icon name. We'll render it as text for now. If it's a material icon string, we can conditionally add the class. For safety, just span. */}
          <span className="text-2xl flex items-center justify-center">{txn.category.icon}</span>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-sm font-semibold text-on-background truncate">{txn.description}</span>
          <span className="font-label-sm text-secondary truncate">
            {txn.category.name} {showDate && dateText && `• ${dateText}`}
          </span>
        </div>
      </div>
      <span className={`text-sm font-semibold shrink-0 truncate max-w-[120px] text-right ${isIncome ? 'text-primary' : 'text-error'}`}>
        {isIncome ? "+" : "-"}{formatCurrency(txn.amountMinor, currency)}
      </span>
    </div>
  );
}
