export function formatCurrency(amountMinor: number, currencyCode: string) {
  // amountMinor is stored in cents/minor units, so we divide by 100.
  const amount = amountMinor / 100;

  // Map currency to a standard locale so formatting is consistent (and avoids hydration mismatches)
  const locales: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    JPY: "ja-JP",
    IDR: "id-ID",
    AUD: "en-AU",
    CAD: "en-CA",
    INR: "en-IN",
    SGD: "en-SG"
  };

  const isZeroDecimal = ["JPY", "IDR"].includes(currencyCode);
  const minDigits = isZeroDecimal ? 0 : (amount % 1 === 0 ? 0 : 2);
  const maxDigits = isZeroDecimal ? 0 : 2;

  return new Intl.NumberFormat(locales[currencyCode] || "en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  }).format(amount);
}

export function getTransactionAmountConfig(amountMinor: number, currencyCode: string) {
  const isZeroDecimal = ["JPY", "IDR"].includes(currencyCode);
  const fractionDigits = isZeroDecimal ? 0 : 2;
  const amount = amountMinor / 100;
  return {
    defaultValue: amount.toFixed(fractionDigits),
    step: isZeroDecimal ? "1" : "0.01",
  };
}
