/**
 * Yönetim panelinin düzenlediği site içeriği.
 *
 * Buradaki belge, koddaki statik varsayılanların *üzerine* uygulanan bir katmandır:
 * bir alan yoksa site yine koddaki değeri gösterir. Böylece depo boşken de site
 * çalışır ve panelden yapılan her değişiklik geri alınabilir kalır.
 */
import { z } from "zod";

export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Her metin iki dilde tutulur; panel iki alanı yan yana düzenletir. */
export const localizedTextSchema = z.object({
  tr: z.string(),
  en: z.string(),
});
export type LocalizedText = z.infer<typeof localizedTextSchema>;

export const REPORT_CATEGORIES = ["EQUITY", "MOAT", "SECTOR", "MACRO"] as const;
export const REPORT_TONES = ["bullish", "moat", "neutral", "highlight"] as const;
export const MACRO_TONES = ["up", "down", "flat"] as const;
export const BANNER_TONES = ["info", "warning", "success"] as const;

export const valuationMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  benchmark: z.string().optional(),
  isPositive: z.boolean().optional(),
});
export type ValuationMetricContent = z.infer<typeof valuationMetricSchema>;

/** Bir raporun tek dildeki tüm metinleri. */
export const reportCopySchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  categoryLabel: z.string(),
  recommendation: z.string(),
  period: z.string(),
  readTime: z.string(),
  authorTitle: z.string(),
  focus: z.string(),
  executiveSummary: z.string(),
  keyCatalysts: z.array(z.string()),
  valuationMetrics: z.array(valuationMetricSchema),
  financialDrivers: z.array(z.string()),
  risks: z.array(z.string()),
  analystNote: z.string(),
  methodology: z.string(),
  source: z.string(),
});
export type ReportCopyContent = z.infer<typeof reportCopySchema>;

export const reportSchema = z.object({
  id: z.string().min(1).max(64),
  ticker: z.string().min(1).max(24),
  category: z.enum(REPORT_CATEGORIES),
  recommendationTone: z.enum(REPORT_TONES),
  targetPrice: z.string().optional(),
  currentPrice: z.string().optional(),
  upsidePotential: z.string().optional(),
  author: z.string(),
  link: z.string(),
  /** Blob'a yüklenen gerçek PDF'in adresi. Boşsa rapor yalnızca site içinde okunur. */
  pdfUrl: z.string().optional(),
  /** Kapalıyken rapor kütüphanede görünmez; taslak olarak saklanır. */
  published: z.boolean(),
  copy: z.object({ tr: reportCopySchema, en: reportCopySchema }),
});
export type ReportContent = z.infer<typeof reportSchema>;

export const macroIndicatorSchema = z.object({
  id: z.string().min(1).max(48),
  tone: z.enum(MACRO_TONES),
  label: localizedTextSchema,
  value: localizedTextSchema,
  note: localizedTextSchema,
});
export type MacroIndicatorContent = z.infer<typeof macroIndicatorSchema>;

export const marketSessionToggleSchema = z.object({
  id: z.string().min(1).max(24),
  enabled: z.boolean(),
});

export const noticeSchema = z.object({
  enabled: z.boolean(),
  title: localizedTextSchema,
  text: localizedTextSchema,
});
export type NoticeContent = z.infer<typeof noticeSchema>;

export const bannerSchema = z.object({
  enabled: z.boolean(),
  tone: z.enum(BANNER_TONES),
  text: localizedTextSchema,
  /** Boş bırakılırsa bandın bağlantısı olmaz. */
  linkLabel: localizedTextSchema.optional(),
  linkUrl: z.string().optional(),
});
export type BannerContent = z.infer<typeof bannerSchema>;

export const seoSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
});

/**
 * Panelden kaydedilen belge. Tüm üst düzey alanlar isteğe bağlıdır; yalnızca
 * gerçekten değiştirilen bölümler yazılır, kalanı koddaki varsayılanla gelir.
 */
export const siteContentSchema = z.object({
  /** Belge biçimi sürümü; ileride göç gerekirse buradan ayırt edilir. */
  schemaVersion: z.literal(1),
  /** Her kaydetmede artan sayaç. Eşzamanlı yazmalarda çakışmayı yakalar. */
  revision: z.number().int().nonnegative(),
  updatedAt: z.string(),
  updatedBy: z.string().optional(),

  /** Anahtar bazlı metin değişiklikleri: `{ "profile.gpaValue": { tr, en } }` */
  translations: z.record(z.string(), localizedTextSchema).optional(),

  /** Gizlenecek blokların kimlikleri (bkz. HIDEABLE_BLOCKS). */
  hiddenBlocks: z.array(z.string()).optional(),

  reports: z.array(reportSchema).optional(),
  macro: z
    .object({
      snapshotDate: z.string().optional(),
      indicators: z.array(macroIndicatorSchema).optional(),
    })
    .optional(),
  sessions: z.array(marketSessionToggleSchema).optional(),
  watchlist: z.array(z.string().min(1).max(24)).optional(),
  notices: z
    .object({
      researchSample: noticeSchema.optional(),
      banner: bannerSchema.optional(),
    })
    .optional(),
  seo: seoSchema.optional(),
});

export type SiteContent = z.infer<typeof siteContentSchema>;

/** Panelin kaydettiği gövde: sürüm alanları sunucuda üretilir. */
export const siteContentDraftSchema = siteContentSchema.omit({
  schemaVersion: true,
  revision: true,
  updatedAt: true,
  updatedBy: true,
});
export type SiteContentDraft = z.infer<typeof siteContentDraftSchema>;

/** Depo boşken kullanılan belge. */
export const EMPTY_SITE_CONTENT: SiteContent = {
  schemaVersion: 1,
  revision: 0,
  updatedAt: new Date(0).toISOString(),
};

/**
 * Panelden açılıp kapatılabilen bloklar. Kimlikler bileşenlerde
 * `isBlockVisible(...)` ile okunur; buraya eklemeden yeni bir anahtar kullanmayın.
 */
export const HIDEABLE_BLOCKS = [
  "profile.gpa",
  "profile.research",
  "profile.tech",
  "profile.cvDownload",
  "profile.linkedin",
  "profileView.gpa",
  "profileView.awards",
  "dashboard.macroPanel",
  "dashboard.hoursPanel",
  "dashboard.valuationPanel",
  "nav.research",
] as const;
export type HideableBlock = (typeof HIDEABLE_BLOCKS)[number];
