/**
 * Yönetim panelinden gelen metin değişiklikleri.
 *
 * Sözlük anahtarları kodda sabit; panel bunların üzerine yazan bir katman verir.
 * Modül seviyesinde tutuluyor ki React ağacı dışındaki biçimlendiriciler
 * (`translate()`) de aynı değeri görsün.
 */
import type { LocalizedText } from "@shared/siteContent";
import type { Language } from "./config";

let overrides: Record<string, LocalizedText> = {};
let revision = 0;

export function setTranslationOverrides(next: Record<string, LocalizedText> | undefined) {
  const value = next ?? {};
  // Aynı içerik tekrar gelirse sürümü artırmayalım; gereksiz render tetiklemesin.
  if (value === overrides) return revision;
  overrides = value;
  revision += 1;
  return revision;
}

export function getOverridesRevision() {
  return revision;
}

/** Bir anahtarın panelden gelen karşılığı; yoksa undefined. */
export function getTranslationOverride(language: Language, key: string): string | undefined {
  const entry = overrides[key];
  if (!entry) return undefined;
  const value = entry[language];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function getAllOverrides() {
  return overrides;
}
