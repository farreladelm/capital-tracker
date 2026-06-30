"use client";

import { format } from "date-fns";
import { useState, useRef, useEffect } from "react";
import { updateTransaction, deleteTransaction } from "../actions/transaction";
import { X, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";

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
  categories: Category[];
  currency: string;
};

export function TransactionList({ initialTransactions, categories, currency }: Props) {
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  if (initialTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-400">
        <p>No transactions yet.</p>
        <p className="text-sm">Type in the box below to log your first one!</p>
      </div>
    );
  }

  const closeDialog = () => setSelectedTxn(null);

  return (
    <>
      <div className="flex flex-col gap-3">
        {initialTransactions.map((txn) => (
          <div 
            key={txn.id} 
            onClick={() => setSelectedTxn(txn)}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm border border-slate-100 hover:border-blue-100 transition-colors cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-4">
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl shadow-sm"
                style={{ backgroundColor: `${txn.category.color}20` }}
              >
                {txn.category.icon}
              </div>
              <div>
                <div className="font-semibold text-slate-800">{txn.description}</div>
                <div className="flex gap-2 text-xs font-medium text-slate-500">
                  <span style={{ color: txn.category.color }}>{txn.category.name}</span>
                  <span>•</span>
                  <span>{format(new Date(txn.date), "MMM d")}</span>
                </div>
              </div>
            </div>
            <div className={`font-bold ${txn.type === "INCOME" ? "text-emerald-500" : "text-slate-800"}`}>
              {txn.type === "INCOME" ? "+" : "-"}{formatCurrency(txn.amountMinor, currency)}
            </div>
          </div>
        ))}
      </div>

      {selectedTxn && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 animate-in fade-in duration-200"
          onClick={closeDialog}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-slate-100 p-4">
              <h2 className="font-bold text-slate-800">Edit Transaction</h2>
              <div className="flex gap-2">
                <form action={async (fd) => { await deleteTransaction(fd); closeDialog(); }}>
                  <input type="hidden" name="id" value={selectedTxn.id} />
                  <button type="submit" className="rounded-full p-2 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={20} />
                  </button>
                </form>
                <button onClick={closeDialog} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </header>

            <form action={async (fd) => { await updateTransaction(fd); closeDialog(); }} className="flex flex-col gap-5 p-5">
              <input type="hidden" name="id" value={selectedTxn.id} />
              
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-500">Amount ({currency})</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    defaultValue={(selectedTxn.amountMinor / 100).toFixed(2)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-14 pr-4 text-xl font-bold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-500">Description</label>
                <input
                  name="description"
                  type="text"
                  defaultValue={selectedTxn.description}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-500">Category</label>
                <select
                  name="categoryId"
                  defaultValue={selectedTxn.categoryId}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name} ({c.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-slate-500">Date</label>
                <input
                  name="date"
                  type="date"
                  defaultValue={new Date(selectedTxn.date).toISOString().split("T")[0]}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-blue-600 py-3 font-bold text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
