"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

export function DashboardChatbox() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);

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

      const txn = data.transactions[0];
      toast.success(
        `Logged: ${txn.description} (${formatCurrency(txn.amountMinor, data.currency || "USD")})`
      );
      
      setInput("");
      router.refresh();
      if (inputRef.current) inputRef.current.focus();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl z-40 px-4">
      <form 
        onSubmit={handleSubmit}
        className="w-full flex items-center gap-3 bg-surface/90 dark:bg-inverse-surface/90 backdrop-blur-xl border border-outline-variant/50 rounded-full py-2.5 px-4 shadow-[0_12px_40px_rgba(76,75,198,0.12)]"
      >
        <span className="material-symbols-outlined text-secondary ml-1 select-none">
          auto_awesome
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSubmitting}
          className="flex-grow bg-transparent border-none outline-none text-sm placeholder-secondary-fixed-dim text-on-surface focus:ring-0 px-1 py-0.5"
          placeholder="Log transaction (e.g. Lunch $15, Salary $3000)..."
        />
        <button
          type="submit"
          disabled={!input.trim() || isSubmitting}
          className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-90 transition-transform duration-150 disabled:opacity-40 cursor-pointer"
          aria-label="Send"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin text-white" size={16} />
          ) : (
            <span className="material-symbols-outlined text-base">send</span>
          )}
        </button>
      </form>
    </div>
  );
}