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

/** Kurulumla gelen kategoriler; panelden eklenip çıkarılabilir. */
export const DEFAULT_REPORT_CATEGORY_IDS = ["EQUITY", "MOAT", "SECTOR", "MACRO"] as const;

/** Rapor kategorisi. Kimlik serbest metin olduğu için yeni kategori eklenebilir. */
export const reportCategorySchema = z.object({
  id: z.string().min(1).max(32),
  label: localizedTextSchema,
});
export type ReportCategoryContent = z.infer<typeof reportCategorySchema>;
export const REPORT_TONES = ["bullish", "moat", "neutral", "highlight"] as const;
export const MACRO_TONES = ["up", "down", "flat"] as const;
/** Bir makro göstergenin değeri elle mi girilir, Yahoo'dan mı gelir. */
export const MACRO_SOURCES = ["manual", "yahoo"] as const;
/** Canlı değerin gösterim biçimi: yüzde mi düz sayı mı. */
export const MACRO_DISPLAYS = ["percent", "number"] as const;
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
  /** reportCategories listesindeki bir kimlik. Bilinmeyen kimlik "tümü"nde kalır. */
  category: z.string().min(1).max(32),
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
  /** Yalnızca manuel göstergelerde kullanılır; canlı olanlarda yön veriden gelir. */
  tone: z.enum(MACRO_TONES),
  label: localizedTextSchema,
  /** Manuel göstergenin değeri. Canlı göstergelerde yok sayılır. */
  value: localizedTextSchema,
  /** Manuel göstergenin rozeti. Canlı göstergelerde yerini günlük değişim alır. */
  note: localizedTextSchema,
  /** Eski kayıtlarda bu alan yok; varsayılan olarak manuel sayılır. */
  source: z.enum(MACRO_SOURCES).default("manual"),
  /** Yahoo sembolü, örn. ^TNX. Yalnızca source === "yahoo" iken anlamlı. */
  symbol: z.string().max(24).optional(),
  display: z.enum(MACRO_DISPLAYS).optional(),
  precision: z.number().int().min(0).max(4).optional(),
});
export type MacroIndicatorContent = z.infer<typeof macroIndicatorSchema>;

export const marketSessionToggleSchema = z.object({
  id: z.string().min(1).max(24),
  enabled: z.boolean(),
});

/** Profil sayfasında listelenen kişisel proje/site kaydı. */
export const projectLinkSchema = z.object({
  id: z.string().min(1).max(48),
  label: localizedTextSchema,
  description: localizedTextSchema,
  url: z.string(),
  enabled: z.boolean(),
});
export type ProjectLinkContent = z.infer<typeof projectLinkSchema>;

/** Sitedeki sabit bağlantılar ve iletişim bilgisi. Boş alan koddaki değeri kullanır. */
export const siteLinksSchema = z.object({
  linkedin: z.string().optional(),
  measureMoat: z.string().optional(),
  /** İletişim formunun ve alt bilgideki mailto bağlantısının hedefi. */
  email: z.string().optional(),
  projects: z.array(projectLinkSchema).optional(),
});
export type SiteLinksContent = z.infer<typeof siteLinksSchema>;

/** Panelden yüklenen görseller. Boş yuva koddaki dosyayı kullanır. */
export const siteMediaSchema = z.object({
  /** Profil fotoğrafı: pano kartında ve tam profilde görünür. */
  profilePhoto: z.string().optional(),
  /** Bağlantı paylaşımlarında çıkan 1200x630 kapak görseli. */
  shareImage: z.string().optional(),
});
export type SiteMediaContent = z.infer<typeof siteMediaSchema>;

/** Panelden yüklenen bir CV dosyası. */
export const cvFileSchema = z.object({
  url: z.string(),
  fileName: z.string(),
  uploadedAt: z.string().optional(),
});
export type CvFileContent = z.infer<typeof cvFileSchema>;

/** Dört CV yuvası. Doldurulmayan yuva koddaki statik dosyayı kullanır. */
export const cvLibrarySchema = z.object({
  trPhoto: cvFileSchema.optional(),
  trPlain: cvFileSchema.optional(),
  enPhoto: cvFileSchema.optional(),
  enPlain: cvFileSchema.optional(),
});
export type CvLibraryContent = z.infer<typeof cvLibrarySchema>;

export const CV_SLOTS = ["trPhoto", "trPlain", "enPhoto", "enPlain"] as const;
export type CvSlot = (typeof CV_SLOTS)[number];

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
  reportCategories: z.array(reportCategorySchema).optional(),
  macro: z
    .object({
      snapshotDate: z.string().optional(),
      indicators: z.array(macroIndicatorSchema).optional(),
    })
    .optional(),
  sessions: z.array(marketSessionToggleSchema).optional(),
  watchlist: z.array(z.string().min(1).max(24)).optional(),
  cv: cvLibrarySchema.optional(),
  links: siteLinksSchema.optional(),
  media: siteMediaSchema.optional(),
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
