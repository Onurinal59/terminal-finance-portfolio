import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  NUMBER_LOCALES,
  detectLanguage,
  setActiveLanguage,
  type Language,
} from "./config";
import { getTranslationOverride } from "./overrides";
import { tr, type TranslationKey } from "./tr";
import { en } from "./en";

const dictionaries: Record<Language, Record<TranslationKey, string>> = { tr, en };

export type TranslateVars = Record<string, string | number>;
export type Translate = (key: TranslationKey, vars?: TranslateVars) => string;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  locale: string;
  t: Translate;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function interpolate(template: string, vars?: TranslateVars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}

/**
 * `overridesRevision`, yönetim panelinden gelen metinler değiştiğinde artan bir
 * sayaçtır; `t` bu değere bağlı olduğu için içerik yüklenince ağaç tazelenir.
 */
export function LanguageProvider({
  children,
  overridesRevision = 0,
}: {
  children: React.ReactNode;
  overridesRevision?: number;
}) {
  const [language, setLanguageState] = useState<Language>(() => detectLanguage());

  // Modül seviyesindeki biçimlendiriciler React ağacının dışında da okunduğu için
  // aktif dili render sırasında senkron tutuyoruz.
  setActiveLanguage(language);

  useEffect(() => {
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // localStorage kullanılamıyor
    }
    document.documentElement.lang = language;
    document.title = getTranslationOverride(language, "meta.title") ?? dictionaries[language]["meta.title"];
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute(
        "content",
        getTranslationOverride(language, "meta.description") ?? dictionaries[language]["meta.description"]
      );
    }
  }, [language, overridesRevision]);

  const setLanguage = useCallback((next: Language) => {
    setActiveLanguage(next);
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((current) => {
      const next: Language = current === "tr" ? "en" : "tr";
      setActiveLanguage(next);
      return next;
    });
  }, []);

  const t = useCallback<Translate>(
    (key, vars) =>
      interpolate(
        getTranslationOverride(language, key) ??
          dictionaries[language][key] ??
          dictionaries[DEFAULT_LANGUAGE][key] ??
          key,
        vars
      ),
    [language, overridesRevision]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, toggleLanguage, locale: NUMBER_LOCALES[language], t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useI18n must be used within LanguageProvider");
  return context;
}
