import { describe, expect, it } from "vitest";
import { canonicalSymbol, parseChart, timeframes } from "./market";

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
});
