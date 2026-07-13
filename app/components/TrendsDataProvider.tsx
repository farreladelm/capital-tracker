"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";

type TrendsContextType = {
  selectedMonth: string;
  setSelectedMonth: (m: string) => void;
  selectedYear: string;
  setSelectedYear: (y: string) => void;
  trendsData: any;
  isLoading: boolean;
};

const TrendsDataContext = createContext<TrendsContextType | null>(null);

export function TrendsDataProvider({ children }: { children: React.ReactNode }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const months = ["jan", "feb", "mar", "apr", "may", "june", "july", "aug", "sept", "oct", "nov", "dec"];
    return months[new Date().getUTCMonth()];
  });
  const [selectedYear, setSelectedYear] = useState(() => new Date().getUTCFullYear().toString());
  const [isLoading, setIsLoading] = useState(true);
  const [trendsData, setTrendsData] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const trendsCacheRef = useRef<Record<string, any>>({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(min-width: 768px)");
    setIsDesktop(media.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isDesktop) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const cacheKey = `${selectedYear}-${selectedMonth}`;

    if (trendsCacheRef.current[cacheKey]) {
      setTrendsData(trendsCacheRef.current[cacheKey]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetch(`/api/trends?month=${selectedMonth}&year=${selectedYear}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch trends");
        return res.json();
      })
      .then((data) => {
        if (active) {
          trendsCacheRef.current[cacheKey] = data;
          setTrendsData(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedMonth, selectedYear, isDesktop]);

  return (
    <TrendsDataContext.Provider value={{ selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, trendsData, isLoading }}>
      {children}
    </TrendsDataContext.Provider>
  );
}

export function useTrendsData() {
  const ctx = useContext(TrendsDataContext);
  if (!ctx) throw new Error("useTrendsData must be used inside TrendsDataProvider");
  return ctx;
}
