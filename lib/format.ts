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

  return new Intl.NumberFormat(locales[currencyCode] || "en-US", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0, // Removes the .00 if the user doesn't want decimals
  }).format(amount);
}
