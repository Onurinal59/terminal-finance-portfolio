import { describe, expect, it } from "vitest";
import { isSameOrigin, withDownloadParam } from "./fileDownload";

const ORIGIN = "https://onurinal.vercel.app";
const BLOB = "https://9ghwyscpjjtiz3ld.public.blob.vercel-storage.com/cv/trPhoto-abc.pdf";

describe("isSameOrigin", () => {
  it("göreli adresleri aynı kaynak sayar", () => {
    expect(isSameOrigin("/cv/Onur_Inal_CV_TR.pdf", ORIGIN)).toBe(true);
  });

  it("aynı alan adındaki tam adresi aynı kaynak sayar", () => {
    expect(isSameOrigin(`${ORIGIN}/cv/x.pdf`, ORIGIN)).toBe(true);
  });

  it("Blob deposunu farklı kaynak sayar", () => {
    // Bozuk indirmenin kaynağı buydu: <a download> burada yok sayılıyor.
    expect(isSameOrigin(BLOB, ORIGIN)).toBe(false);
  });

  it("bozuk adreste kaynak eşleşmesi iddia etmez", () => {
    expect(isSameOrigin("javascript:void(0)", ORIGIN)).toBe(false);
  });
});

describe("withDownloadParam", () => {
  it("Blob adresine indirme parametresi ekler", () => {
    expect(withDownloadParam(BLOB)).toBe(`${BLOB}?download=1`);
  });

  it("mevcut sorgu dizesini korur", () => {
    expect(withDownloadParam(`${BLOB}?v=2`)).toBe(`${BLOB}?v=2&download=1`);
  });

  it("parametre zaten varsa iki kez eklemez", () => {
    expect(withDownloadParam(`${BLOB}?download=1`)).toBe(`${BLOB}?download=1`);
  });

  it("göreli adresi mutlak hâle getirmez", () => {
    expect(withDownloadParam("/cv/x.pdf")).toBe("/cv/x.pdf?download=1");
  });
});
