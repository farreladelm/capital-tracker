"use client";

import { formatCurrency } from "@/lib/format";
import type { CategoryModel as Category, TransactionModel as Transaction } from "@/generated/prisma/models";
import { CategoryIcon } from "./CategoryIcon";

type TransactionSuccessCardProps = {
  transaction: Transaction;
  currency: string;
  category?: Category | null;
  onDone: () => void;
  onDismiss: () => void;
};

export function TransactionSuccessCard({
  transaction,
  currency,
  category,
  onDone,
  onDismiss,
}: TransactionSuccessCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-[32px] p-8 max-w-md w-full mx-auto relative z-10 shadow-[0_4px_20px_rgba(48,48,56,0.05)] flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-500 my-auto">
      {/* Success Icon */}
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 text-primary">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1`, fontSize: "40px" }}>check_circle</span>
      </div>
      
      <h1 className="font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2">
        Expense Added
      </h1>
      <p className="font-body-md text-on-surface-variant mb-8">
        Your transaction has been successfully recorded.
      </p>
      
      {/* Details Block */}
      <div className="w-full rounded-2xl p-6 mb-8 flex flex-col gap-4 bg-surface-container-lowest border border-outline-variant/30 text-left">
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant/30">
          <span className="font-body-md text-on-surface-variant">Amount</span>
          <span className="font-headline-md text-on-surface">{formatCurrency(transaction.amountMinor, currency)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-md text-on-surface-variant">Description</span>
          <span className="font-label-md text-on-surface capitalize truncate max-w-[150px]">{transaction.description}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-md text-on-surface-variant">Category</span>
          <div className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">
            <CategoryIcon icon={category?.icon || "question_mark"} className="text-xs w-4 h-4" />
            <span className="font-label-sm leading-none">{category?.name || "Uncategorized"}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-body-md text-on-surface-variant">Date</span>
          <span className="font-label-md text-on-surface">
            {new Date(transaction.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>
      
      {/* Actions */}
      <div className="w-full flex flex-col gap-4">
        <button onClick={onDone} className="w-full h-14 bg-primary text-on-primary rounded-full font-label-md flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20">
          Done
        </button>
        <button onClick={onDismiss} className="w-full h-14 bg-primary/10 text-primary rounded-full font-label-md flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all">
          Dismiss
        </button>
      </div>
    </div>
  );
}
