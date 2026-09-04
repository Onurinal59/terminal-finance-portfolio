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
