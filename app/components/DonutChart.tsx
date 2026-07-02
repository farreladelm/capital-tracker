"use client";

import { useMemo } from "react";

type DonutChartProps = {
  data: { name: string; amount: number; color: string }[];
  currency: string;
};

export function DonutChart({ data }: Omit<DonutChartProps, "currency"> & { currency?: string }) {
  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.amount, 0), [data]);

  const conicGradientStr = useMemo(() => {
    if (total === 0) return "";
    let angle = 0;
    return data.map((slice) => {
      const percentage = slice.amount / total;
      const endAngle = angle + (percentage * 100);
      const result = `${slice.color} ${angle}% ${endAngle}%`;
      angle = endAngle;
      return result;
    }).join(', ');
  }, [data, total]);

  if (total === 0) {
    return (
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full shadow-sm" style={{ background: 'conic-gradient(var(--color-surface-container-lowest) 0% 100%)' }}>
        <div className="absolute inset-4 bg-surface-container-lowest rounded-full flex items-center justify-center">
          <span className="font-label text-sm text-on-surface-variant">No Expenses</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Modern Pie Chart (Themed) */}
      <div className="relative w-48 h-48 rounded-full mb-8 shadow-sm transition-all" style={{ background: `conic-gradient(${conicGradientStr})` }}>
        <div className="absolute inset-4 bg-surface-container-lowest rounded-full flex items-center justify-center flex-col p-4 text-center">
          <span className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase mb-1">Top Spend</span>
          <span className="font-headline text-base font-bold truncate w-full" style={{ color: data[0].color }}>
            {data[0].name}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-1 gap-3">
        {data.slice(0, 5).map((slice) => (
          <div key={slice.name} className="flex items-center justify-between">
            <div className="flex items-center flex-1 min-w-0 pr-2">
              <div className="w-3 h-3 rounded-full mr-3 shrink-0" style={{ backgroundColor: slice.color }}></div>
              <span className="font-body text-sm text-on-surface truncate">{slice.name}</span>
            </div>
            <span className="font-label text-xs font-bold text-on-surface-variant shrink-0">
              {Math.round((slice.amount / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
