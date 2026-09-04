import { describe, expect, it } from "vitest";
import { __testing } from "./contentStore.js";

const { upgradeLegacyMacro } = __testing;

describe("upgradeLegacyMacro", () => {
  it("source alanı hiç olmayan bilinen göstergeyi canlıya çevirir", () => {
    const result = upgradeLegacyMacro({
      macro: { indicators: [{ id: "us10y", tone: "flat" }, { id: "cbrt", tone: "flat" }] },
    }) as any;
    expect(result.macro.indicators[0]).toMatchObject({ source: "yahoo", symbol: "^TNX", precision: 2 });
    // Tanınmayan kimlik olduğu gibi kalır.
    expect(result.macro.indicators[1]).not.toHaveProperty("source");
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
