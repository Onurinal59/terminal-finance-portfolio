import { Languages } from "lucide-react";
import { LANGUAGES, LANGUAGE_LABELS, useI18n } from "@/i18n";

/** Üst barda yer alan TR / EN dil değiştirici. */
export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="language-switcher" role="group" aria-label={t("chrome.languageAria")}>
      <Languages size={12} className="language-switcher-icon" aria-hidden="true" />
      {LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={language === code ? "language-option active" : "language-option"}
          onClick={() => setLanguage(code)}
          title={`${t("chrome.languageSwitch")}: ${LANGUAGE_LABELS[code].full}`}
          aria-pressed={language === code}
          lang={code}
        >
          {LANGUAGE_LABELS[code].short}
        </button>
      ))}
    </div>
  );
}
