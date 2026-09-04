/**
 * Koddaki statik içeriği yönetim panelinin anladığı biçime çevirir.
 *
 * Panel ilk açıldığında düzenlenecek bir şey olması için buradan tohumlanır;
 * site de kayıtlı içerik yokken aynı değerleri kullanır. Tek kaynak burasıdır,
 * böylece panel ile sitenin gördüğü varsayılanlar ayrışamaz.
 */
import type {
  CvSlot,
  MacroIndicatorContent,
  NoticeContent,
  ReportCategoryContent,
  ReportContent,
  ReportCopyContent,
  SiteContentDraft,
} from "@shared/siteContent";
import { DEFAULT_MACRO_SERIES } from "@shared/macroDefaults";
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

/** Kurulumla gelen rapor kategorileri; panelden düzenlenebilir. */
export const DEFAULT_REPORT_CATEGORIES: ReportCategoryContent[] = [
  { id: "EQUITY", label: text("research.catEquity") },
  { id: "MOAT", label: text("research.catMoat") },
  { id: "SECTOR", label: text("research.catSector") },
  { id: "MACRO", label: text("research.catMacro") },
];

/**
 * Makro göstergeler. Politika faizleri ve enflasyon verileri Yahoo Finance'te
 * bulunmuyor (borsada işlem gören enstrüman değiller), o yüzden elle güncellenir;
 * piyasadan okunabilenler `source: "yahoo"` ile canlı gelir.
 */
const MACRO_BASE: MacroIndicatorContent[] = [
  { id: "cbrt", tone: "flat", label: text("macro.cbrtLabel"), value: text("macro.cbrtValue"), note: text("macro.cbrtNote"), source: "manual" },
  { id: "fed", tone: "flat", label: text("macro.fedLabel"), value: text("macro.fedValue"), note: text("macro.fedNote"), source: "manual" },
  { id: "ecb", tone: "up", label: text("macro.ecbLabel"), value: text("macro.ecbValue"), note: text("macro.ecbNote"), source: "manual" },
  { id: "tr10y", tone: "flat", label: text("macro.tr10yLabel"), value: text("macro.tr10yValue"), note: text("macro.tr10yNote"), source: "manual" },
  { id: "us10y", tone: "flat", label: text("macro.us10yLabel"), value: text("macro.us10yValue"), note: text("macro.us10yNote"), source: "manual" },
  {
    id: "dxy",
    tone: "flat",
    source: "manual",
    label: { tr: "DOLAR ENDEKSİ (DXY)", en: "DOLLAR INDEX (DXY)" },
    value: { tr: "—", en: "—" },
    note: { tr: "Küresel Dolar Gücü", en: "Global dollar strength" },
  },
  { id: "cds", tone: "down", label: text("macro.cdsLabel"), value: text("macro.cdsValue"), note: text("macro.cdsNote"), source: "manual" },
  { id: "cpiTr", tone: "down", label: text("macro.cpiTrLabel"), value: text("macro.cpiTrValue"), note: text("macro.cpiTrNote"), source: "manual" },
  { id: "cpiUs", tone: "down", label: text("macro.cpiUsLabel"), value: text("macro.cpiUsValue"), note: text("macro.cpiUsNote"), source: "manual" },
  // Kaynağı tanımlı olanlar canlıya çevrilir; etiketler yukarıdan gelir.
];

/** Kaynağı paylaşılan listede tanımlı olanlar canlıya çevrilir. */
export const DEFAULT_MACRO_INDICATORS: MacroIndicatorContent[] = MACRO_BASE.map((indicator) => {
  const series = DEFAULT_MACRO_SERIES[indicator.id];
  return series ? { ...indicator, ...series } : indicator;
});

export const DEFAULT_MACRO_SNAPSHOT_DATE = "2026-09-04";

export const DEFAULT_RESEARCH_NOTICE: NoticeContent = {
  enabled: true,
  title: text("research.sampleNoticeTitle"),
  text: text("research.sampleNoticeText"),
};

export const DEFAULT_SESSION_IDS = ["bist", "nyse", "lse", "tse"] as const;

/** Panel bir CV yüklemediyse kullanılan, depoyla birlikte gelen dosyalar. */
export const DEFAULT_CV_FILES: Record<CvSlot, { url: string; fileName: string }> = {
  trPhoto: { url: "/cv/Onur_Inal_CV_TR_Fotografli.pdf", fileName: "Onur_Inal_CV_TR_Fotografli.pdf" },
  trPlain: { url: "/cv/Onur_Inal_CV_TR_ATS.pdf", fileName: "Onur_Inal_CV_TR_ATS.pdf" },
  enPhoto: { url: "/cv/Onur_Inal_CV_EN_Fotografli.pdf", fileName: "Onur_Inal_CV_EN_Fotografli.pdf" },
  enPlain: { url: "/cv/Onur_Inal_CV_EN_ATS.pdf", fileName: "Onur_Inal_CV_EN_ATS.pdf" },
};

export const DEFAULT_LINKEDIN_URL = "https://www.linkedin.com/in/onur%C4%B1nal/";
export const DEFAULT_MEASURE_MOAT_URL = "https://measure-moat.vercel.app/#roadmap";
export const DEFAULT_EMAIL = "onurinal815@gmail.com";
export const DEFAULT_PROFILE_PHOTO = "/media/onur-inal.jpg";
export const DEFAULT_SHARE_IMAGE = "/og-image.png";

/** Panelde "varsayılanlardan doldur" düğmesinin ürettiği tam taslak. */
export function buildDefaultDraft(watchlist: string[]): SiteContentDraft {
  return {
    translations: {},
    hiddenBlocks: [],
    reports: defaultReports(),
    reportCategories: DEFAULT_REPORT_CATEGORIES,
    macro: {
      snapshotDate: DEFAULT_MACRO_SNAPSHOT_DATE,
      indicators: DEFAULT_MACRO_INDICATORS,
    },
    sessions: DEFAULT_SESSION_IDS.map((id) => ({ id, enabled: true })),
    watchlist,
    cv: {},
    media: { profilePhoto: DEFAULT_PROFILE_PHOTO, shareImage: DEFAULT_SHARE_IMAGE },
    links: {
      linkedin: DEFAULT_LINKEDIN_URL,
      measureMoat: DEFAULT_MEASURE_MOAT_URL,
      email: DEFAULT_EMAIL,
      projects: [],
    },
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
