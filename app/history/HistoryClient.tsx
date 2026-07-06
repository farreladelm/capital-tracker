"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2, SearchX } from "lucide-react";
import { TransactionList } from "@/app/components/TransactionList";

type Category = {
  id: string;
  name: string;
  icon: string;
  type: string;
  color?: string;
};

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

const FILTER_TABS = [
  { value: "ALL", label: "All" },
  { value: "EXPENSE", label: "Expenses" },
  { value: "INCOME", label: "Income" },
] as const;

export function HistoryClient({
  currency,
  categories,
}: {
  currency: string;
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const observerTarget = useRef(null);
  const loadingRef = useRef(loading);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = useCallback(
    async (cursor?: string | null, reset = false) => {
      if (loadingRef.current) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (cursor) params.append("cursor", cursor);
        if (debouncedSearch) params.append("search", debouncedSearch);
        if (type !== "ALL") params.append("type", type);

        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setTransactions((prev) =>
          reset ? data.transactions : [...prev, ...data.transactions]
        );
        setNextCursor(data.nextCursor || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [debouncedSearch, type]
  );

  // Reset and fetch when filters change
  useEffect(() => {
    Promise.resolve().then(() => {
      setInitialLoading(true);
      fetchTransactions(null, true);
    });
  }, [debouncedSearch, type, fetchTransactions]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          nextCursor &&
          !loadingRef.current
        ) {
          fetchTransactions(nextCursor);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, fetchTransactions]);

  // Group by date
  const grouped = transactions.reduce((acc, txn) => {
    const date = new Date(txn.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(txn);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const hasFiltersActive = search !== "" || type !== "ALL";

  return (
    <div className="flex flex-col w-full">
      {/* ─── Search & Filter Bar ─────────────────────────────────────── */}
      <div
        className="sticky top-16 z-90 pt-5 pb-4 mb-2 flex flex-col gap-3"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-surface) 80%, transparent 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Search input */}
        <div
          className="flex items-center w-full rounded-2xl bg-surface-container-lowest dark:bg-surface-container-high transition-all duration-200 shadow-[0_4px_20px_rgba(89,90,115,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-primary/15 dark:focus-within:ring-primary-fixed/20 focus-within:shadow-[0_4px_20px_rgba(76,75,198,0.08)] dark:focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
        >
          <span className="pl-4 pr-2 text-on-surface-variant shrink-0">
            <Search size={17} strokeWidth={2} />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-on-surface text-sm py-3.5 px-1 outline-none placeholder:text-on-surface-variant/60 min-w-0"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                searchInputRef.current?.focus();
              }}
              className="pr-4 pl-2 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
              aria-label="Clear search"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-2">
          {FILTER_TABS.map((tab) => {
            const isActive = type === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setType(tab.value)}
                className={`
                  flex-1 py-2 px-3 rounded-full font-label-sm text-xs
                  transition-all duration-200 active-press
                  ${
                    isActive
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container hover:bg-surface-container-high text-secondary"
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Transaction List ─────────────────────────────────────────── */}
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-on-surface-variant">
          <Loader2 className="animate-spin text-primary" size={28} />
          <span className="font-label-md text-sm">Loading history…</span>
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState hasFilters={hasFiltersActive} onClear={() => { setSearch(""); setType("ALL"); }} />
      ) : (
        <div className="space-y-7 pb-4">
          {(Object.entries(grouped) as [string, Transaction[]][]).map(
            ([date, txns]) => (
              <div key={date}>
                {/* Date label */}
                <div className="pt-4 pb-1 mb-2">
                  <span className="font-label-sm text-[11px] uppercase tracking-wider font-bold text-on-surface-variant/75">
                    {date}
                  </span>
                </div>

                <TransactionList
                  initialTransactions={txns}
                  categories={categories}
                  currency={currency}
                  showDate={false}
                />
              </div>
            )
          )}

          {/* Infinite scroll sentinel */}
          <div
            ref={observerTarget}
            className="h-12 flex items-center justify-center"
          >
            {loading && !initialLoading && (
              <Loader2 className="animate-spin text-primary/60" size={20} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Empty State ──────────────────────────────────────────────────────── */

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant">
        <SearchX size={26} strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-headline-md text-base font-semibold text-on-surface">
          {hasFilters ? "No matching transactions" : "No transactions yet"}
        </p>
        <p className="font-body-md text-sm text-on-surface-variant max-w-[220px]">
          {hasFilters
            ? "Try adjusting your search or filters."
            : "Start logging expenses and income to see them here."}
        </p>
      </div>
      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-1 py-2.5 px-6 rounded-full bg-primary/10 font-label-sm text-xs text-primary active-press transition-colors hover:bg-primary/20"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
