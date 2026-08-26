/**
 * Yahoo Finance genel veri yüzeyi için sunucu tarafı araştırma aracısı.
 * İstemci CORS kısıtını aşar; fiyatlar sağlayıcı zaman damgasıyla açıkça etiketlenir.
 */
export type MarketQuote = {
  symbol: string;
  shortName: string;
  exchange: string;
  currency: string;
  price: number;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  marketState: string;
  marketTime: number | null;
};

export type ChartPoint = { time: number; close: number | null; high: number | null; low: number | null; open: number | null; volume: number | null };

type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: Record<string, unknown>;
      timestamp?: number[];
      indicators?: { quote?: Array<{ close?: Array<number | null>; high?: Array<number | null>; low?: Array<number | null>; open?: Array<number | null>; volume?: Array<number | null> }> };
    }>;
  };
};

type Cached<T> = { expiresAt: number; value: T };
const quoteCache = new Map<string, Cached<MarketQuote>>();
const chartCache = new Map<string, Cached<{ quote: MarketQuote; points: ChartPoint[] }>>();
const CACHE_MS = 45_000;
const YAHOO_ORIGINS = ["https://query1.finance.yahoo.com", "https://query2.finance.yahoo.com"];

export const timeframes = {
  "1G": { range: "1d", interval: "5m" },
  "5G": { range: "5d", interval: "30m" },
  "1A": { range: "1mo", interval: "1h" },
  "3A": { range: "3mo", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
} as const;

export type Timeframe = keyof typeof timeframes;

export function canonicalSymbol(symbol: string) {
  return symbol.trim().toUpperCase().replace(/\s+/g, "");
}

function numberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function parseChart(symbol: string, payload: YahooChart): { quote: MarketQuote; points: ChartPoint[] } {
  const result = payload.chart?.result?.[0];
  if (!result?.meta) throw new Error(`${symbol} için sağlayıcı verisi bulunamadı.`);
  const meta = result.meta;
  const quoteData = result.indicators?.quote?.[0] ?? {};
  const timestamps = result.timestamp ?? [];
  const points = timestamps.map((time, index) => ({
    time: time * 1000,
    close: numberOrNull(quoteData.close?.[index]),
    high: numberOrNull(quoteData.high?.[index]),
    low: numberOrNull(quoteData.low?.[index]),
    open: numberOrNull(quoteData.open?.[index]),
    volume: numberOrNull(quoteData.volume?.[index]),
  }));
  const lastClose = [...points].reverse().find((point) => point.close !== null)?.close ?? numberOrNull(meta.regularMarketPrice);
  if (lastClose === null) throw new Error(`${symbol} için son fiyat alınamadı.`);
  const previousClose = numberOrNull(meta.regularMarketPreviousClose) ?? numberOrNull(meta.chartPreviousClose);
  const change = previousClose === null ? null : lastClose - previousClose;
  const changePercent = previousClose !== null && previousClose !== 0 && change !== null ? (change / previousClose) * 100 : null;
  return {
    quote: {
      symbol: canonicalSymbol(symbol),
      shortName: typeof meta.shortName === "string" ? meta.shortName : canonicalSymbol(symbol),
      exchange: typeof meta.exchangeName === "string" ? meta.exchangeName : "Yahoo Finance",
      currency: typeof meta.currency === "string" ? meta.currency : "",
      price: lastClose,
      previousClose,
      change,
      changePercent,
      marketState: typeof meta.marketState === "string" ? meta.marketState : "UNKNOWN",
      marketTime: numberOrNull(meta.regularMarketTime) ? Number(meta.regularMarketTime) * 1000 : null,
    },
    points,
  };
}

async function yahooFetch(path: string) {
  let failure: unknown;
  for (const origin of YAHOO_ORIGINS) {
    try {
      const response = await fetch(`${origin}${path}`, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AnalizPortfolio/1.0)" },
        signal: AbortSignal.timeout(7_500),
      });
      if (!response.ok) throw new Error(`Veri sağlayıcısı ${response.status} yanıtı verdi.`);
      return response.json();
    } catch (error) {
      failure = error;
    }
  }
  throw new Error("Piyasa sağlayıcısı geçici olarak yanıt vermiyor.", { cause: failure });
}

export async function resolveWithStaleCache<T>(cached: { value: T } | undefined, load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (cached) return cached.value;
    throw error;
  }
}

export async function getChart(symbolInput: string, timeframe: Timeframe) {
  const symbol = canonicalSymbol(symbolInput);
  const { range, interval } = timeframes[timeframe];
  const cacheKey = `${symbol}:${timeframe}`;
  const cached = chartCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  return resolveWithStaleCache(cached, async () => {
    const payload = await yahooFetch(`/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`);
    const value = parseChart(symbol, payload as YahooChart);
    chartCache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_MS });
    quoteCache.set(symbol, { value: value.quote, expiresAt: Date.now() + CACHE_MS });
    return value;
  });
}

export async function getQuotes(symbols: string[]) {
  const unique = Array.from(new Set(symbols.map(canonicalSymbol))).slice(0, 36);
  const results = await Promise.allSettled(unique.map(async (symbol) => {
    const cached = quoteCache.get(symbol);
    if (cached && cached.expiresAt > Date.now()) return cached.value;
    return (await getChart(symbol, "1G")).quote;
  }));
  return results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
}

export async function searchSymbols(query: string) {
  const input = query.trim();
  if (input.length < 2) return [];
  const payload = await yahooFetch(`/v1/finance/search?q=${encodeURIComponent(input)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false`);
  const quotes = (payload as { quotes?: Array<Record<string, unknown>> }).quotes ?? [];
  const mapped = quotes
    .filter((quote) => typeof quote.symbol === "string" && ["EQUITY", "ETF", "INDEX", "MUTUALFUND", "CRYPTOCURRENCY", "CURRENCY"].includes(String(quote.quoteType)))
    .map((quote) => ({
      symbol: canonicalSymbol(String(quote.symbol)),
      name: typeof quote.longname === "string" ? quote.longname : typeof quote.shortname === "string" ? quote.shortname : String(quote.symbol),
      exchange: typeof quote.exchange === "string" ? quote.exchange : "",
      type: String(quote.quoteType),
    }));
  if (mapped.length > 0) return mapped;
  const normalized = canonicalSymbol(input);
  if (!/^[A-Z0-9.-]{2,12}$/.test(normalized)) return [];
  const candidates = Array.from(new Set([normalized.endsWith(".IS") ? normalized : `${normalized}.IS`, normalized]));
  const directResults = await Promise.allSettled(candidates.map((symbol) => getChart(symbol, "1G")));
  return directResults.flatMap((result) => result.status === "fulfilled" ? [{
    symbol: result.value.quote.symbol,
    name: result.value.quote.shortName,
    exchange: result.value.quote.exchange,
    type: "EQUITY",
  }] : []);
}
