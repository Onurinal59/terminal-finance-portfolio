/**
 * Panelin üzerinde çalıştığı taslak.
 *
 * Depodan gelen belge eksik alanlar içerebilir (hiç kaydedilmemiş olabilir);
 * burada koddaki varsayılanlarla tamamlanıp düzenlenebilir tam bir nesneye
 * dönüştürülür. Kaydederken metin değişiklikleri seyrek tutulur: yalnızca
 * gerçekten değiştirilen sözlük anahtarları yazılır, kalanı kodda kalır.
 */
import { useCallback, useMemo, useState } from "react";
import type { LocalizedText, SiteContent, SiteContentDraft } from "@shared/siteContent";
import {
  DEFAULT_MACRO_INDICATORS,
  DEFAULT_MACRO_SNAPSHOT_DATE,
  DEFAULT_RESEARCH_NOTICE,
  DEFAULT_SESSION_IDS,
  defaultReports,
} from "@/content/defaults";
import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";
import type { TranslationKey } from "@/i18n";

/** Taslakta her alan dolu; kaydetmeden önce seyrekleştirilir. */
export type WorkingDraft = Required<Omit<SiteContentDraft, "seo" | "notices" | "macro">> & {
  macro: { snapshotDate: string; indicators: NonNullable<NonNullable<SiteContentDraft["macro"]>["indicators"]> };
  notices: NonNullable<SiteContentDraft["notices"]>;
  seo: NonNullable<SiteContentDraft["seo"]>;
};

function text(key: TranslationKey): LocalizedText {
  return { tr: tr[key], en: en[key] };
}

export function buildWorkingDraft(stored: SiteContent, defaultWatchlist: string[]): WorkingDraft {
  return {
    translations: stored.translations ?? {},
    hiddenBlocks: stored.hiddenBlocks ?? [],
    reports: stored.reports ?? defaultReports(),
    macro: {
      snapshotDate: stored.macro?.snapshotDate || DEFAULT_MACRO_SNAPSHOT_DATE,
      indicators: stored.macro?.indicators ?? DEFAULT_MACRO_INDICATORS,
    },
    sessions: stored.sessions ?? DEFAULT_SESSION_IDS.map((id) => ({ id, enabled: true })),
    watchlist: stored.watchlist ?? defaultWatchlist,
    notices: {
      researchSample: stored.notices?.researchSample ?? DEFAULT_RESEARCH_NOTICE,
      banner: stored.notices?.banner ?? {
        enabled: false,
        tone: "info",
        text: { tr: "", en: "" },
      },
    },
    seo: stored.seo ?? { title: text("meta.title"), description: text("meta.description") },
  };
}

/**
 * Koddaki değerle aynı olan metin değişikliklerini atar. Böylece ileride kodda
 * bir yazım düzeltilirse, panelden hiç dokunulmamış anahtarlar o düzeltmeyi alır.
 */
export function sparseTranslations(overrides: Record<string, LocalizedText>): Record<string, LocalizedText> {
  const result: Record<string, LocalizedText> = {};
  for (const [key, value] of Object.entries(overrides)) {
    const defaultTr = tr[key as TranslationKey];
    const defaultEn = en[key as TranslationKey];
    const changed = value.tr !== defaultTr || value.en !== defaultEn;
    const hasContent = value.tr.trim().length > 0 || value.en.trim().length > 0;
    if (changed && hasContent) result[key] = value;
  }
  return result;
}

export function toDraftPayload(working: WorkingDraft): SiteContentDraft {
  return {
    ...working,
    translations: sparseTranslations(working.translations),
  };
}

export function useDraft(initial: WorkingDraft) {
  const [draft, setDraft] = useState<WorkingDraft>(initial);
  const [baseline, setBaseline] = useState(() => JSON.stringify(initial));

  const update = useCallback((patch: Partial<WorkingDraft> | ((current: WorkingDraft) => WorkingDraft)) => {
    setDraft((current) => (typeof patch === "function" ? patch(current) : { ...current, ...patch }));
  }, []);

  /** Kaydedilenle karşılaştırma; "kaydedilmemiş değişiklik" uyarısını besler. */
  const isDirty = useMemo(() => JSON.stringify(draft) !== baseline, [draft, baseline]);

  const markSaved = useCallback((saved: WorkingDraft) => {
    setBaseline(JSON.stringify(saved));
  }, []);

  const reset = useCallback(
    (next: WorkingDraft) => {
      setDraft(next);
      setBaseline(JSON.stringify(next));
    },
    []
  );

  return { draft, update, isDirty, markSaved, reset };
}
