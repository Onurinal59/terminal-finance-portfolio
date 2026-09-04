/** Dil bağımsız biçimlendirme yardımcıları: aktif yereli kullanır. */
import { getActiveLanguage, getActiveLocale } from "./config";
import { getTranslationOverride } from "./overrides";
import type { TranslationKey } from "./tr";
import { tr } from "./tr";
import { en } from "./en";

const dictionaries = { tr, en };

/** React ağacı dışından (modül seviyesi yardımcılar) çeviri okumak için. */
export function translate(key: TranslationKey): string {
  const language = getActiveLanguage();
  return getTranslationOverride(language, key) ?? dictionaries[language][key] ?? key;
}

export function formatNumber(value: number, options?: Intl.NumberFormatOptions) {
  return value.toLocaleString(getActiveLocale(), options);
}

export function formatDecimal(value: number, precision: number) {
  return value.toLocaleString(getActiveLocale(), {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat(getActiveLocale(), { notation: "compact" }).format(value);
}

export function formatDateTime(time: number) {
  return new Date(time).toLocaleString(getActiveLocale(), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatClock(date: Date = new Date()) {
  return date.toLocaleTimeString(getActiveLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Yüzde gösterimi: Türkçe "%12,4", İngilizce "12.4%". */
export function formatPercent(value: string | number) {
  const text = typeof value === "number" ? String(value) : value;
  return getActiveLanguage() === "tr" ? `%${text}` : `${text}%`;
}
