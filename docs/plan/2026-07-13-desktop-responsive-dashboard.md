# Specification: Desktop Responsive Layout & Navigation

This document outlines the architecture, layout updates, and component design required to support a clean, responsive desktop experience. The focus is to make the dashboard desktop-friendly by incorporating richer data visualizations (bento cards) and a persistent, conversational transaction input bar at the bottom of the viewport, bypassing the need for modal popups on desktop.

---

## 1. Requirements & Objectives

- **Bypass Add Transaction Modal on Desktop**: Replace the header navigation action button with a persistent natural language transaction entry chatbox positioned at the bottom of the dashboard page.
- **Persistent Bottom Chatbox Component (`DashboardChatbox.tsx`)**:
  - Rendered fixed at the bottom center of the dashboard on desktop screens (`hidden md:flex`).
  - ChatGPT/Claude style prompt bar: pill-shaped, soft backdrop blur, modern shadow elevation.
  - Accepts natural language string (e.g. "Lunch $15", "Freelance income $2000").
  - On Enter or Send button press, calls `POST /api/transactions/parse` and triggers a Sonner success toast and refreshes dashboard data.
- **Hide BottomNav on Desktop**: The bottom navigation ([BottomNav.tsx](file:///C:/Users/farre/projects/capital-tracker/app/components/BottomNav.tsx)) must be hidden on screens larger than `md` (768px).
- **Desktop Header Navigation**: A persistent header navbar at the top of the viewport (excluding login, register, and onboarding flows) showing the brand logo, navigation links with active state styles, and a logout button.
- **Richer Desktop Cards (Bento Grid)**:
  - **Net Cash Flow Card (New!)**: Displays monthly total income vs monthly total expenses, with the net cash flow difference highlighted.
  - **Savings Goal Card (New!)**: Displays user target savings rate vs actual monthly savings rate (calculated as `Net Cash Flow / Income * 100`).
- **Responsive Dashboard Layout Grid**:
  - Desktop view uses a 12-column layout:
    - **Left Area (8 columns)**: Greeting, Total Spent card, and a expanded 2x2 Bento Grid (Categories Summary, Weekly Trend, Net Cash Flow, Savings Goal).
    - **Right Area (4 columns)**: Recent Transactions list.
    - Large spacing and adjusted padding-bottom (`pb-36`) on desktop to accommodate the persistent bottom input chatbox.

---

## 2. Component Design & Changes

### A. Persistent Bottom Chatbox Component
Create a new client component [app/components/DashboardChatbox.tsx](file:///C:/Users/farre/projects/capital-tracker/app/components/DashboardChatbox.tsx) for natural language transaction logging.
```tsx
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
          className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md active:scale-90 transition-transform duration-150 disabled:opacity-40"
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
```

### B. Add Desktop-only Bento Cards in `app/page.tsx`
We will sum both Income and Expenses in `app/page.tsx` and pass them to the bento grid:

```typescript
// app/page.tsx sums logic:
let totalExpense = 0;
let totalIncome = 0;
const categorySums: Record<string, { name: string; amount: number; color: string; icon: string }> = {};

(transactions as unknown as TransactionWithCategory[]).forEach((txn) => {
  if (txn.type === "EXPENSE") {
    totalExpense += txn.amountMinor;
    // ... category summation ...
  } else if (txn.type === "INCOME") {
    totalIncome += txn.amountMinor;
  }
});

const netCashFlow = totalIncome - totalExpense;
const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 100) : 0;
const targetSavingsRate = user.targetSavingsRate || 30; // Fallback default
```

1. **Net Cash Flow Card (Bento Grid)**:
```tsx
<div className="bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40">
  <div className="flex items-center gap-2 text-primary">
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>payments</span>
    <span className="font-label-md font-semibold">Cash Flow</span>
  </div>
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center text-xs">
      <span className="text-secondary">Income:</span>
      <span className="text-green-600 font-semibold">{formatCurrency(totalIncome, user.currency)}</span>
    </div>
    <div className="flex justify-between items-center text-xs">
      <span className="text-secondary">Expenses:</span>
      <span className="text-error font-semibold">{formatCurrency(totalExpense, user.currency)}</span>
    </div>
    <div className="border-t border-surface-variant/40 mt-1 pt-1 flex justify-between items-center text-sm font-bold">
      <span>Net:</span>
      <span className={netCashFlow >= 0 ? "text-green-600" : "text-error"}>
        {netCashFlow >= 0 ? "+" : ""}{formatCurrency(netCashFlow, user.currency)}
      </span>
    </div>
  </div>
</div>
```

2. **Savings Goal Card (Bento Grid)**:
```tsx
<div className="bg-surface-container-lowest rounded-xl p-container-padding soft-card-shadow flex flex-col justify-between h-40">
  <div className="flex items-center gap-2 text-primary">
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `"FILL" 1` }}>savings</span>
    <span className="font-label-md font-semibold">Savings Goal</span>
  </div>
  <div className="flex flex-col">
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-xs text-secondary">Actual vs Target</span>
      <span className="text-sm font-bold">{savingsRate}% / {targetSavingsRate}%</span>
    </div>
    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden mt-1">
      <div 
        className={`h-full rounded-full ${savingsRate >= targetSavingsRate ? "bg-green-500" : "bg-primary"}`} 
        style={{ width: `${Math.max(0, Math.min(savingsRate, 100))}%` }}
      ></div>
    </div>
    <p className="text-[10px] text-secondary mt-2 leading-tight">
      {savingsRate >= targetSavingsRate 
        ? "Great! You are exceeding your savings rate goal." 
        : `Save ${formatCurrency(Math.max(0, Math.round((totalIncome * targetSavingsRate / 100) - netCashFlow)), user.currency)} more to hit target.`}
    </p>
  </div>
</div>
```

---

## 3. Responsive Layout Configurations

### A. Header Navigation Updates
[app/components/DesktopHeader.tsx](file:///C:/Users/farre/projects/capital-tracker/app/components/DesktopHeader.tsx) will omit the transaction trigger button to favor the persistent chatbox at the bottom:
```tsx
// Right section of DesktopHeader
<div className="flex items-center gap-4">
  <button 
    onClick={async () => await logout()}
    className="text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors p-2 rounded-full flex items-center justify-center active-press"
  >
    <span className="material-symbols-outlined">logout</span>
  </button>
</div>
```

### B. Dashboard Page Layout Update
Update [app/page.tsx](file:///C:/Users/farre/projects/capital-tracker/app/page.tsx) layout grid:
- Grid setup: `lg:grid lg:grid-cols-12 lg:gap-8 lg:max-w-6xl lg:mx-auto`
- Left col layout: `lg:col-span-8`
- Right col layout: `lg:col-span-4`
- Multi-column Bento layout: `grid grid-cols-2 lg:grid-cols-4 gap-gutter` to show all 4 cards in a single row on desktop!
- Chatbox placement: Include `<DashboardChatbox />` inside `app/page.tsx` layout.
- Background Wave SVG: Add `md:hidden` to the absolute-positioned wave wrapper `div` to hide it on larger screens.

---

## 4. Implementation Steps & Verification

1. **Step 1**: Create [app/components/DesktopHeader.tsx](file:///C:/Users/farre/projects/capital-tracker/app/components/DesktopHeader.tsx) and add it to [app/layout.tsx](file:///C:/Users/farre/projects/capital-tracker/app/layout.tsx).
2. **Step 2**: Create [app/components/DashboardChatbox.tsx](file:///C:/Users/farre/projects/capital-tracker/app/components/DashboardChatbox.tsx).
3. **Step 3**: Add `md:hidden` to the mobile fixed `<header>` and `<BottomNav />` wrapper elements.
4. **Step 4**: Update [app/page.tsx](file:///C:/Users/farre/projects/capital-tracker/app/page.tsx) dashboard calculation logic to include Income vs Expenses, and update JSX to feature the 12-column grid, new Bento cards (Cash Flow and Savings Goal), and the bottom `<DashboardChatbox />` component.
5. **Step 5**: Test visually in development mode across mobile and desktop breakpoints to verify:
   - On Desktop: Desktop Header matches routes, bottom chatbox inputs natural text, toast triggers, page content updates reactively, bento displays 4 cards cleanly.
   - On Mobile: Layout behaves exactly as before (FAB floating, mobile header visible, bottom nav visible).
