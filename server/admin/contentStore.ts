/**
 * İçerik deposu: Vercel Blob üzerinde tek bir JSON belgesi.
 *
 * Okuma yolu sıcak tutulur (kısa ömürlü bellek önbelleği), çünkü site her
 * ziyarette bu belgeyi ister. Yazma yolu her zaman doğrudan Blob'a gider ve
 * revision sayacıyla eşzamanlı kaydetmeleri yakalar.
 */
import { del, list, put } from "@vercel/blob";
import { DEFAULT_MACRO_SERIES } from "../../shared/macroDefaults.js";
import { EMPTY_SITE_CONTENT, siteContentSchema, type SiteContent, type SiteContentDraft } from "../../shared/siteContent.js";
import { ADMIN_ENV } from "./env.js";

const CONTENT_PATH = "content/site-content.json";
const CACHE_TTL_MS = 10_000;

let cached: { at: number; value: SiteContent } | null = null;

export class ContentStoreError extends Error {}

function requireToken() {
  if (!ADMIN_ENV.blobToken) {
    throw new ContentStoreError(
      "BLOB_READ_WRITE_TOKEN tanımlı değil. Vercel panelinden bir Blob Store oluşturup projeye bağlayın."
    );
  }
  return ADMIN_ENV.blobToken;
}

export function isStorageConfigured() {
  return Boolean(ADMIN_ENV.blobToken);
}

/** Belgenin bulunduğu blob'un genel adresi (yoksa null). */
async function findContentBlob() {
  const { blobs } = await list({ prefix: CONTENT_PATH, limit: 1, token: requireToken() });
  return blobs.find((blob) => blob.pathname === CONTENT_PATH) ?? null;
}

/**
 * Canlı veri özelliği eklenmeden önce kaydedilmiş göstergeleri yükseltir.
 *
 * O tarihte kaydedilen kayıtlarda `source` alanı hiç yok; zod bunları "manual"
 * sayardı ve koddaki canlı varsayılanlar hiç devreye giremezdi. Alanın *yokluğu*
 * "kullanıcı bilerek manuel seçti" demek olmadığı için, DEFAULT_MACRO_SERIES'te
 * karşılığı olan kimliklere canlı yapılandırmayı bir kez uyguluyoruz. Panelden
 * yapılan her kayıt `source` alanını açıkça yazdığı için yükseltme bir daha
 * tetiklenmez; kullanıcı canlıyı manuele çevirirse o seçim korunur.
 */
function upgradeLegacyMacro(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const document = raw as Record<string, unknown>;
  const macro = document.macro as Record<string, unknown> | undefined;
  const indicators = macro?.indicators;
  if (!Array.isArray(indicators)) return raw;

  let changed = false;
  const upgraded = indicators.map((indicator) => {
    if (!indicator || typeof indicator !== "object") return indicator;
    const entry = indicator as Record<string, unknown>;
    if ("source" in entry) return entry;
    const preset = DEFAULT_MACRO_SERIES[String(entry.id)];
    if (!preset) return entry;
    changed = true;
    return { ...entry, ...preset };
  });

  if (!changed) return raw;
  console.log("[Admin] Eski makro kayıtları canlı varsayılanlara yükseltildi.");
  return { ...document, macro: { ...macro, indicators: upgraded } };
}

/**
 * Kayıtlı içeriği okur. Depo yapılandırılmamışsa veya belge henüz yoksa boş
 * belge döner; site bu durumda koddaki varsayılanlarla çalışmaya devam eder.
 */
export async function readSiteContent(options: { fresh?: boolean } = {}): Promise<SiteContent> {
  if (!isStorageConfigured()) return EMPTY_SITE_CONTENT;

  if (!options.fresh && cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.value;
  }

  try {
    const blob = await findContentBlob();
    if (!blob) {
      cached = { at: Date.now(), value: EMPTY_SITE_CONTENT };
      return EMPTY_SITE_CONTENT;
    }

    // `downloadUrl` CDN önbelleğini atlar; panelden kaydedilen değişikliğin
    // hemen görünmesi için sorgu dizesiyle birlikte isteniyor.
    const response = await fetch(`${blob.url}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new ContentStoreError(`İçerik indirilemedi (${response.status})`);

    const parsed = siteContentSchema.safeParse(upgradeLegacyMacro(await response.json()));
    if (!parsed.success) {
      console.error("[Admin] Kayıtlı içerik şemaya uymuyor:", parsed.error.issues.slice(0, 3));
      return EMPTY_SITE_CONTENT;
    }

    cached = { at: Date.now(), value: parsed.data };
    return parsed.data;
  } catch (error) {
    console.error("[Admin] İçerik okunamadı:", error);
    // Depo geçici olarak erişilemezse site varsayılanlarla ayakta kalsın.
    return cached?.value ?? EMPTY_SITE_CONTENT;
  }
}

/**
 * Yeni içeriği yazar. `expectedRevision` verilirse ve depodaki sürüm farklıysa
 * yazma reddedilir; böylece iki sekmeden yapılan kaydetmeler birbirini ezmez.
 */
export async function writeSiteContent(
  draft: SiteContentDraft,
  meta: { updatedBy: string; expectedRevision?: number }
): Promise<SiteContent> {
  const token = requireToken();
  const current = await readSiteContent({ fresh: true });

  if (meta.expectedRevision !== undefined && meta.expectedRevision !== current.revision) {
    throw new ContentStoreError(
      `İçerik başka bir yerden güncellenmiş (kayıtlı sürüm ${current.revision}, gönderilen ${meta.expectedRevision}). Sayfayı yenileyip tekrar deneyin.`
    );
  }

  const next: SiteContent = {
    ...draft,
    schemaVersion: 1,
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: meta.updatedBy,
  };

  await put(CONTENT_PATH, JSON.stringify(next, null, 2), {
    token,
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });

  cached = { at: Date.now(), value: next };
  return next;
}

/** Yüklenmiş dosyaları listeler; panelde "yüklü dosyalar" bölümünü besler. */
export async function listReportFiles(prefix = "") {
  const { blobs } = await list({ prefix, token: requireToken(), limit: 500 });
  return blobs.map((blob) => ({
    pathname: blob.pathname,
    url: blob.url,
    size: blob.size,
    uploadedAt: blob.uploadedAt instanceof Date ? blob.uploadedAt.toISOString() : String(blob.uploadedAt),
  }));
}

export async function deleteBlobByUrl(url: string) {
  await del(url, { token: requireToken() });
}

/** Yalnızca testler için: göç mantığını dışarı açar. */
export const __testing = { upgradeLegacyMacro };
