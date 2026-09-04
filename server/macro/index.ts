/**
 * Makro göstergelerin canlı değerlerini çözer.
 *
 * Hangi göstergenin çekileceğini istemci değil, kayıtlı içerik belirler; böylece
 * dışarıdan rastgele bir adrese istek yaptırmak mümkün değil. Sonuçlar kaynak
 * hızına göre önbelleklenir: piyasa verisi dakikalık, politika faizi ve
 * enflasyon gibi yavaş seriler yarım saatlik.
 */
import { DEFAULT_MACRO_SERIES } from "../../shared/macroDefaults.js";
import type { MacroIndicatorContent } from "../../shared/siteContent.js";
import { readSiteContent } from "../admin/contentStore.js";
import { getQuotes } from "../market.js";
import {
  MacroProviderError,
  fetchEcb,
  fetchEvds,
  fetchFred,
  fetchNyFed,
  type MacroReading,
} from "./providers.js";

export type MacroLiveEntry = MacroReading & { ok: true };
export type MacroLiveFailure = { ok: false; error: string };
export type MacroLiveResult = Record<string, MacroLiveEntry | MacroLiveFailure>;

/** Piyasa verisi sık, makro seriler seyrek değişir. */
const TTL_MS: Record<string, number> = {
  yahoo: 60_000,
  ecb: 30 * 60_000,
  nyfed: 30 * 60_000,
  fred: 30 * 60_000,
  evds: 30 * 60_000,
};

type CacheEntry = { at: number; value: MacroLiveEntry | MacroLiveFailure };
const cache = new Map<string, CacheEntry>();

function cacheKey(source: string, seriesId: string) {
  return `${source}:${seriesId}`;
}

async function resolveOne(source: string, seriesId: string): Promise<MacroReading> {
  switch (source) {
    case "ecb":
      return fetchEcb(seriesId);
    case "nyfed":
      return fetchNyFed(seriesId);
    case "fred":
      return fetchFred(seriesId, process.env.FRED_API_KEY ?? "");
    case "evds":
      return fetchEvds(seriesId, process.env.EVDS_API_KEY ?? "");
    default:
      throw new MacroProviderError(`Bilinmeyen kaynak: ${source}`);
  }
}

/** Yahoo göstergeleri tek bir toplu istekte çözülür. */
async function resolveYahoo(symbols: string[]): Promise<Map<string, MacroReading>> {
  const readings = new Map<string, MacroReading>();
  if (!symbols.length) return readings;

  const quotes = await getQuotes(symbols);
  for (const quote of quotes) {
    readings.set(quote.symbol, {
      kind: "value",
      value: quote.price,
      previous: quote.previousClose,
      changePercent: quote.changePercent,
      asOf: quote.marketTime ? new Date(quote.marketTime).toISOString() : null,
    });
  }
  return readings;
}

export async function resolveMacroLive(indicators?: MacroIndicatorContent[]): Promise<MacroLiveResult> {
  const stored = indicators ?? (await readSiteContent()).macro?.indicators;
  // Hiç içerik kaydedilmemişse koddaki varsayılan seriler geçerlidir.
  const list =
    stored ??
    Object.entries(DEFAULT_MACRO_SERIES).map(([id, series]) => ({
      id,
      tone: "flat" as const,
      label: { tr: "", en: "" },
      value: { tr: "", en: "" },
      note: { tr: "", en: "" },
      ...series,
    }));
  const live = list.filter((item) => item.source !== "manual" && item.symbol);

  const result: MacroLiveResult = {};
  const now = Date.now();

  // Önbellekte tazesi olanları ayır, kalanları kaynağına göre grupla.
  const pending: MacroIndicatorContent[] = [];
  for (const item of live) {
    const key = cacheKey(item.source, item.symbol!);
    const cached = cache.get(key);
    const ttl = TTL_MS[item.source] ?? 60_000;
    if (cached && now - cached.at < ttl) {
      result[item.id] = cached.value;
    } else {
      pending.push(item);
    }
  }

  const yahooItems = pending.filter((item) => item.source === "yahoo");
  const otherItems = pending.filter((item) => item.source !== "yahoo");

  const [yahooReadings] = await Promise.all([
    resolveYahoo(yahooItems.map((item) => item.symbol!)).catch((error) => {
      console.error("[Macro] Yahoo toplu isteği başarısız:", error);
      return new Map<string, MacroReading>();
    }),
    Promise.all(
      otherItems.map(async (item) => {
        const key = cacheKey(item.source, item.symbol!);
        try {
          const reading = await resolveOne(item.source, item.symbol!);
          const entry: MacroLiveEntry = { ...reading, ok: true };
          cache.set(key, { at: now, value: entry });
          result[item.id] = entry;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Veri alınamadı";
          console.error(`[Macro] ${item.id} (${item.source}) çözülemedi:`, message);
          const entry: MacroLiveFailure = { ok: false, error: message };
          // Başarısızlığı da kısa süre önbellekle: her istekte yeniden denenmesin.
          cache.set(key, { at: now, value: entry });
          result[item.id] = entry;
        }
      })
    ),
  ]);

  for (const item of yahooItems) {
    const reading = yahooReadings.get(item.symbol!);
    const entry: MacroLiveEntry | MacroLiveFailure = reading
      ? { ...reading, ok: true }
      : { ok: false, error: `${item.symbol} için fiyat alınamadı` };
    cache.set(cacheKey(item.source, item.symbol!), { at: now, value: entry });
    result[item.id] = entry;
  }

  return result;
}

/** Panelde hangi sağlayıcının kullanılabilir olduğunu göstermek için. */
export function macroProviderStatus() {
  return {
    yahoo: true,
    ecb: true,
    nyfed: true,
    fred: Boolean(process.env.FRED_API_KEY),
    evds: Boolean(process.env.EVDS_API_KEY),
  };
}
