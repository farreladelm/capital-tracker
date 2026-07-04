"use client";

import { useState, useMemo, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

import { formatCurrency } from "@/lib/utils";

type DonutChartProps = {
  data: { name: string; amount: number; color: string }[];
  currencyCode?: string;
  locale?: string;
};

export function DonutChart({ data, currencyCode = "USD", locale = "en-US" }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showCenterText, setShowCenterText] = useState(false);

  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.amount, 0), [data]);

  useEffect(() => {
    // 400ms matches Pie's entrance animationDuration. We add 50ms buffer for timing.
    const timer = setTimeout(() => {
      setShowCenterText(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieClick = (_: any, index: number) => {
    setActiveIndex(index);
  };

  if (total === 0) {
    return (
      <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
        <span className="font-label text-sm text-on-surface-variant">No Expenses</span>
      </div>
    );
  }

  const activeItem = data[activeIndex] || data[0];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Chart Wrapper */}
      <div className="relative w-48 h-48 mb-8 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
              onMouseEnter={onPieEnter}
              onClick={onPieClick}
              animationDuration={400}
            >
              {data.map((slice, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={slice.color}
                  style={{
                    outline: "none",
                    cursor: "pointer",
                    transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                    transformOrigin: "96px 96px",
                    transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text (Absolute Positioned over SVG) */}
        <div className={`absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-300 ${
          showCenterText ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}>
          <span className="font-label text-[10px] text-on-surface-variant tracking-widest uppercase mb-0.5">
            {activeItem.name}
          </span>
          <span className="font-headline text-base font-bold truncate max-w-[120px] transition-all duration-200" style={{ color: activeItem.color }}>
            {formatCurrency(activeItem.amount, currencyCode, { locale, compact: true })}
          </span>
          <span className="font-label-sm text-[10px] text-secondary mt-0.5">
            {Math.round((activeItem.amount / total) * 100)}%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-1 gap-3">
        {data.map((slice, index) => (
          <button
            key={slice.name}
            onClick={() => setActiveIndex(index)}
            onMouseEnter={() => setActiveIndex(index)}
            className={`flex items-center justify-between w-full p-2 rounded-xl transition-all text-left active-press ${
              activeIndex === index 
                ? "bg-primary/5 shadow-sm scale-[1.02]" 
                : "hover:bg-surface-container-low"
            }`}
          >
            <div className="flex items-center flex-1 min-w-0 pr-2">
              <div 
                className="w-3 h-3 rounded-full mr-3 shrink-0 transition-transform duration-200" 
                style={{ 
                  backgroundColor: slice.color,
                  transform: activeIndex === index ? "scale(1.2)" : "scale(1)"
                }}
              ></div>
              <span className={`font-body text-sm truncate transition-colors duration-200 ${
                activeIndex === index ? "text-on-surface font-semibold" : "text-secondary"
              }`}>
                {slice.name}
              </span>
            </div>
            <span className={`font-label text-xs font-bold shrink-0 transition-colors duration-200 ${
              activeIndex === index ? "text-primary" : "text-on-surface-variant"
            }`}>
              {Math.round((slice.amount / total) * 100)}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
