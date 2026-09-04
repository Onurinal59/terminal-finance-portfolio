/**
 * Kurulumla gelen makro göstergelerin veri kaynakları.
 *
 * Etiketler ve elle girilen değerler istemci tarafındaki sözlükten gelir;
 * burada yalnızca "bu gösterge nereden çekilir" bilgisi durur. Sunucu ile
 * istemci aynı listeyi okuduğu için, kayıtlı içerik yokken ikisi de aynı
 * göstergeleri canlı sayar.
 */

export type MacroSeriesDefault = {
  source: "yahoo" | "ecb" | "nyfed" | "fred" | "evds";
  symbol: string;
  display: "percent" | "number";
  precision: number;
};

/**
 * Anahtarsız çalışan kaynaklar. Politika faizi (TCMB), Türkiye tahvil getirisi
 * ve enflasyon verileri için ücretsiz ama anahtar isteyen kaynaklar gerekiyor;
 * anahtar tanımlanana kadar o göstergeler elle güncellenir (bkz. dokümanlar).
 */
export const DEFAULT_MACRO_SERIES: Record<string, MacroSeriesDefault> = {
  // FOMC hedef aralığı — New York Fed referans faiz servisi, anahtar gerekmez.
  fed: { source: "nyfed", symbol: "effr-target", display: "percent", precision: 2 },
  // ECB mevduat faizi — ECB Data Portal, anahtar gerekmez.
  ecb: { source: "ecb", symbol: "FM.D.U2.EUR.4F.KR.DFR.LEV", display: "percent", precision: 2 },
  // ABD 10 yıllık tahvil getirisi ve dolar endeksi — Yahoo Finance.
  us10y: { source: "yahoo", symbol: "^TNX", display: "percent", precision: 2 },
  dxy: { source: "yahoo", symbol: "DX-Y.NYB", display: "number", precision: 2 },
};

/** Anahtar tanımlandığında bu göstergeler de canlıya çevrilebilir. */
export const MACRO_SERIES_SUGGESTIONS: Record<string, MacroSeriesDefault & { requiresKey: "FRED_API_KEY" | "EVDS_API_KEY" }> = {
  cpiUs: { source: "fred", symbol: "CPIAUCSL", display: "number", precision: 1, requiresKey: "FRED_API_KEY" },
  cbrt: { source: "evds", symbol: "TP.APIFON4", display: "percent", precision: 2, requiresKey: "EVDS_API_KEY" },
  cpiTr: { source: "evds", symbol: "TP.FG.J0", display: "number", precision: 2, requiresKey: "EVDS_API_KEY" },
};
