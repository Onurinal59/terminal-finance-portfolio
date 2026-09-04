/**
 * Makro gösterge sağlayıcıları.
 *
 * Her sağlayıcı bir dış API'den tek bir seriyi okur. Ayrıştırıcılar saf
 * fonksiyonlar olarak dışa açılır; testler gerçek yanıt örnekleriyle bunları
 * doğrular, ağ katmanı ince tutulur.
 *
 * Anahtar gerektirmeyenler: Yahoo Finance, ECB Data Portal, New York Fed.
 * Anahtar gerektirenler: FRED (FRED_API_KEY), TCMB EVDS (EVDS_API_KEY).
 */

export type MacroReading = {
  /** "range" yalnızca Fed hedef aralığı gibi iki uçlu değerlerde kullanılır. */
  kind: "value" | "range";
  value: number | null;
  high?: number | null;
  /** Bir önceki gözlem; yön ve değişim rozetini besler. */
  previous?: number | null;
  /** Verinin ait olduğu tarih (ISO veya sağlayıcının verdiği biçim). */
  asOf?: string | null;
  /** Yahoo gibi gün içi kaynaklarda günlük yüzde değişim. */
  changePercent?: number | null;
};

export class MacroProviderError extends Error {}

const USER_AGENT = "Mozilla/5.0 (compatible; onurinal-terminal/1.0)";

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: { "User-Agent": USER_AGENT, Accept: "application/json", ...(init?.headers ?? {}) },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new MacroProviderError(`${new URL(url).hostname} yanıtı ${response.status}`);
  }
  return response.json();
}

function toNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

/* ------------------------------------------------------------------ ECB */

/**
 * ECB Data Portal (anahtarsız). Seri anahtarı örn.
 * `FM.D.U2.EUR.4F.KR.DFR.LEV` (mevduat faizi), `ICP.M.U2.N.000000.4.ANR` (HICP).
 * Yanıt SDMX-JSON: gözlemler indeksle, tarihler ayrı bir boyut listesinde gelir.
 */
export function parseEcb(payload: unknown): MacroReading {
  const root = payload as {
    dataSets?: Array<{ series?: Record<string, { observations?: Record<string, unknown[]> }> }>;
    structure?: { dimensions?: { observation?: Array<{ values?: Array<{ id?: string }> }> } };
  };

  const series = Object.values(root.dataSets?.[0]?.series ?? {})[0];
  const observations = series?.observations ?? {};
  const periods = root.structure?.dimensions?.observation?.[0]?.values ?? [];

  const entries = Object.entries(observations)
    .map(([index, tuple]) => ({
      order: Number(index),
      period: periods[Number(index)]?.id ?? null,
      value: toNumber(Array.isArray(tuple) ? tuple[0] : null),
    }))
    .filter((entry) => entry.value !== null)
    .sort((a, b) => a.order - b.order);

  const latest = entries.at(-1);
  if (!latest) throw new MacroProviderError("ECB serisinde gözlem yok");

  return {
    kind: "value",
    value: latest.value,
    previous: entries.at(-2)?.value ?? null,
    asOf: latest.period,
  };
}

export async function fetchEcb(seriesKey: string): Promise<MacroReading> {
  const path = seriesKey.replace(".", "/");
  const url = `https://data-api.ecb.europa.eu/service/data/${path}?lastNObservations=2&format=jsondata`;
  return parseEcb(await getJson(url));
}

/* --------------------------------------------------------------- NY Fed */

/**
 * New York Fed referans faizleri (anahtarsız). `seriesId` iki biçimi seçer:
 * `effr` gerçekleşen faizi, `effr-target` FOMC hedef aralığını verir.
 */
export function parseNyFed(payload: unknown, seriesId: string): MacroReading {
  const rates = (payload as { refRates?: Array<Record<string, unknown>> }).refRates ?? [];
  const latest = rates[0];
  if (!latest) throw new MacroProviderError("NY Fed yanıtında oran yok");

  const asOf = typeof latest.effectiveDate === "string" ? latest.effectiveDate : null;

  if (seriesId.endsWith("-target")) {
    const low = toNumber(latest.targetRateFrom);
    const high = toNumber(latest.targetRateTo);
    if (low === null || high === null) throw new MacroProviderError("NY Fed hedef aralığı boş");
    return { kind: "range", value: low, high, asOf };
  }

  const value = toNumber(latest.percentRate);
  if (value === null) throw new MacroProviderError("NY Fed oranı okunamadı");
  return { kind: "value", value, asOf };
}

export async function fetchNyFed(seriesId: string): Promise<MacroReading> {
  const base = seriesId.replace(/-target$/, "") || "effr";
  const url = `https://markets.newyorkfed.org/api/rates/unsecured/${base}/last/1.json`;
  return parseNyFed(await getJson(url), seriesId);
}

/* ----------------------------------------------------------------- FRED */

/** St. Louis Fed FRED. Ücretsiz ama anahtar ister (FRED_API_KEY). */
export function parseFred(payload: unknown): MacroReading {
  const observations = (payload as { observations?: Array<{ date?: string; value?: string }> }).observations ?? [];
  // FRED eksik gözlemleri "." ile döndürür; onları eliyoruz.
  const usable = observations
    .map((observation) => ({ date: observation.date ?? null, value: toNumber(observation.value) }))
    .filter((observation) => observation.value !== null);

  const latest = usable[0];
  if (!latest) throw new MacroProviderError("FRED serisinde kullanılabilir gözlem yok");

  return { kind: "value", value: latest.value, previous: usable[1]?.value ?? null, asOf: latest.date };
}

export async function fetchFred(seriesId: string, apiKey: string): Promise<MacroReading> {
  if (!apiKey) throw new MacroProviderError("FRED_API_KEY tanımlı değil");
  const url =
    `https://api.stlouisfed.org/fred/series/observations?series_id=${encodeURIComponent(seriesId)}` +
    `&api_key=${encodeURIComponent(apiKey)}&file_type=json&sort_order=desc&limit=8`;
  return parseFred(await getJson(url));
}

/* ----------------------------------------------------------------- EVDS */

/** TCMB EVDS. Ücretsiz ama anahtar ister (EVDS_API_KEY). */
export function parseEvds(payload: unknown, seriesCode: string): MacroReading {
  const items = (payload as { items?: Array<Record<string, unknown>> }).items ?? [];
  // EVDS alan adında noktaları alt çizgiye çevirir: TP.APIFON4 → TP_APIFON4
  const field = seriesCode.replace(/\./g, "_");

  const usable = items
    .map((item) => ({ date: typeof item.Tarih === "string" ? item.Tarih : null, value: toNumber(item[field]) }))
    .filter((item) => item.value !== null);

  const latest = usable.at(-1);
  if (!latest) throw new MacroProviderError(`EVDS serisinde (${seriesCode}) gözlem yok`);

  return { kind: "value", value: latest.value, previous: usable.at(-2)?.value ?? null, asOf: latest.date };
}

export async function fetchEvds(seriesCode: string, apiKey: string): Promise<MacroReading> {
  if (!apiKey) throw new MacroProviderError("EVDS_API_KEY tanımlı değil");
  const format = (date: Date) =>
    `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  const end = new Date();
  const start = new Date(end.getTime() - 400 * 24 * 60 * 60 * 1000);

  const url =
    `https://evds2.tcmb.gov.tr/service/evds/series=${encodeURIComponent(seriesCode)}` +
    `&startDate=${format(start)}&endDate=${format(end)}&type=json`;

  return parseEvds(await getJson(url, { headers: { key: apiKey } }), seriesCode);
}
