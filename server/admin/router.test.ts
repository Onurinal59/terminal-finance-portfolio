import { describe, expect, it } from "vitest";
import { __testing } from "./router.js";
import { ContentStoreError, RevisionConflictError } from "./contentStore.js";

const { assertUniqueMacroSeries, toTrpcError } = __testing;

describe("toTrpcError", () => {
  it("sürüm çakışmasını CONFLICT koduyla döndürür", () => {
    // Panel bu kodu görüp taslağını depodakiyle birleştiriyor; kod değişirse
    // otomatik toparlanma sessizce bozulur.
    const mapped = toTrpcError(new RevisionConflictError(10, 9)) as { code?: string };
    expect(mapped.code).toBe("CONFLICT");
  });

  it("diğer depo hatalarını CONFLICT saymaz", () => {
    const mapped = toTrpcError(new ContentStoreError("depo yok")) as { code?: string };
    expect(mapped.code).toBe("PRECONDITION_FAILED");
  });

  it("ilgisiz hataları olduğu gibi bırakır", () => {
    const original = new Error("başka bir şey");
    expect(toTrpcError(original)).toBe(original);
  });
});

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
