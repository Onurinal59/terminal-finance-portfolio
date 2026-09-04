/**
 * Koddaki statik içeriği yönetim panelinin anladığı biçime çevirir.
 *
 * Panel ilk açıldığında düzenlenecek bir şey olması için buradan tohumlanır;
 * site de kayıtlı içerik yokken aynı değerleri kullanır. Tek kaynak burasıdır,
 * böylece panel ile sitenin gördüğü varsayılanlar ayrışamaz.
 */
import type {
  MacroIndicatorContent,
  NoticeContent,
  ReportContent,
  ReportCopyContent,
  SiteContentDraft,
} from "@shared/siteContent";
import { REPORT_BASE, REPORT_COPY } from "@/data/researchReports";
import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";
import type { TranslationKey } from "@/i18n";

function text(key: TranslationKey) {
  return { tr: tr[key], en: en[key] };
}

/** Statik rapor listesini panel biçimine çevirir. */
export function defaultReports(): ReportContent[] {
  return REPORT_BASE.map((base) => ({
    ...base,
    published: true,
    copy: {
      tr: REPORT_COPY.tr[base.id] as ReportCopyContent,
      en: REPORT_COPY.en[base.id] as ReportCopyContent,
    },
  }));
}

/** Makro göstergelerin sözlükten çözülmüş, düz metin hâli. */
export const DEFAULT_MACRO_INDICATORS: MacroIndicatorContent[] = [
  { id: "cbrt", tone: "flat", label: text("macro.cbrtLabel"), value: text("macro.cbrtValue"), note: text("macro.cbrtNote") },
  { id: "fed", tone: "flat", label: text("macro.fedLabel"), value: text("macro.fedValue"), note: text("macro.fedNote") },
  { id: "ecb", tone: "up", label: text("macro.ecbLabel"), value: text("macro.ecbValue"), note: text("macro.ecbNote") },
  { id: "tr10y", tone: "flat", label: text("macro.tr10yLabel"), value: text("macro.tr10yValue"), note: text("macro.tr10yNote") },
  { id: "us10y", tone: "flat", label: text("macro.us10yLabel"), value: text("macro.us10yValue"), note: text("macro.us10yNote") },
  { id: "cds", tone: "down", label: text("macro.cdsLabel"), value: text("macro.cdsValue"), note: text("macro.cdsNote") },
  { id: "cpiTr", tone: "down", label: text("macro.cpiTrLabel"), value: text("macro.cpiTrValue"), note: text("macro.cpiTrNote") },
  { id: "cpiUs", tone: "down", label: text("macro.cpiUsLabel"), value: text("macro.cpiUsValue"), note: text("macro.cpiUsNote") },
];

export const DEFAULT_MACRO_SNAPSHOT_DATE = "2026-09-04";

export const DEFAULT_RESEARCH_NOTICE: NoticeContent = {
  enabled: true,
  title: text("research.sampleNoticeTitle"),
  text: text("research.sampleNoticeText"),
};

export const DEFAULT_SESSION_IDS = ["bist", "nyse", "lse", "tse"] as const;

/** Panelde "varsayılanlardan doldur" düğmesinin ürettiği tam taslak. */
export function buildDefaultDraft(watchlist: string[]): SiteContentDraft {
  return {
    translations: {},
    hiddenBlocks: [],
    reports: defaultReports(),
    macro: {
      snapshotDate: DEFAULT_MACRO_SNAPSHOT_DATE,
      indicators: DEFAULT_MACRO_INDICATORS,
    },
    sessions: DEFAULT_SESSION_IDS.map((id) => ({ id, enabled: true })),
    watchlist,
    notices: {
      researchSample: DEFAULT_RESEARCH_NOTICE,
      banner: {
        enabled: false,
        tone: "info",
        text: { tr: "", en: "" },
      },
    },
    seo: {
      title: text("meta.title"),
      description: text("meta.description"),
    },
  };
}
