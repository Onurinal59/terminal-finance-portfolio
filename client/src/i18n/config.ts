/** Site geneli dil altyapısı: desteklenen diller, kalıcı depolama ve sayı/tarih yerelleri. */
export const LANGUAGES = ["tr", "en"] as const;
export type Language = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = "analiz-terminal-language-v1";
export const DEFAULT_LANGUAGE: Language = "tr";

export const NUMBER_LOCALES: Record<Language, string> = { tr: "tr-TR", en: "en-US" };

export const LANGUAGE_LABELS: Record<Language, { short: string; full: string }> = {
  tr: { short: "TR", full: "Türkçe" },
  en: { short: "EN", full: "English" },
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

export function detectLanguage(): Language {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  try {
    const fromQuery = new URLSearchParams(window.location.search).get("lang");
    if (isLanguage(fromQuery)) return fromQuery;
  } catch {
    // URL okunamadı
  }

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // localStorage kullanılamıyor
  }

  const navigatorLanguage = typeof navigator !== "undefined" ? navigator.language : "";
  return navigatorLanguage.toLowerCase().startsWith("tr") ? "tr" : "en";
}

/**
 * Modül seviyesindeki biçimlendirme yardımcıları (formatPrice, saat vb.) React ağacının
 * dışında da çalıştığı için aktif yerel burada tutulur; provider her render'da günceller.
 */
let activeLocale = NUMBER_LOCALES[DEFAULT_LANGUAGE];
let activeLanguage: Language = DEFAULT_LANGUAGE;

export function setActiveLanguage(language: Language) {
  activeLanguage = language;
  activeLocale = NUMBER_LOCALES[language];
}

export function getActiveLocale() {
  return activeLocale;
}

export function getActiveLanguage() {
  return activeLanguage;
}
