import { describe, it, expect } from "vitest";
import { getTransactionAmountConfig, formatCurrency } from "../../lib/format";

describe("getTransactionAmountConfig Unit Tests", () => {
  it("should return correct config for currencies with 2 fraction digits (e.g. USD)", () => {
    // 123.45 USD stored as 12345 minor units
    const config1 = getTransactionAmountConfig(12345, "USD");
    expect(config1).toEqual({
      defaultValue: "123.45",
      step: "0.01",
    });

    // 123 USD stored as 12300 minor units
    const config2 = getTransactionAmountConfig(12300, "USD");
    expect(config2).toEqual({
      defaultValue: "123.00",
      step: "0.01",
    });
  });

  it("should return correct config for currencies with 0 fraction digits (e.g. JPY, IDR)", () => {
    // 12345 JPY stored as 1234500 minor units
    const config1 = getTransactionAmountConfig(1234500, "JPY");
    expect(config1).toEqual({
      defaultValue: "12345",
      step: "1",
    });

    // 25000 IDR stored as 2500000 minor units
    const config2 = getTransactionAmountConfig(2500000, "IDR");
    expect(config2).toEqual({
      defaultValue: "25000",
      step: "1",
    });
  });

  it("should default to 2 fraction digits for unknown/other 2-decimal currencies (e.g. EUR, GBP)", () => {
    const configEur = getTransactionAmountConfig(5000, "EUR");
    expect(configEur).toEqual({
      defaultValue: "50.00",
      step: "0.01",
    });

    const configGbp = getTransactionAmountConfig(7520, "GBP");
    expect(configGbp).toEqual({
      defaultValue: "75.20",
      step: "0.01",
    });
  });
});

describe("formatCurrency Unit Tests", () => {
  it("should show decimals for USD only if there is a fractional part", () => {
    // USD 305 cents => $3.05 (with decimals)
    expect(formatCurrency(305, "USD")).toBe("$3.05");

    // USD 300 cents => $3 (no decimals)
    expect(formatCurrency(300, "USD")).toBe("$3");
  });

  it("should never show decimals for JPY or IDR", () => {
    // JPY 10000 cents => ￥100
    expect(formatCurrency(10000, "JPY")).toMatch(/[¥￥]100/);

    // IDR 2500000 cents => Rp 25.000 (standard formatting has Rp and dot separator, no decimals)
    const idrFormatted = formatCurrency(2500000, "IDR").replace(/\s/g, " ");
    expect(idrFormatted).toMatch(/Rp\s*25[.,]000/);
  });

  it("should show decimals for EUR/GBP when they have fraction digits", () => {
    const eurFormatted = formatCurrency(150, "EUR").replace(/\s/g, " ");
    expect(eurFormatted).toContain("1,50"); // de-DE uses comma for decimal

    const gbpFormatted = formatCurrency(7520, "GBP").replace(/\s/g, " ");
    expect(gbpFormatted).toBe("£75.20");
  });
});
