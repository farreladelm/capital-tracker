"use client";

import { useMemo } from "react";

import { formatCurrency } from "@/lib/format";

type DonutChartProps = {
  data: { name: string; amount: number; color: string }[];
  currency: string;
};

export function DonutChart({ data, currency }: DonutChartProps) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.amount, 0), [data]);

  let currentAngle = 0;
  
  if (total === 0) {
    return (
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-8 border-slate-100">
        <span className="text-sm font-medium text-slate-400">No Expenses</span>
      </div>
    );
  }

  return (
    <div className="relative flex h-56 w-56 items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 transform">
        {data.map((slice, i) => {
          const percentage = slice.amount / total;
          const strokeDasharray = `${percentage * 283} 283`; // 2 * PI * r (r=45 -> 282.7)
          const strokeDashoffset = -currentAngle * 283;
          currentAngle += percentage;

          return (
            <circle
              key={slice.name}
              cx="50"
              cy="50"
              r="45"
              fill="transparent"
              stroke={slice.color}
              strokeWidth="10"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          );
        })}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
        <span className="text-2xl font-bold text-slate-800">
          {formatCurrency(total, currency)}
        </span>
      </div>
    </div>
  );
}
