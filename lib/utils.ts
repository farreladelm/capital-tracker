import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric value into a localized currency string.
 * Supports compact notation for tight spaces (e.g., $1.5M or Rp1,5 jt).
 */
export function formatCurrency(
  value: number,
  currencyCode: string = "USD",
  options: { locale?: string; compact?: boolean } = {}
): string {
  const { locale = "en-US", compact = false } = options;

  const formatterOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currencyCode,
  };

  if (compact) {
    formatterOptions.notation = "compact";
    formatterOptions.compactDisplay = "short";
    formatterOptions.maximumFractionDigits = 1;
  } else {
    // IDR and JPY standard formatting usually has no decimal places.
    // For USD, we show decimals only if there's a fractional part.
    formatterOptions.minimumFractionDigits = value % 1 === 0 ? 0 : 2;
    formatterOptions.maximumFractionDigits = 2;
  }

  try {
    return new Intl.NumberFormat(locale, formatterOptions).format(value);
  } catch (error) {
    return `${currencyCode} ${value.toLocaleString()}`;
  }
}
