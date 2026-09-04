/**
 * Sözlük düzenleyici: sitedeki her metin buradan değiştirilebilir.
 *
 * Yapılandırılmış sekmelerin (rapor, makro, uyarı) kapsamadığı ne varsa —
 * profil özeti, buton yazıları, başlıklar, GPA değeri — bu tablodan düzenlenir.
 */
import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import type { LocalizedText } from "@shared/siteContent";
import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";
import type { TranslationKey } from "@/i18n";
import { Section } from "./fields";

const ALL_KEYS = Object.keys(tr) as TranslationKey[];

/** Anahtarın noktadan önceki kısmı, kaba bir bölüm filtresi olarak yeter. */
const GROUPS = Array.from(new Set(ALL_KEYS.map((key) => key.split(".")[0]))).sort();

const GROUP_LABELS: Record<string, string> = {
  meta: "Sayfa başlığı & açıklama",
  common: "Ortak butonlar",
  chrome: "Üst bar",
  nav: "Navigasyon",
  profile: "Profil kartı",
  profileView: "Tam profil",
  research: "Rapor kütüphanesi",
  macro: "Makro panel",
  hours: "Seans paneli",
  contact: "İletişim",
  panels: "Panel başlıkları",
  watch: "İzleme listesi",
  chart: "Grafik",
  fin: "Mali tablo satırları",
  valuation: "Değerleme masası",
  archive: "Arşiv",
  quick: "Kısa yollar",
  cv: "CV indirme",
  footer: "Alt bilgi",
};

export function TextsPanel({
  overrides,
  onChange,
}: {
  overrides: Record<string, LocalizedText>;
  onChange: (next: Record<string, LocalizedText>) => void;
}) {
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("all");
  const [onlyChanged, setOnlyChanged] = useState(false);

  const valueOf = (key: TranslationKey): LocalizedText =>
    overrides[key] ?? { tr: tr[key], en: en[key] };

  const isChanged = (key: TranslationKey) => {
    const value = overrides[key];
    if (!value) return false;
    return value.tr !== tr[key] || value.en !== en[key];
  };

  const visibleKeys = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("tr");
    return ALL_KEYS.filter((key) => {
      if (group !== "all" && !key.startsWith(`${group}.`)) return false;
      if (onlyChanged && !isChanged(key)) return false;
      if (!needle) return true;
      const haystack = `${key} ${tr[key]} ${en[key]}`.toLocaleLowerCase("tr");
      return haystack.includes(needle);
    });
    // isChanged, overrides üzerinden okur; bağımlılığı overrides ile veriliyor.
  }, [search, group, onlyChanged, overrides]);

  const setValue = (key: TranslationKey, next: LocalizedText) => {
    onChange({ ...overrides, [key]: next });
  };

  const resetKey = (key: TranslationKey) => {
    const next = { ...overrides };
    delete next[key];
    onChange(next);
  };

  const changedCount = ALL_KEYS.filter(isChanged).length;

  return (
    <Section
      title="Site metinleri"
      description="Sitedeki her yazı burada. Değiştirmediklerin koddaki hâliyle kalır."
      actions={
        changedCount > 0 ? (
          <button
            type="button"
            className="adm-btn ghost small"
            onClick={() => {
              if (window.confirm(`${changedCount} metin değişikliği geri alınsın mı?`)) onChange({});
            }}
          >
            <RotateCcw size={13} /> Tümünü sıfırla ({changedCount})
          </button>
        ) : undefined
      }
    >
      <div className="adm-text-filters">
        <div className="adm-search">
          <Search size={14} />
          <input
            className="adm-input"
            value={search}
            placeholder="Anahtar veya metin ara (örn. GPA, hedef, profil)…"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select className="adm-input" value={group} onChange={(event) => setGroup(event.target.value)}>
          <option value="all">Tüm bölümler</option>
          {GROUPS.map((name) => (
            <option key={name} value={name}>
              {GROUP_LABELS[name] ?? name}
            </option>
          ))}
        </select>
        <label className="adm-check">
          <input type="checkbox" checked={onlyChanged} onChange={(event) => setOnlyChanged(event.target.checked)} />
          Sadece değiştirilenler
        </label>
      </div>

      <p className="adm-count">
        {visibleKeys.length} metin gösteriliyor · {changedCount} tanesi değiştirilmiş
      </p>

      <div className="adm-text-rows">
        {visibleKeys.map((key) => {
          const value = valueOf(key);
          const changed = isChanged(key);
          return (
            <div key={key} className={`adm-text-row ${changed ? "is-changed" : ""}`}>
              <div className="adm-text-key">
                <code>{key}</code>
                {changed && (
                  <button type="button" className="adm-icon-btn" onClick={() => resetKey(key)} title="Varsayılana dön">
                    <RotateCcw size={13} />
                  </button>
                )}
              </div>
              <div className="adm-text-inputs">
                <label>
                  <span className="adm-lang-tag">TR</span>
                  <textarea
                    className="adm-input adm-textarea"
                    rows={2}
                    value={value.tr}
                    onChange={(event) => setValue(key, { ...value, tr: event.target.value })}
                  />
                </label>
                <label>
                  <span className="adm-lang-tag">EN</span>
                  <textarea
                    className="adm-input adm-textarea"
                    rows={2}
                    value={value.en}
                    onChange={(event) => setValue(key, { ...value, en: event.target.value })}
                  />
                </label>
              </div>
            </div>
          );
        })}
        {visibleKeys.length === 0 && <p className="adm-empty">Aramaya uyan metin yok.</p>}
      </div>
    </Section>
  );
}
