"use client";

import { useState } from "react";
import { TransactionCard } from "./TransactionCard";
import { EditTransactionModal } from "./EditTransactionModal";

type Transaction = {
  id: string;
  amountMinor: number;
  description: string;
  type: string;
  date: Date;
  categoryId: string;
  category: {
    name: string;
    icon: string;
    color: string;
  };
};

type Category = {
  id: string;
  name: string;
  icon: string;
  type: string;
};

type Props = {
  initialTransactions: Transaction[];
  categories?: Category[];
  currency: string;
  showDate?: boolean;
};

export function TransactionList({ initialTransactions, categories, currency, showDate = true }: Props) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  if (initialTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-on-surface-variant">
        <p className="font-body font-semibold">No transactions yet.</p>
        <p className="text-sm font-body text-on-secondary-container">Click the "+" button to add one.</p>
      </div>
    );
  }

  const closeDialog = () => setSelectedTxn(null);
  const isEditable = !!categories;

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl soft-card-shadow flex flex-col overflow-hidden px-4">
        {initialTransactions.map((txn) => (
          <TransactionCard 
            key={txn.id} 
            txn={txn} 
            currency={currency} 
            showDate={showDate} 
            onClick={isEditable ? () => setSelectedTxn(txn) : undefined} 
          />
        ))}
      </div>

      {isEditable && selectedTxn && (
        <EditTransactionModal
          isOpen={!!selectedTxn}
          onClose={closeDialog}
          txn={selectedTxn}
          categories={categories}
          currency={currency}
        />
      )}
    </>
  );
}
