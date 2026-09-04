/**
 * Site içeriği sağlayıcısı.
 *
 * Kayıtlı içerik (Vercel Blob) koddaki varsayılanların üzerine uygulanır. İstek
 * başarısız olursa veya depo hiç kurulmamışsa site sessizce varsayılanlarla
 * çalışır — yönetim paneli hiç kullanılmadan da her şey ayakta kalır.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type {
  BannerContent,
  CvSlot,
  MacroIndicatorContent,
  NoticeContent,
  ProjectLinkContent,
  ReportCategoryContent,
  ReportContent,
  SiteContent,
} from "@shared/siteContent";
import { EMPTY_SITE_CONTENT, siteContentSchema } from "@shared/siteContent";
import { trpc } from "@/lib/trpc";
import { setTranslationOverrides } from "@/i18n/overrides";
import {
  DEFAULT_CV_FILES,
  DEFAULT_EMAIL,
  DEFAULT_LINKEDIN_URL,
  DEFAULT_MACRO_INDICATORS,
  DEFAULT_MEASURE_MOAT_URL,
  DEFAULT_REPORT_CATEGORIES,
  DEFAULT_PROFILE_PHOTO,
  DEFAULT_SHARE_IMAGE,
  DEFAULT_MACRO_SNAPSHOT_DATE,
  DEFAULT_RESEARCH_NOTICE,
  defaultReports,
} from "./defaults";

interface ContentContextValue {
  /** Depodan gelen ham belge. Panelin dışında doğrudan okunmasına gerek yok. */
  raw: SiteContent;
  /** `t()` yeniden üretilsin diye artan sayaç. */
  overridesRevision: number;
  reports: ReportContent[];
  reportCategories: ReportCategoryContent[];
  macroIndicators: MacroIndicatorContent[];
  macroSnapshotDate: string;
  researchNotice: NoticeContent;
  banner: BannerContent | null;
  watchlistOverride: string[] | null;
  /** Sabit bağlantılar; panelde boş bırakılmışsa koddaki adres döner. */
  links: { linkedin: string; measureMoat: string; email: string };
  projects: ProjectLinkContent[];
  media: { profilePhoto: string; shareImage: string };
  /** Dört CV yuvası; yüklenmemiş olan koddaki dosyayı gösterir. */
  cvFiles: Record<CvSlot, { url: string; fileName: string }>;
  isBlockVisible: (blockId: string) => boolean;
  isSessionEnabled: (sessionId: string) => boolean;
}

const ContentContext = createContext<ContentContextValue | undefined>(undefined);

const CACHE_KEY = "analiz-terminal-content-v1";

/**
 * Son bilinen içeriği tarayıcıda tutuyoruz. İstek dönene kadar (birkaç yüz ms)
 * varsayılan metinlerin görünüp sonra değişmesini önler; ilk ziyarette önbellek
 * boş olur ve site yine varsayılanlarla açılır.
 */
function readCachedContent(): SiteContent | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = siteContentSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function writeCachedContent(content: SiteContent) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(content));
  } catch {
    // localStorage kullanılamıyor (gizli sekme, dolu kota) — önbelleksiz devam.
  }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [cached] = useState(readCachedContent);

  // Site açılışını bloklamamak için tek seferlik, sessiz bir istek: hata olursa
  // varsayılanlar kullanılır, kullanıcıya bir şey gösterilmez.
  const query = trpc.content.get.useQuery(undefined, {
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const raw = query.data ?? cached ?? EMPTY_SITE_CONTENT;

  useEffect(() => {
    if (query.data) writeCachedContent(query.data);
  }, [query.data]);

  // Sözlük katmanını render sırasında senkron kuruyoruz ki aynı turda çizilen
  // bileşenler eski metni bir kare boyunca göstermesin.
  const overridesRevision = setTranslationOverrides(raw.translations);

  const value = useMemo<ContentContextValue>(() => {
    const hidden = new Set(raw.hiddenBlocks ?? []);
    const sessionMap = new Map((raw.sessions ?? []).map((session) => [session.id, session.enabled]));

    return {
      raw,
      overridesRevision,
      reports: raw.reports ?? defaultReports(),
      reportCategories: raw.reportCategories ?? DEFAULT_REPORT_CATEGORIES,
      macroIndicators: raw.macro?.indicators ?? DEFAULT_MACRO_INDICATORS,
      macroSnapshotDate: raw.macro?.snapshotDate || DEFAULT_MACRO_SNAPSHOT_DATE,
      researchNotice: raw.notices?.researchSample ?? DEFAULT_RESEARCH_NOTICE,
      banner: raw.notices?.banner?.enabled ? raw.notices.banner : null,
      watchlistOverride: raw.watchlist?.length ? raw.watchlist : null,
      links: {
        linkedin: raw.links?.linkedin || DEFAULT_LINKEDIN_URL,
        measureMoat: raw.links?.measureMoat || DEFAULT_MEASURE_MOAT_URL,
        email: raw.links?.email || DEFAULT_EMAIL,
      },
      projects: (raw.links?.projects ?? []).filter((project) => project.enabled),
      media: {
        profilePhoto: raw.media?.profilePhoto || DEFAULT_PROFILE_PHOTO,
        shareImage: raw.media?.shareImage || DEFAULT_SHARE_IMAGE,
      },
      cvFiles: {
        trPhoto: raw.cv?.trPhoto ?? DEFAULT_CV_FILES.trPhoto,
        trPlain: raw.cv?.trPlain ?? DEFAULT_CV_FILES.trPlain,
        enPhoto: raw.cv?.enPhoto ?? DEFAULT_CV_FILES.enPhoto,
        enPlain: raw.cv?.enPlain ?? DEFAULT_CV_FILES.enPlain,
      },
      isBlockVisible: (blockId: string) => !hidden.has(blockId),
      // Listede adı geçmeyen seans varsayılan olarak açıktır.
      isSessionEnabled: (sessionId: string) => sessionMap.get(sessionId) ?? true,
    };
  }, [raw, overridesRevision]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within ContentProvider");
  return context;
}
