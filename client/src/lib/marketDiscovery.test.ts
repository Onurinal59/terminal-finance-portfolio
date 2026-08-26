import { describe, expect, it } from "vitest";
import { excludeTransientDiscovery, normalizeDiscoverySymbol } from "./marketDiscovery";

describe("market discovery helpers", () => {
  it("normalizes Turkish Yahoo symbols for the temporary chart selection", () => {
    expect(normalizeDiscoverySymbol("THYAO.IS")).toBe("THYAO");
    expect(normalizeDiscoverySymbol(" aapl ")).toBe("aapl");
  });

  it("keeps a transient discovery symbol out of the fixed watchlist universe", () => {
    const rows = [{ symbol: "THYAO", kind: "HİSSE" }, { symbol: "ASML", kind: "KEŞİF" }];
    expect(excludeTransientDiscovery(rows)).toEqual([{ symbol: "THYAO", kind: "HİSSE" }]);
  });
});
