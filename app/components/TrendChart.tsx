"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { formatCurrency } from "@/lib/utils";

type TrendChartProps = {
  data: { day: string; amount: number }[];
  currencyCode?: string;
  locale?: string;
};

export function TrendChart({ data, currencyCode = "USD", locale = "en-US" }: TrendChartProps) {
  // Custom tooltip to match the "Muted Iris" theme
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-inverse-surface dark:bg-surface-container-high px-3 py-2 rounded-lg shadow-lg">
          <p className="font-label-md font-bold text-inverse-on-surface dark:text-on-surface">
            {formatCurrency(payload[0].value, currencyCode, { locale })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4c4bc6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#4c4bc6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#e4e1ec"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#777585", fontSize: 12, fontFamily: "inherit" }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#777585", fontSize: 12, fontFamily: "inherit" }}
            tickFormatter={(value) => formatCurrency(value, currencyCode, { locale, compact: true })}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#c2c1ff', strokeWidth: 1, strokeDasharray: "4 4" }} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#4c4bc6"
            strokeWidth={3}
            dot={{ r: 4, fill: "#ffffff", stroke: "#4c4bc6", strokeWidth: 2 }}
            activeDot={{ r: 6, fill: "#ffffff", stroke: "#4c4bc6", strokeWidth: 2 }}
            fill="url(#colorAmount)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
