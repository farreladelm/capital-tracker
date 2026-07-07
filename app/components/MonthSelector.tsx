"use client";

import { useState } from "react";
import { Pill } from "./Pill";

type MonthSelectorProps = {
  selectedMonth: string;
  onMonthChange: (monthId: string) => void;
  selectedYear: string;
  onYearChange: (yearId: string) => void;
  activeMonthsByYear?: Record<string, string[]>;
};

export function MonthSelector({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  activeMonthsByYear,
}: MonthSelectorProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isYearOpen, setIsYearOpen] = useState(false);

  const allMonths = [
    { id: "jan", name: "January" },
    { id: "feb", name: "February" },
    { id: "mar", name: "March" },
    { id: "apr", name: "April" },
    { id: "may", name: "May" },
    { id: "june", name: "June" },
    { id: "july", name: "July" },
    { id: "aug", name: "August" },
    { id: "sept", name: "September" },
    { id: "oct", name: "October" },
    { id: "nov", name: "November" },
    { id: "dec", name: "December" },
  ];

  // Resolve available years based on active transactions
  const years = activeMonthsByYear
    ? Object.keys(activeMonthsByYear).sort((a, b) => b.localeCompare(a))
    : [selectedYear];

  // Resolve active months for the selected year
  const activeMonthsInYear =
    activeMonthsByYear && activeMonthsByYear[selectedYear]
      ? activeMonthsByYear[selectedYear]
      : allMonths.map((m) => m.id); // fallback to all months

  // Filter allMonths to only selectable ones
  const selectableMonths = allMonths.filter((m) => activeMonthsInYear.includes(m.id));

  // Determine which pills to render
  const maxPills = 3;
  const selectablesList = selectableMonths.map((m) => m.id);
  const showMore = selectablesList.length > maxPills;

  let pills = selectablesList;
  if (showMore) {
    const lastPills = selectablesList.slice(-maxPills);
    if (lastPills.includes(selectedMonth)) {
      pills = lastPills;
    } else {
      pills = [selectedMonth, ...lastPills.slice(1)];
      pills.sort((a, b) => selectablesList.indexOf(a) - selectablesList.indexOf(b));
    }
  }

  return (
    <div className="flex items-start gap-2 relative">
      {/* Scrollable Pills list */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {pills.map((pId) => {
          const monthInfo = allMonths.find((m) => m.id === pId);
          if (!monthInfo) return null;
          return (
            <Pill
              key={pId}
              active={selectedMonth === pId}
              onClick={() => onMonthChange(pId)}
            >
              {monthInfo.name}
            </Pill>
          );
        })}
      </div>

      {/* More Trigger Pill */}
      {showMore && (
        <div className="relative">
          <Pill
            active={!pills.includes(selectedMonth)}
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="px-3 gap-0.5"
          >
            More
            <span className="material-symbols-outlined text-[16px] leading-none font-bold">
              keyboard_arrow_down
            </span>
          </Pill>

          {/* Glassmorphic Dropdown popover list of all months */}
          {isMoreOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMoreOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-xl border border-surface-variant/50 rounded-xl shadow-lg z-50 py-1.5 px-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <span className="block px-3 py-1 text-[9px] uppercase tracking-wider text-on-surface-variant/60 font-bold mb-1">
                  Select Month
                </span>
                {selectableMonths.map((month) => (
                  <button
                    key={month.id}
                    onClick={() => {
                      onMonthChange(month.id);
                      setIsMoreOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors active-press ${
                      selectedMonth === month.id
                        ? "bg-primary/10 text-primary dark:bg-primary-fixed/20 dark:text-primary-fixed font-bold"
                        : "text-secondary hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    {month.name}
                    {selectedMonth === month.id && (
                      <span className="material-symbols-outlined text-xs leading-none">check</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Year Selector Pill */}
      {years.length > 1 && (
        <div className="relative">
          <Pill
            active={selectedYear !== years[0]}
            onClick={() => setIsYearOpen(!isYearOpen)}
            className="px-3 gap-0.5"
          >
            {selectedYear}
            <span className="material-symbols-outlined text-[16px] leading-none font-bold">
              keyboard_arrow_down
            </span>
          </Pill>

          {/* Glassmorphic Dropdown popover list of all years */}
          {isYearOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsYearOpen(false)} />
              <div className="absolute right-0 mt-2 w-32 bg-surface-container-lowest/90 dark:bg-inverse-surface/90 backdrop-blur-xl border border-surface-variant/50 rounded-xl shadow-lg z-50 py-1.5 px-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                <span className="block px-3 py-1 text-[9px] uppercase tracking-wider text-on-surface-variant/60 font-bold mb-1">
                  Select Year
                </span>
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      onYearChange(year);
                      setIsYearOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-semibold text-left transition-colors active-press ${
                      selectedYear === year
                        ? "bg-primary/10 text-primary dark:bg-primary-fixed/20 dark:text-primary-fixed font-bold"
                        : "text-secondary hover:bg-surface-container hover:text-on-surface"
                    }`}
                  >
                    {year}
                    {selectedYear === year && (
                      <span className="material-symbols-outlined text-xs leading-none">check</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
