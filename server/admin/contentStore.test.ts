import { describe, expect, it } from "vitest";
import { __testing } from "./contentStore.js";

const { upgradeLegacyMacro } = __testing;

describe("upgradeLegacyMacro", () => {
  it("source alanı hiç olmayan bilinen göstergeleri kaynağına bağlar", () => {
    const result = upgradeLegacyMacro({
      macro: {
        indicators: [
          { id: "us10y", tone: "flat" },
          { id: "fed", tone: "flat" },
          { id: "ecb", tone: "flat" },
          { id: "cds", tone: "flat" },
        ],
      },
    }) as any;
    expect(result.macro.indicators[0]).toMatchObject({ source: "yahoo", symbol: "^TNX" });
    expect(result.macro.indicators[1]).toMatchObject({ source: "nyfed", symbol: "effr-target" });
    expect(result.macro.indicators[2]).toMatchObject({ source: "ecb" });
    // Ücretsiz bir kaynağı olmayan gösterge elle güncellenmeye devam eder.
    expect(result.macro.indicators[3]).not.toHaveProperty("source");
  });

  it("kullanıcı bilerek manuel seçtiyse dokunmaz", () => {
    const input = { macro: { indicators: [{ id: "us10y", source: "manual", tone: "flat" }] } };
    expect(upgradeLegacyMacro(input)).toBe(input);
  });

  it("makro bölümü olmayan belgeyi olduğu gibi döndürür", () => {
    const input = { revision: 2 };
    expect(upgradeLegacyMacro(input)).toBe(input);
  });
});

describe("aynı seriye bağlanmış göstergelerin onarımı", () => {
  it("hepsi ^TNX'e bağlanmış bozuk kaydı düzeltir", () => {
    // Üretimde yaşanan durum: sekiz göstergenin de kaynağı yahoo, sembolü ^TNX.
    const ids = ["cbrt", "fed", "ecb", "tr10y", "us10y", "cds", "cpiTr", "cpiUs"];
    const result = upgradeLegacyMacro({
      macro: { indicators: ids.map((id) => ({ id, source: "yahoo", symbol: "^TNX", tone: "flat" })) },
    }) as any;

    const byId = Object.fromEntries(result.macro.indicators.map((i: any) => [i.id, i]));
    expect(byId.fed).toMatchObject({ source: "nyfed", symbol: "effr-target" });
    expect(byId.ecb).toMatchObject({ source: "ecb" });
    expect(byId.us10y).toMatchObject({ source: "yahoo", symbol: "^TNX" });
    // Bilinen kaynağı olmayanlar elle girilen değerlerine döner.
    expect(byId.cds).toMatchObject({ source: "manual", symbol: undefined });
    expect(byId.cpiTr).toMatchObject({ source: "manual" });
  });

  it("her göstergenin kendi serisi varsa dokunmaz", () => {
    const input = {
      macro: {
        indicators: [
          { id: "us10y", source: "yahoo", symbol: "^TNX" },
          { id: "dxy", source: "yahoo", symbol: "DX-Y.NYB" },
        ],
      },
    };
    expect(upgradeLegacyMacro(input)).toBe(input);
  });
});
