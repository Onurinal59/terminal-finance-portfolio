/**
 * Sözlük düzenleyici: sitedeki her metin buradan değiştirilebilir.
 *
 * Anahtarlar ham önekleriyle değil, `textGroups.ts` haritasına göre sayfa ve
 * bölüm adlarıyla gruplanır. Harita sözlüğün tamamını kapsamak zorunda
 * (textGroups.test.ts bunu doğruluyor), yani düzenlenemeyen metin kalamaz.
 */
import { useMemo, useState } from "react";
import { ChevronDown, RotateCcw, Search } from "lucide-react";
import type { LocalizedText } from "@shared/siteContent";
import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";
import type { TranslationKey } from "@/i18n";
import { Section } from "./fields";
import { TEXT_AREAS, keysForPrefix } from "./textGroups";

export function TextsPanel({
  overrides,
  onChange,
}: {
  overrides: Record<string, LocalizedText>;
  onChange: (next: Record<string, LocalizedText>) => void;
}) {
  const [search, setSearch] = useState("");
  const [areaId, setAreaId] = useState("all");
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const isChanged = (key: string) => {
    const value = overrides[key];
    if (!value) return false;
    return value.tr !== tr[key as TranslationKey] || value.en !== en[key as TranslationKey];
  };

  const changedCount = Object.keys(tr).filter(isChanged).length;

  /** Arama ve filtreler uygulandıktan sonra gösterilecek bölümler. */
  const visibleAreas = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("tr");

    return TEXT_AREAS.filter((area) => areaId === "all" || area.id === areaId)
      .map((area) => ({
        ...area,
        groups: area.groups
          .map((group) => ({
            ...group,
            keys: keysForPrefix(group.prefix).filter((key) => {
              if (onlyChanged && !isChanged(key)) return false;
              if (!needle) return true;
              const haystack = `${key} ${tr[key as TranslationKey]} ${en[key as TranslationKey]}`;
              return haystack.toLocaleLowerCase("tr").includes(needle);
            }),
          }))
          .filter((group) => group.keys.length > 0),
      }))
      .filter((area) => area.groups.length > 0);
    // isChanged overrides üzerinden okuduğu için bağımlılığa overrides veriliyor.
  }, [search, areaId, onlyChanged, overrides]);

  const visibleCount = visibleAreas.reduce(
    (total, area) => total + area.groups.reduce((sum, group) => sum + group.keys.length, 0),
    0
  );

  const setValue = (key: string, next: LocalizedText) => onChange({ ...overrides, [key]: next });

  const resetKey = (key: string) => {
    const next = { ...overrides };
    delete next[key];
    onChange(next);
  };

  return (
    <Section
      title="Site metinleri"
      description="Sitedeki bütün yazılar, bulundukları sayfaya göre gruplandı. Değiştirmediklerin koddaki hâliyle kalır."
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
            placeholder="Metin veya anahtar ara (örn. GPA, hedef, iletişim)…"
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <select className="adm-input" value={areaId} onChange={(event) => setAreaId(event.target.value)}>
          <option value="all">Sitenin tamamı</option>
          {TEXT_AREAS.map((area) => (
            <option key={area.id} value={area.id}>
              {area.title}
            </option>
          ))}
        </select>
        <label className="adm-check">
          <input type="checkbox" checked={onlyChanged} onChange={(event) => setOnlyChanged(event.target.checked)} />
          Sadece değiştirilenler
        </label>
      </div>

      <p className="adm-count">
        {visibleCount} metin gösteriliyor · toplam {Object.keys(tr).length} · {changedCount} tanesi değiştirilmiş
      </p>

      {visibleAreas.map((area) => (
        <div key={area.id} className="adm-text-area">
          <h3 className="adm-text-area-title">{area.title}</h3>
          <p className="adm-text-area-desc">{area.description}</p>

          {area.groups.map((group) => {
            const groupId = `${area.id}:${group.prefix}`;
            // Arama yapılırken bölümler açık kalsın, aksi halde katlanabilir olsunlar.
            const isCollapsed = !search.trim() && collapsed[groupId];
            return (
              <div key={group.prefix} className="adm-text-group">
                <button
                  type="button"
                  className={`adm-text-group-head ${isCollapsed ? "is-collapsed" : ""}`}
                  onClick={() => setCollapsed((current) => ({ ...current, [groupId]: !current[groupId] }))}
                >
                  <ChevronDown size={14} />
                  <b>{group.title}</b>
                  <span>{group.keys.length}</span>
                  {group.keys.some(isChanged) && <em>değişiklik var</em>}
                </button>
                {group.description && !isCollapsed && (
                  <p className="adm-text-group-desc">{group.description}</p>
                )}

                {!isCollapsed &&
                  group.keys.map((key) => {
                    const value = overrides[key] ?? {
                      tr: tr[key as TranslationKey],
                      en: en[key as TranslationKey],
                    };
                    const changed = isChanged(key);
                    return (
                      <div key={key} className={`adm-text-row ${changed ? "is-changed" : ""}`}>
                        <div className="adm-text-key">
                          <code>{key}</code>
                          {changed && (
                            <button
                              type="button"
                              className="adm-icon-btn"
                              onClick={() => resetKey(key)}
                              title="Varsayılana dön"
                            >
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
              </div>
            );
          })}
        </div>
      ))}

      {visibleCount === 0 && <p className="adm-empty">Aramaya uyan metin yok.</p>}
    </Section>
  );
}
