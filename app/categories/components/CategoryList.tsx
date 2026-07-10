"use client";

import { useState, useMemo, useRef } from "react";
import { Search, X } from "lucide-react";
import { CategoryCard } from "./CategoryCard";

type CategoryWithDetails = {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
  _count: { transactions: number };
  budget: { amountMinor: number; period: string } | null;
};

type CategoryListProps = {
  categories: CategoryWithDetails[];
  currency: string;
  spentData: Record<string, { week: number; month: number; year: number }>;
  onEditCategory: (category: CategoryWithDetails) => void;
};

export function CategoryList({
  categories,
  currency,
  spentData,
  onEditCategory,
}: CategoryListProps) {
  const [filter, setFilter] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredCategories = useMemo(() => {
    return categories
      .filter((c) => {
        if (filter === "EXPENSE" && c.type !== "EXPENSE") return false;
        if (filter === "INCOME" && c.type !== "INCOME") return false;
        if (search.trim() !== "" && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
      });
  }, [categories, filter, search]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div
          className="flex items-center w-full md:max-w-xs rounded-2xl bg-surface-container-lowest dark:bg-surface-container-high transition-all duration-200 shadow-[0_4px_20px_rgba(89,90,115,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.15)] focus-within:ring-2 focus-within:ring-primary/15 dark:focus-within:ring-primary-fixed/20 focus-within:shadow-[0_4px_20px_rgba(76,75,198,0.08)] dark:focus-within:shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-outline-variant/10"
        >
          <span className="pl-4 pr-2 text-on-surface-variant shrink-0">
            <Search size={17} strokeWidth={2} />
          </span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 font-body text-on-surface text-sm py-3 px-1 outline-none placeholder:text-on-surface-variant/60 min-w-0"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                searchInputRef.current?.focus();
              }}
              className="pr-4 pl-2 text-on-surface-variant hover:text-on-surface transition-colors shrink-0 bg-transparent border-none cursor-pointer"
              aria-label="Clear search"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full md:w-auto md:min-w-[280px]">
          {(["ALL", "EXPENSE", "INCOME"] as const).map((f) => {
            const isActive = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`
                  flex-1 md:px-5 py-2 rounded-full font-label-sm text-xs
                  transition-all duration-200 active-press border-none cursor-pointer
                  ${
                    isActive
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container hover:bg-surface-container-high text-secondary"
                  }
                `}
              >
                {f === "ALL" ? "All" : f === "EXPENSE" ? "Expenses" : "Income"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List */}
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-surface-container-lowest border border-outline-variant/10 rounded-[24px] soft-card-shadow">
          <span className="material-symbols-outlined text-[36px] text-on-surface-variant/45 select-none mb-2">
            category_search
          </span>
          <p className="font-headline text-sm font-bold text-on-surface">No categories found</p>
          <p className="font-body text-xs text-on-surface-variant mt-1">Try expanding your filter or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCategories.map((c) => {
            const spent = spentData[c.id] || { week: 0, month: 0, year: 0 };
            return (
              <CategoryCard
                key={c.id}
                category={c}
                currency={currency}
                spentThisWeek={spent.week}
                spentThisMonth={spent.month}
                spentThisYear={spent.year}
                onEdit={() => onEditCategory(c)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
