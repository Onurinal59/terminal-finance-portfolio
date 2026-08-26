import { describe, expect, it } from "vitest";
import { rememberRecentSymbol } from "./recentSymbols";

describe("recent symbols", () => {
  it("places the latest symbol first, removes duplicates, and respects the limit", () => {
    expect(rememberRecentSymbol(["THYAO", "ASELS", "AAPL"], "ASELS")).toEqual(["ASELS", "THYAO", "AAPL"]);
    expect(rememberRecentSymbol(["A", "B", "C"], "D", 3)).toEqual(["D", "A", "B"]);
  });
});
