import { describe, expect, it } from "vitest";
import { __testing } from "./router.js";

const { assertUniqueMacroSeries } = __testing;

describe("assertUniqueMacroSeries", () => {
  it("aynı seriye bağlı iki göstergeyi reddeder", () => {
    // Üretimde yaşanan hata: sekiz gösterge de ^TNX'e bağlanmıştı.
    expect(() =>
      assertUniqueMacroSeries({
        macro: {
          indicators: [
            { id: "us10y", source: "yahoo", symbol: "^TNX" },
            { id: "cbrt", source: "yahoo", symbol: "^TNX" },
          ],
        },
      })
    ).toThrow(/aynı seriye/);
  });

  it("farklı serileri kabul eder", () => {
    expect(() =>
      assertUniqueMacroSeries({
        macro: {
          indicators: [
            { id: "us10y", source: "yahoo", symbol: "^TNX" },
            { id: "dxy", source: "yahoo", symbol: "DX-Y.NYB" },
            { id: "fed", source: "nyfed", symbol: "effr-target" },
          ],
        },
      })
    ).not.toThrow();
  });

  it("elle girilen göstergeleri kapsam dışı bırakır", () => {
    expect(() =>
      assertUniqueMacroSeries({
        macro: {
          indicators: [
            { id: "cds", source: "manual" },
            { id: "cpiTr", source: "manual" },
          ],
        },
      })
    ).not.toThrow();
  });

  it("aynı sembol farklı kaynaklardaysa çakışma saymaz", () => {
    expect(() =>
      assertUniqueMacroSeries({
        macro: {
          indicators: [
            { id: "a", source: "fred", symbol: "DGS10" },
            { id: "b", source: "evds", symbol: "DGS10" },
          ],
        },
      })
    ).not.toThrow();
  });
});
