# Specification: Dynamic Date Selector Filtering (Month/Year Selector)

This document outlines the blueprint for dynamically filtering the selector pills, "More" month selector, and "Year" selector to only show dates where the user actually has transaction records.

---

## 1. Database & Service Layer Query
According to the application architecture, all Prisma queries must reside in the service layer inside `lib/services/`.

Create or update a service class (e.g., `TransactionService` in `lib/services/transaction.service.ts`):

```typescript
import { prisma } from "@/lib/prisma";

export class TransactionService {
  /**
   * Resolves the range of active history for a user, returning list of valid years 
   * and starting month parameters for filtering.
   */
  static async getActiveHistoryRange(userId: string) {
    // Query for the oldest transaction date
    const oldestTransaction = await prisma.transaction.findFirst({
      where: { userId },
      orderBy: { date: "asc" },
      select: { date: true },
    });

    const startDate = oldestTransaction?.date || new Date(); // Fallback to today if none exists
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth(); // 0-indexed (0 = January)

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Generate years array from currentYear down to startYear (e.g., ["2026", "2025", "2024"])
    const years: string[] = [];
    for (let y = currentYear; y >= startYear; y--) {
      years.push(y.toString());
    }

    return {
      years,          // List of valid years to feed the Year picker
      startYear,      // Year when transaction history starts
      startMonth,     // Month index (0-11) when history starts in startYear
      currentYear,
      currentMonth,
    };
  }
}
```

---

## 2. API / Page Handlers (Data Flow)
Pre-fetch this information inside the `/trends` Server Component page or a Server Action, then pass it down as parameters to the `<MonthSelector>` client component.

```typescript
// app/trends/page.tsx
import { TransactionService } from "@/lib/services/transaction.service";

export default async function TrendsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  
  // Retrieve date range parameters
  const rangeData = await TransactionService.getActiveHistoryRange(userId);

  return (
    <main>
      {/* ... header ... */}
      <MonthSelector 
        selectedMonth={selectedMonth} 
        onMonthChange={handleMonthChange} 
        selectedYear={selectedYear} 
        onYearChange={handleYearChange} 
        availableYears={rangeData.years}
        startYear={rangeData.startYear}
        startMonth={rangeData.startMonth}
        currentYear={rangeData.currentYear}
        currentMonth={rangeData.currentMonth}
      />
      {/* ... bento grid ... */}
    </main>
  );
}
```

---

## 3. Selector Component Filtering Logic
Modify `<MonthSelector>` in `app/components/MonthSelector.tsx` to filter dropdown values.

```typescript
// app/components/MonthSelector.tsx
type MonthSelectorProps = {
  selectedMonth: string;
  onMonthChange: (monthId: string) => void;
  selectedYear: string;
  onYearChange: (yearId: string) => void;
  availableYears: string[]; // e.g. ["2026", "2025", "2024"]
  startYear: number;       // e.g. 2024
  startMonth: number;      // e.g. 9 (October)
  currentYear: number;
  currentMonth: number;
};

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  availableYears,
  startYear,
  startMonth,
  currentYear,
  currentMonth
}: MonthSelectorProps) {
  
  const allMonths = [
    { id: "jan", name: "January", index: 0 },
    { id: "feb", name: "February", index: 1 },
    { id: "mar", name: "March", index: 2 },
    { id: "apr", name: "April", index: 3 },
    { id: "may", name: "May", index: 4 },
    { id: "june", name: "June", index: 5 },
    { id: "july", name: "July", index: 6 },
    { id: "aug", name: "August", index: 7 },
    { id: "sept", name: "September", index: 8 },
    { id: "oct", name: "October", index: 9 },
    { id: "nov", name: "November", index: 10 },
    { id: "dec", name: "December", index: 11 }
  ];

  // Filter months lists dynamically based on selectedYear
  const selectableMonths = allMonths.filter((month) => {
    const yearNum = parseInt(selectedYear);

    // Case A: If selected year is the startYear, remove months BEFORE startMonth
    if (yearNum === startYear && month.index < startMonth) {
      return false;
    }

    // Case B: If selected year is the currentYear, remove future months
    if (yearNum === currentYear && month.index > currentMonth) {
      return false;
    }

    return true;
  });

  // Render:
  // 1. Replace static years mapping with `availableYears`.
  // 2. Replace `allMonths` map inside the "More" popover with `selectableMonths`.
}
```
