"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { SendHorizontal, Loader2 } from "lucide-react";

export function MagicBox() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error(data.message || data.error || "Failed to parse");
      }

      setInput("");
      router.refresh(); // Automatically reload the server components (dashboard data)
    } catch (err: any) {
      setError(err.message);
      // Shake animation class could be added here on error
      if (inputRef.current) {
        inputRef.current.classList.add("animate-shake");
        setTimeout(() => {
          inputRef.current?.classList.remove("animate-shake");
        }, 500);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full flex-col gap-2">
      {error && (
        <div className="absolute -top-12 left-0 right-0 mx-auto w-fit rounded-full bg-red-100 px-4 py-2 text-xs font-semibold text-red-600 shadow-sm animate-in slide-in-from-bottom-2">
          {error}
        </div>
      )}
      <div className="relative flex items-center rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 p-2 transition-all focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-400">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. bought coffee for 4$"
          disabled={isSubmitting}
          className="flex-1 bg-transparent px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50"
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSubmitting}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white transition-all hover:bg-blue-700 active:scale-90 disabled:opacity-50 disabled:active:scale-100"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <SendHorizontal size={20} />}
        </button>
      </div>
    </form>
  );
}
