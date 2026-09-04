import { describe, expect, it } from "vitest";
import { tr } from "@/i18n/tr";
import { DECLARED_PREFIXES, TEXT_AREAS, keysForPrefix, undeclaredPrefixes } from "./textGroups";

describe("panel metin kapsamı", () => {
  it("sözlükteki her anahtar panelde bir gruba düşer", () => {
    // Bu test, siteye yeni bir metin eklenip panele bağlanmayı unutmayı yakalar.
    expect(undeclaredPrefixes()).toEqual([]);
  });

  it("her anahtar tam olarak bir gruba aittir", () => {
    const prefixes = TEXT_AREAS.flatMap((area) => area.groups.map((group) => group.prefix));
    expect(new Set(prefixes).size).toBe(prefixes.length);
  });

  it("tanımlı her grubun sözlükte karşılığı var", () => {
    // Sözlükten kaldırılmış bir öneki panelde boş bölüm olarak bırakmayalım.
    for (const prefix of DECLARED_PREFIXES) {
      expect(keysForPrefix(prefix).length, `${prefix} için anahtar yok`).toBeGreaterThan(0);
    }
  });

  it("gruplar sözlüğün tamamını kapsar", () => {
    const covered = new Set(Array.from(DECLARED_PREFIXES).flatMap((prefix) => keysForPrefix(prefix)));
    expect(covered.size).toBe(Object.keys(tr).length);
  });
});
