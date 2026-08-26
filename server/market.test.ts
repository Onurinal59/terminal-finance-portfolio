import { describe, expect, it } from "vitest";
import { calculatePearsonCorrelation, canonicalSymbol, parseChart, parseFinancialStatements, resolveWithStaleCache, timeframes } from "./market";

describe("market data mapping", () => {
  it("normalizes symbols and exposes expected timeframe controls", () => {
    expect(canonicalSymbol(" thyao.is ")).toBe("THYAO.IS");
    expect(timeframes["1G"]).toEqual({ range: "1d", interval: "5m" });
    expect(timeframes["1Y"]).toEqual({ range: "1y", interval: "1d" });
  });

  it("maps provider chart output into an auditable quote and OHLC points", () => {
    const result = parseChart("TEST", {
      chart: { result: [{ meta: { shortName: "Test Equity", exchangeName: "NMS", currency: "USD", regularMarketPreviousClose: 100, regularMarketTime: 1_700_000_000, marketState: "REGULAR" }, timestamp: [1_700_000_000, 1_700_003_600], indicators: { quote: [{ open: [99, 100], high: [101, 103], low: [98, 99], close: [100, 102], volume: [200, 300] }] } }] },
    });
    expect(result.quote.price).toBe(102);
    expect(result.quote.change).toBe(2);
    expect(result.quote.changePercent).toBe(2);
    expect(result.points).toHaveLength(2);
    expect(result.points[1]).toMatchObject({ close: 102, volume: 300 });
  });

  it("keeps the last known provider result available during a transient fetch failure", async () => {
    const cached = { value: { price: 102 }, expiresAt: 0 };
    await expect(resolveWithStaleCache(cached, async () => { throw new Error("network unavailable"); })).resolves.toEqual({ price: 102 });
    await expect(resolveWithStaleCache(undefined, async () => { throw new Error("network unavailable"); })).rejects.toThrow("network unavailable");
  });

  it("calculates bounded Pearson correlations from aligned daily returns", () => {
    expect(calculatePearsonCorrelation([0.01, 0.02, -0.01, 0.03], [0.02, 0.04, -0.02, 0.06])).toBeCloseTo(1, 8);
    expect(calculatePearsonCorrelation([0.01, 0.02], [0.02, 0.04])).toBeNull();
    expect(calculatePearsonCorrelation([0.01, 0.01, 0.01], [0.02, 0.03, 0.04])).toBeNull();
  });

  it("maps annual financial rows by fiscal period and disables chart comparisons across currencies", () => {
    const result = parseFinancialStatements("test", "income", {
      timeseries: { result: [
        { annualTotalRevenue: [
          { asOfDate: "2023-12-31", currencyCode: "USD", reportedValue: { raw: 100, fmt: "100" } },
          { asOfDate: "2024-12-31", currencyCode: "TRY", reportedValue: { raw: 120, fmt: "120" } },
        ] },
        { annualNetIncome: [
          { asOfDate: "2023-12-31", currencyCode: "USD", reportedValue: { raw: 20, fmt: "20" } },
          { asOfDate: "2024-12-31", currencyCode: "TRY", reportedValue: { raw: 24, fmt: "24" } },
        ] },
      ] },
    });
    expect(result.symbol).toBe("TEST");
    expect(result.periods).toEqual([{ asOfDate: "2023-12-31", currency: "USD" }, { asOfDate: "2024-12-31", currency: "TRY" }]);
    expect(result.rows.find((row) => row.key === "revenue")?.values[1]?.raw).toBe(120);
    expect(result.chartAvailable).toBe(false);
  });
});
