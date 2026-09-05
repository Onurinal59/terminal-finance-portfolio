import { describe, expect, it } from "vitest";
import { buildWorkingDraft } from "./useDraft";
import { mergeDrafts } from "./mergeDraft";
import type { SiteContent } from "@shared/siteContent";

const EMPTY: SiteContent = { schemaVersion: 1, revision: 1, updatedAt: "" };
const WATCHLIST = ["THYAO.IS", "ASELS.IS"];

const draft = () => buildWorkingDraft(EMPTY, WATCHLIST);

describe("mergeDrafts", () => {
  it("hiçbir taraf değişmediyse çakışma üretmez", () => {
    const result = mergeDrafts(draft(), draft(), draft());
    expect(result.conflicts).toEqual([]);
    expect(result.adopted).toEqual([]);
  });

  it("yalnızca benim değiştirdiğim bölümü korur", () => {
    const base = draft();
    const mine = { ...draft(), links: { ...draft().links, linkedin: "https://benim/" } };
    const result = mergeDrafts(base, mine, draft());
    expect(result.conflicts).toEqual([]);
    expect(result.merged.links.linkedin).toBe("https://benim/");
  });

  it("yalnızca depoda değişen bölümü taslağa alır", () => {
    // Telefondan CV yüklenmiş, bilgisayardaki sekme bunu bilmiyor.
    const theirs = { ...draft(), cv: { trPhoto: { url: "https://depo/cv.pdf", fileName: "cv.pdf" } } };
    const result = mergeDrafts(draft(), draft(), theirs);
    expect(result.conflicts).toEqual([]);
    expect(result.adopted).toContain("CV dosyaları");
    expect(result.merged.cv.trPhoto?.url).toBe("https://depo/cv.pdf");
  });

  it("farklı bölümlerdeki değişiklikleri birlikte taşır", () => {
    const base = draft();
    const mine = { ...draft(), links: { ...draft().links, email: "yeni@ornek.com" } };
    const theirs = { ...draft(), watchlist: ["TUPRS.IS"] };
    const result = mergeDrafts(base, mine, theirs);
    expect(result.conflicts).toEqual([]);
    expect(result.merged.links.email).toBe("yeni@ornek.com");
    expect(result.merged.watchlist).toEqual(["TUPRS.IS"]);
  });

  it("aynı bölümü ikisi de farklı değiştirdiyse çakışma bildirir", () => {
    const base = draft();
    const mine = { ...draft(), links: { ...draft().links, email: "benim@ornek.com" } };
    const theirs = { ...draft(), links: { ...draft().links, email: "onun@ornek.com" } };
    const result = mergeDrafts(base, mine, theirs);
    expect(result.conflicts).toEqual(["Bağlantılar"]);
    // Çakışmada kullanıcının hâli korunur; karar ona bırakılır.
    expect(result.merged.links.email).toBe("benim@ornek.com");
  });

  it("metinleri anahtar bazında birleştirir", () => {
    const base = draft();
    const mine = { ...draft(), translations: { "profile.name": { tr: "Benim Ad", en: "My Name" } } };
    const theirs = { ...draft(), translations: { "profile.role": { tr: "Analist", en: "Analyst" } } };
    const result = mergeDrafts(base, mine, theirs);
    expect(result.conflicts).toEqual([]);
    expect(result.merged.translations["profile.name"].tr).toBe("Benim Ad");
    expect(result.merged.translations["profile.role"].tr).toBe("Analist");
  });

  it("aynı metin anahtarı iki yerde farklı yazıldıysa çakışma bildirir", () => {
    const base = draft();
    const mine = { ...draft(), translations: { "profile.name": { tr: "A", en: "A" } } };
    const theirs = { ...draft(), translations: { "profile.name": { tr: "B", en: "B" } } };
    const result = mergeDrafts(base, mine, theirs);
    expect(result.conflicts).toEqual(["Site metinleri"]);
    expect(result.merged.translations["profile.name"].tr).toBe("A");
  });
});
