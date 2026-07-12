"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatCurrency, getTransactionAmountConfig } from "@/lib/format";
import type { CategoryModel as Category, TransactionModel as Transaction } from "@/generated/prisma/models";
import { TransactionSuccessCard } from "./TransactionSuccessCard";
import { Select } from "./Select";
import { Input } from "./Input";
import { createTransaction } from "../actions/transaction";

export function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
  const [isManual, setIsManual] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) setCategories(data.categories);
          if (data.currency) setCurrency(data.currency);
        })
        .catch((err) => console.error("Failed to load categories/currency:", err));
    }
  }, [isOpen]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to parse transaction");
      }

      setSuccessTxn(data.transactions[0]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const fd = new FormData(e.currentTarget);
      const res = await createTransaction(fd);
      if (res && res.error) {
        throw new Error(res.error);
      }
      if (res && res.success && res.transaction) {
        const returnedTxn = res.transaction as any;
        setSuccessTxn({
          ...returnedTxn,
          date: new Date(returnedTxn.date),
          createdAt: new Date(returnedTxn.createdAt),
          updatedAt: new Date(returnedTxn.updatedAt),
        });
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setInput("");
      setSuccessTxn(null);
      setError(null);
      setIsManual(false);
    }, 300); // clear after animation
  };

  const matchedCategory = successTxn ? categories.find((c) => c.id === successTxn.categoryId) : null;

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const selectGroups = [
    {
      label: "Expenses",
      options: expenseCategories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
      })),
    },
    {
      label: "Income",
      options: incomeCategories.map((c) => ({
        value: c.id,
        label: c.name,
        icon: c.icon,
      })),
    },
  ];

  const { defaultValue, step } = getTransactionAmountConfig(0, currency);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-200 hover:opacity-90"
      >
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: `"FILL" 0` }}>add</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[200] bg-background flex flex-col overflow-hidden text-on-background animate-in slide-in-from-bottom-full duration-300">
          
          {/* Subtle Background Glow for success state */}
          {successTxn && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 z-0">
              <div className="w-96 h-96 bg-primary-fixed-dim rounded-full blur-[100px]"></div>
            </div>
          )}

          {/* Top Navigation */}
          <header className="fixed top-0 w-full bg-background/80 dark:bg-background/80 backdrop-blur-xl z-50 flex justify-between items-center px-margin-page h-16">
            <button 
              onClick={isManual ? () => setIsManual(false) : handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 transition-transform"
              aria-label={isManual ? "Back to voice/text input" : "Close modal"}
            >
              <span className="material-symbols-outlined text-2xl font-light">
                {isManual ? "arrow_back" : "close"}
              </span>
            </button>
            <span className="font-headline-md font-bold text-primary">
              {isManual ? "Manual Input" : "Balance"}
            </span>
            <div className="w-10 h-10"></div> {/* Spacer */}
          </header>

          {/* Main Content Canvas */}
          <main className="flex-grow flex flex-col pt-24 pb-32 px-margin-page overflow-y-auto hide-scrollbar relative z-10">
            {error && (
              <div className="w-full max-w-md mx-auto mb-4 bg-error-container text-on-error-container p-4 rounded-xl shadow-sm text-sm font-medium">
                {error}
              </div>
            )}
            
            {!successTxn ? (
              isManual ? (
                /* Manual Form */
                <div className="w-full max-w-md mx-auto my-auto relative glass-card rounded-3xl p-6 shadow-[0_-4px_20px_rgba(76,75,198,0.06)] bg-white/70 dark:bg-surface-container/70 backdrop-blur-xl border border-white/20 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="font-headline text-lg font-bold text-on-surface mb-4">Add Transaction</h3>
                  <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                    {/* Amount */}
                    <Input
                      key={currency}
                      label={`Amount (${currency})`}
                      name="amount"
                      type="number"
                      step={step}
                      min="0"
                      defaultValue={defaultValue}
                      required
                      iconPrefix={currency}
                      className="font-headline font-bold text-lg"
                    />

                    {/* Description */}
                    <Input
                      label="Description"
                      name="description"
                      type="text"
                      placeholder="e.g. Coffee"
                      required
                    />

                    {/* Category */}
                    <div className="flex flex-col gap-1.5">
                      <label className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[10px] select-none">
                        Category
                      </label>
                      <Select
                        name="categoryId"
                        groups={selectGroups}
                        required
                      />
                    </div>

                    {/* Date */}
                    <Input
                      label="Date"
                      name="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      required
                    />

                    {/* Save Action Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-2 w-full h-12 rounded-full bg-primary text-on-primary font-headline text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        "Save Transaction"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsManual(false)}
                      className="w-full text-center text-sm font-label-md text-primary hover:opacity-85 active:scale-95 transition-all mt-1 cursor-pointer"
                    >
                      Switch to Text/Voice input
                    </button>
                  </form>
                </div>
              ) : (
                /* Natural Language Parsing View */
                <>
                  {/* Suggestions Area */}
                  <div className="mt-auto mb-stack-lg w-full max-w-md mx-auto">
                    <h2 className="font-label-md text-secondary mb-stack-sm pl-2">Quick Suggestions</h2>
                    <div className="flex overflow-x-auto hide-scrollbar space-x-gutter pb-2 -mx-margin-page px-margin-page md:mx-0 md:px-0">
                      <button onClick={() => setInput("Lunch $15")} className="flex-shrink-0 flex items-center space-x-2 bg-surface-container-high text-on-surface px-4 py-2 rounded-full hover:opacity-80 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[18px]">restaurant</span>
                        <span className="font-body-md">Lunch $15</span>
                      </button>
                      <button onClick={() => setInput("Grab $8")} className="flex-shrink-0 flex items-center space-x-2 bg-surface-container-high text-on-surface px-4 py-2 rounded-full hover:opacity-80 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[18px]">local_taxi</span>
                        <span className="font-body-md">Grab $8</span>
                      </button>
                      <button onClick={() => setInput("Netflix $12")} className="flex-shrink-0 flex items-center space-x-2 bg-surface-container-high text-on-surface px-4 py-2 rounded-full hover:opacity-80 active:scale-95 transition-all">
                        <span className="material-symbols-outlined text-[18px]">movie</span>
                        <span className="font-body-md">Netflix $12</span>
                      </button>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="w-full max-w-md mx-auto relative glass-card rounded-3xl p-4 md:p-6 mb-8 shadow-[0_-4px_20px_rgba(76,75,198,0.06)] bg-white/70 dark:bg-surface-container/70 backdrop-blur-xl border border-white/20">
                    <textarea 
                      ref={inputRef}
                      autoFocus 
                      value={input}
                      onChange={handleInput}
                      disabled={isSubmitting}
                      className="w-full bg-transparent border-none outline-none font-headline-md resize-none placeholder-secondary-fixed-dim text-on-surface min-h-[120px] focus:ring-0 p-0 disabled:opacity-50" 
                      placeholder="What did you spend today?"
                    />
                    <div className="flex justify-between items-center mt-stack-sm">
                      <div className="flex space-x-4">
                        <button aria-label="Voice input" className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:opacity-80 active:scale-95 transition-all">
                          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>mic</span>
                        </button>
                        <button aria-label="Camera input" className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:opacity-80 active:scale-95 transition-all">
                          <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setIsManual(true)} 
                          aria-label="Manual input" 
                          className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:opacity-80 active:scale-95 transition-all"
                        >
                          <span className="material-symbols-outlined text-2xl">edit_note</span>
                        </button>
                      </div>
                      <button 
                        onClick={handleSubmit}
                        disabled={!input.trim() || isSubmitting}
                        className="h-12 px-6 flex items-center justify-center rounded-full bg-primary text-on-primary font-label-md shadow-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={24} />
                        ) : (
                          <>
                            <span>Save</span>
                            <span className="material-symbols-outlined ml-2 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )
            ) : (
              <TransactionSuccessCard
                transaction={successTxn}
                currency={currency}
                category={matchedCategory}
                onDone={handleClose}
                onDismiss={() => {
                  setSuccessTxn(null);
                  setIsOpen(false);
                }}
              />
            )}
          </main>
        </div>
      , document.body)}
    </>
  );
}
