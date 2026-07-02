"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { CategoryModel as Category, TransactionModel as Transaction } from "@/generated/prisma/models";

export function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTxn, setSuccessTxn] = useState<Transaction | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currency, setCurrency] = useState<string>("USD");
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

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setInput("");
      setSuccessTxn(null);
      setError(null);
    }, 300); // clear after animation
  };

  const matchedCategory = successTxn ? categories.find((c) => c.id === successTxn.categoryId) : null;

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
              onClick={handleClose}
              className="w-10 h-10 flex items-center justify-center rounded-full text-on-surface-variant hover:opacity-80 transition-opacity active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-2xl font-light">close</span>
            </button>
            <span className="font-headline-md font-bold text-primary">Balance</span>
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
            ) : (
              /* Success Card UI */
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
                     <span className="font-headline-md text-on-surface">{formatCurrency(successTxn.amountMinor, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-on-surface-variant">Description</span>
                    <span className="font-label-md text-on-surface capitalize truncate max-w-[150px]">{successTxn.description}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-on-surface-variant">Category</span>
                    <div className="flex items-center gap-2 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full">
                      <span className="material-symbols-outlined text-[16px]">{matchedCategory?.icon || "category"}</span>
                      <span className="font-label-sm">{matchedCategory?.name || "Uncategorized"}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-on-surface-variant">Date</span>
                    <span className="font-label-md text-on-surface">
                      {new Date(successTxn.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="w-full flex flex-col gap-4">
                  <button onClick={handleClose} className="w-full h-14 bg-primary text-on-primary rounded-full font-label-md flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-md shadow-primary/20">
                    Done
                  </button>
                  <button onClick={() => { setSuccessTxn(null); setIsOpen(false); }} className="w-full h-14 bg-primary/10 text-primary rounded-full font-label-md flex items-center justify-center hover:bg-primary/20 active:scale-95 transition-all">
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      , document.body)}
    </>
  );
}
