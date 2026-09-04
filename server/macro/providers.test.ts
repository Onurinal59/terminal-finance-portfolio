import { describe, expect, it } from "vitest";
import { MacroProviderError, parseEcb, parseEvds, parseFred, parseNyFed } from "./providers.js";

/** Gerçek ECB Data Portal yanıtından kısaltılmış örnek (SDMX-JSON). */
const ECB_PAYLOAD = {
  dataSets: [
    {
      series: {
        "0:0:0:0:0:0:0": {
          observations: { "0": [2.0, 0, 0, null, null], "1": [2.25, 0, 0, null, null] },
        },
      },
    },
  ],
  structure: {
    dimensions: { observation: [{ values: [{ id: "2026-09-03" }, { id: "2026-09-04" }] }] },
  },
};

/** New York Fed referans faiz servisinin gerçek yanıtı. */
const NYFED_PAYLOAD = {
  refRates: [
    {
      effectiveDate: "2026-09-03",
      type: "EFFR",
      percentRate: 3.63,
      targetRateFrom: 3.5,
      targetRateTo: 3.75,
    },
  ],
};

describe("parseEcb", () => {
  it("son gözlemi ve bir öncekini çıkarır", () => {
    expect(parseEcb(ECB_PAYLOAD)).toEqual({
      kind: "value",
      value: 2.25,
      previous: 2.0,
      asOf: "2026-09-04",
    });
  });

  it("gözlem yoksa hata verir", () => {
    expect(() => parseEcb({ dataSets: [{ series: {} }] })).toThrow(MacroProviderError);
  });
});

describe("parseNyFed", () => {
  it("hedef aralığını iki uçlu okur", () => {
    expect(parseNyFed(NYFED_PAYLOAD, "effr-target")).toEqual({
      kind: "range",
      value: 3.5,
      high: 3.75,
      asOf: "2026-09-03",
    });
  });

  it("gerçekleşen faizi tek değer olarak okur", () => {
    expect(parseNyFed(NYFED_PAYLOAD, "effr")).toEqual({
      kind: "value",
      value: 3.63,
      asOf: "2026-09-03",
    });
  });

  it("boş yanıtta hata verir", () => {
    expect(() => parseNyFed({ refRates: [] }, "effr")).toThrow(MacroProviderError);
  });
});

describe("parseFred", () => {
  it("en yeni gözlemi alır ve eksik olanları atlar", () => {
    // FRED eksik gözlemleri "." ile döndürür; sıralama tersten gelir.
    const payload = {
      observations: [
        { date: "2026-09-01", value: "." },
        { date: "2026-08-01", value: "324.1" },
        { date: "2026-07-01", value: "323.4" },
      ],
    };
    expect(parseFred(payload)).toEqual({
      kind: "value",
      value: 324.1,
      previous: 323.4,
      asOf: "2026-08-01",
    });
  });

  it("kullanılabilir gözlem yoksa hata verir", () => {
    expect(() => parseFred({ observations: [{ date: "2026-09-01", value: "." }] })).toThrow(MacroProviderError);
  });
});

describe("parseEvds", () => {
  it("nokta içeren seri kodunu alan adına çevirir", () => {
    const payload = {
      items: [
        { Tarih: "01-08-2026", TP_APIFON4: "40.00" },
        { Tarih: "01-09-2026", TP_APIFON4: "37.00" },
      ],
    };
    expect(parseEvds(payload, "TP.APIFON4")).toEqual({
      kind: "value",
      value: 37,
      previous: 40,
      asOf: "01-09-2026",
    });
  });

  it("virgüllü ondalıkları da okur", () => {
    const payload = { items: [{ Tarih: "01-09-2026", TP_FG_J0: "31,51" }] };
    expect(parseEvds(payload, "TP.FG.J0").value).toBe(31.51);
  });

  it("seri boşsa kodu içeren bir hata verir", () => {
    expect(() => parseEvds({ items: [] }, "TP.YOK")).toThrow(/TP\.YOK/);
  });
});
