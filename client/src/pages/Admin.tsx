/**
 * Yönetim paneli.
 *
 * Google ile giriş yapılmadan hiçbir içerik gösterilmez; oturum sunucudaki
 * imzalı çerezle doğrulanır ve e-posta ADMIN_EMAILS listesinde olmak zorundadır.
 * Kaydetme, Vercel Blob'daki tek JSON belgesini günceller.
 */
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BellRing,
  BookOpen,
  Check,
  Clock3,
  Eye,
  FolderTree,
  Gauge,
  Image as ImageIcon,
  Languages,
  Link2,
  ListOrdered,
  Loader2,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  User,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { BANNER_TONES, HIDEABLE_BLOCKS, MACRO_DISPLAYS, MACRO_SOURCES, MACRO_TONES } from "@shared/siteContent";
import type { MacroIndicatorContent } from "@shared/siteContent";
import { DEFAULT_MACRO_SERIES, MACRO_SERIES_SUGGESTIONS, type MacroSeriesDefault } from "@shared/macroDefaults";
import { trpc } from "@/lib/trpc";
import { DEFAULT_SESSION_IDS } from "@/content/defaults";
import { DEFAULT_WATCHLIST_SYMBOLS } from "./Home";
import { CategoriesTab, CvTab, LinksTab, MediaTab } from "./admin/AssetPanels";
import { BilingualField, Field, Section, TextInput, Toggle } from "./admin/fields";
import { ReportsPanel } from "./admin/ReportsPanel";
import { TextsPanel } from "./admin/TextsPanel";
import { buildWorkingDraft, toDraftPayload, useDraft, type WorkingDraft } from "./admin/useDraft";
import "./admin/admin.css";

/** Kenar çubuğu grupları; panelin zihinsel haritasını verir. */
const NAV_GROUPS = [
  {
    title: "İçerik",
    items: [
      { id: "reports", label: "Raporlar", icon: BookOpen, hint: "Araştırma dosyaları ve PDF'ler" },
      { id: "categories", label: "Kategoriler", icon: FolderTree, hint: "Kütüphane filtre sekmeleri" },
      { id: "texts", label: "Site metinleri", icon: Languages, hint: "Sitedeki her yazı" },
    ],
  },
  {
    title: "Profil",
    items: [
      { id: "media", label: "Görseller", icon: ImageIcon, hint: "Profil fotoğrafı ve paylaşım kapağı" },
      { id: "cv", label: "CV dosyaları", icon: User, hint: "Dört dil ve biçim yuvası" },
      { id: "links", label: "Bağlantılar", icon: Link2, hint: "LinkedIn, e-posta, projeler" },
    ],
  },
  {
    title: "Pano",
    items: [
      { id: "macro", label: "Makro göstergeler", icon: Gauge, hint: "Canlı ve elle girilen veriler" },
      { id: "sessions", label: "Piyasa seansları", icon: Clock3, hint: "Listelenen borsalar" },
      { id: "watchlist", label: "İzleme listesi", icon: ListOrdered, hint: "Varsayılan semboller" },
    ],
  },
  {
    title: "Görünüm",
    items: [
      { id: "visibility", label: "Görünürlük", icon: Eye, hint: "Blokları aç ve kapat" },
      { id: "notices", label: "Uyarılar", icon: BellRing, hint: "Duyuru bandı ve rapor uyarısı" },
    ],
  },
] as const;

type NavItem = (typeof NAV_GROUPS)[number]["items"][number];
type TabId = NavItem["id"];
const ALL_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => [...group.items]);

const BLOCK_LABELS: Record<string, string> = {
  "profile.gpa": "Pano profil kartındaki GPA rozeti",
  "profile.research": "Profil kartı · Araştırma girişimi",
  "profile.tech": "Profil kartı · Teknik yetkinlik",
  "profile.cvDownload": "Profil kartı · CV indirme",
  "profile.linkedin": "Profil kartı · LinkedIn butonu",
  "profileView.gpa": "Tam profil sayfasındaki GPA rozeti",
  "profileView.awards": "Tam profil · Ödüller bölümü",
  "dashboard.macroPanel": "Panoda makro göstergeler paneli",
  "dashboard.hoursPanel": "Panoda piyasa seansları paneli",
  "dashboard.valuationPanel": "Panoda değerleme masası paneli",
  "nav.research": "Üst menüdeki Raporlar sekmesi",
};

const SESSION_LABELS: Record<string, string> = {
  bist: "Borsa İstanbul (BIST)",
  nyse: "New York (NYSE / NASDAQ)",
  lse: "Londra (LSE)",
  tse: "Tokyo (TSE)",
};

const MACRO_TONE_LABELS: Record<(typeof MACRO_TONES)[number], string> = {
  up: "Yeşil (yukarı)",
  down: "Mavi (aşağı)",
  flat: "Gri (yatay)",
};

const MACRO_SOURCE_LABELS: Record<(typeof MACRO_SOURCES)[number], string> = {
  manual: "Elle girilen değer",
  yahoo: "Yahoo Finance (piyasa verisi)",
  nyfed: "New York Fed (ABD faizleri)",
  ecb: "ECB Data Portal (euro bölgesi)",
  fred: "FRED (ABD makro serileri)",
  evds: "TCMB EVDS (Türkiye serileri)",
};

/** Her kaynağın seri kimliğini nasıl yazacağını anlatan ipuçları. */
const MACRO_SOURCE_HINTS: Record<(typeof MACRO_SOURCES)[number], string> = {
  manual: "",
  yahoo: "Yahoo sembolü. Örnekler: ^TNX (ABD 10Y), ^TYX (30Y), ^VIX, DX-Y.NYB (dolar endeksi), USDTRY=X, GC=F (altın), XU100.IS (BIST 100).",
  nyfed: "effr-target → FOMC hedef aralığı, effr → gerçekleşen federal fon faizi.",
  ecb: "ECB seri anahtarı. Örnekler: FM.D.U2.EUR.4F.KR.DFR.LEV (mevduat faizi), ICP.M.U2.N.000000.4.ANR (euro bölgesi enflasyonu).",
  fred: "FRED seri kimliği. Örnekler: CPIAUCSL (ABD TÜFE), DFEDTARU (Fed hedef üst sınır), DGS10 (ABD 10Y).",
  evds: "EVDS seri kodu. TCMB EVDS sitesinde seriyi bulup kodunu kopyalayın (örn. TP.APIFON4).",
};

const MACRO_DISPLAY_LABELS: Record<(typeof MACRO_DISPLAYS)[number], string> = {
  percent: "Yüzde · %4,79",
  number: "Düz sayı · 99,33",
};

const BANNER_TONE_LABELS: Record<(typeof BANNER_TONES)[number], string> = {
  info: "Bilgi (mavi)",
  warning: "Uyarı (sarı)",
  success: "Olumlu (yeşil)",
};

export default function Admin() {
  const status = trpc.admin.status.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const loginError = useMemo(() => new URLSearchParams(window.location.search).get("error"), []);

  useEffect(() => {
    document.title = "Yönetim Paneli · Onur İnal";
    // Panel tek sayfalık uygulamanın bir rotası olduğu için robots etiketini
    // burada değiştiriyoruz; index.html'deki değer siteye ait kalmalı.
    const robots = document.querySelector('meta[name="robots"]');
    const previous = robots?.getAttribute("content") ?? null;
    robots?.setAttribute("content", "noindex, nofollow");
    return () => {
      if (robots && previous) robots.setAttribute("content", previous);
    };
  }, []);

  if (status.isLoading) {
    return (
      <div className="adm-shell adm-center">
        <Loader2 size={22} className="adm-spin" />
        <p>Oturum kontrol ediliyor…</p>
      </div>
    );
  }

  const session = status.data?.session ?? null;
  if (!session) {
    return <LoginScreen missingConfig={status.data?.missingConfig ?? []} loginError={loginError} />;
  }

  return <Editor email={session.email} name={session.name} storageReady={status.data?.storageReady ?? false} />;
}

function LoginScreen({ missingConfig, loginError }: { missingConfig: string[]; loginError: string | null }) {
  const configured = missingConfig.length === 0;

  return (
    <div className="adm-shell adm-center">
      <div className="adm-login-card">
        <span className="adm-login-kicker">ONUR İNAL // YÖNETİM PANELİ</span>
        <h1>Yönetim paneli</h1>
        <p className="adm-login-copy">
          Panel yalnızca izinli Google hesabına açıktır. Başka bir hesapla giriş yapılırsa erişim reddedilir.
        </p>

        {loginError && (
          <div className="adm-alert error">
            <AlertTriangle size={15} />
            <span>{loginError}</span>
          </div>
        )}

        {!configured && (
          <div className="adm-alert warn">
            <AlertTriangle size={15} />
            <div>
              <b>Sunucu yapılandırması eksik</b>
              <p>
                Vercel'de şu ortam değişkenleri tanımlı değil: <code>{missingConfig.join(", ")}</code>. Bunları
                ekleyip yeniden dağıtın.
              </p>
            </div>
          </div>
        )}

        <a className={`adm-btn primary block ${configured ? "" : "is-disabled"}`} href="/api/admin/login">
          Google ile giriş yap
        </a>

        <a className="adm-back-link" href="/">
          <ArrowLeft size={13} /> Siteye dön
        </a>
      </div>
    </div>
  );
}

function Editor({ email, name, storageReady }: { email: string; name: string; storageReady: boolean }) {
  const utils = trpc.useUtils();
  const contentQuery = trpc.admin.content.useQuery(undefined, { retry: false, refetchOnWindowFocus: false });
  const saveMutation = trpc.admin.save.useMutation();

  const [tab, setTab] = useState<TabId>("reports");
  const [navOpen, setNavOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [revision, setRevision] = useState(0);
  const { draft, update, isDirty, reset } = useDraft(
    buildWorkingDraft({ schemaVersion: 1, revision: 0, updatedAt: "" }, DEFAULT_WATCHLIST_SYMBOLS)
  );

  // Depodan gelen belge bir kez taslağa yüklenir; sonrası tamamen yereldir.
  useEffect(() => {
    if (!contentQuery.data || ready) return;
    reset(buildWorkingDraft(contentQuery.data, DEFAULT_WATCHLIST_SYMBOLS));
    setRevision(contentQuery.data.revision);
    setReady(true);
  }, [contentQuery.data, ready, reset]);

  // Kaydedilmemiş değişiklikle sekme kapatılırsa tarayıcı uyarsın.
  useEffect(() => {
    if (!isDirty) return;
    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const save = async () => {
    try {
      const saved = await saveMutation.mutateAsync({
        draft: toDraftPayload(draft),
        expectedRevision: revision,
      });
      setRevision(saved.revision);
      reset(buildWorkingDraft(saved, DEFAULT_WATCHLIST_SYMBOLS));
      await utils.content.get.invalidate();
      toast.success("Kaydedildi. Site birkaç saniye içinde güncellenir.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kaydedilemedi");
    }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  };

  if (contentQuery.isLoading || !ready) {
    return (
      <div className="adm-shell adm-center">
        <Loader2 size={22} className="adm-spin" />
        <p>İçerik yükleniyor…</p>
      </div>
    );
  }

  if (contentQuery.error) {
    return (
      <div className="adm-shell adm-center">
        <div className="adm-alert error">
          <AlertTriangle size={16} />
          <div>
            <b>İçerik okunamadı</b>
            <p>{contentQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const active = ALL_ITEMS.find((item) => item.id === tab) ?? ALL_ITEMS[0];

  return (
    <div className={`adm-shell adm-layout ${navOpen ? "nav-open" : ""}`}>
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <span className="adm-brand-mark" />
          <div>
            <b>Yönetim Paneli</b>
            <small>onurinal.vercel.app</small>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="adm-nav-group">
              <span className="adm-nav-title">{group.title}</span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    type="button"
                    key={item.id}
                    className={`adm-nav-item ${tab === item.id ? "is-active" : ""}`}
                    onClick={() => {
                      setTab(item.id);
                      setNavOpen(false);
                    }}
                  >
                    <Icon size={15} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="adm-sidebar-foot">
          <div className="adm-user-card">
            <span className="adm-user-avatar">{name.trim().charAt(0) || "?"}</span>
            <div>
              <b>{name}</b>
              <small title={email}>{email}</small>
            </div>
          </div>
          <div className="adm-sidebar-links">
            <a href="/" className="adm-back-link">
              <ArrowLeft size={13} /> Siteye dön
            </a>
            <button type="button" className="adm-back-link as-button" onClick={logout}>
              <LogOut size={13} /> Çıkış
            </button>
          </div>
        </div>
      </aside>

      <button type="button" className="adm-scrim" tabIndex={-1} aria-hidden onClick={() => setNavOpen(false)} />

      <div className="adm-content">
        <header className="adm-header">
          <button type="button" className="adm-nav-toggle" onClick={() => setNavOpen(true)} aria-label="Menü">
            <Menu size={18} />
          </button>
          <div className="adm-header-title">
            <h1>{active.label}</h1>
            <p>{active.hint}</p>
          </div>
          <div className="adm-header-actions">
            <span className={`adm-save-state ${isDirty ? "dirty" : "clean"}`}>
              {isDirty ? "Kaydedilmemiş değişiklik" : `Kayıtlı · sürüm ${revision}`}
            </span>
            <button
              type="button"
              className="adm-btn primary"
              onClick={save}
              disabled={!isDirty || saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 size={14} className="adm-spin" /> : <Save size={14} />}
              Kaydet
            </button>
          </div>
        </header>

        <main className="adm-main">
          {!storageReady && (
            <div className="adm-alert warn">
              <AlertTriangle size={15} />
              <div>
                <b>Depo bağlı değil</b>
                <p>
                  Vercel panelinden bir Blob Store oluşturup projeye bağlayın (<code>BLOB_READ_WRITE_TOKEN</code>).
                  O zamana kadar kaydetme ve dosya yükleme çalışmaz.
                </p>
              </div>
            </div>
          )}

          {tab === "reports" && (
            <ReportsPanel
              reports={draft.reports}
              categories={draft.reportCategories}
              onChange={(reports) => update({ reports })}
            />
          )}
          {tab === "categories" && <CategoriesTab draft={draft} update={update} />}
          {tab === "texts" && (
            <TextsPanel overrides={draft.translations} onChange={(translations) => update({ translations })} />
          )}
          {tab === "media" && <MediaTab draft={draft} update={update} />}
          {tab === "cv" && <CvTab draft={draft} update={update} />}
          {tab === "links" && <LinksTab draft={draft} update={update} />}
          {tab === "macro" && <MacroTab draft={draft} update={update} />}
          {tab === "sessions" && <SessionsTab draft={draft} update={update} />}
          {tab === "watchlist" && <WatchlistTab draft={draft} update={update} />}
          {tab === "visibility" && <VisibilityTab draft={draft} update={update} />}
          {tab === "notices" && <NoticesTab draft={draft} update={update} />}
        </main>
      </div>
    </div>
  );
}

type TabProps = {
  draft: WorkingDraft;
  update: (patch: Partial<WorkingDraft> | ((current: WorkingDraft) => WorkingDraft)) => void;
};

function VisibilityTab({ draft, update }: TabProps) {
  const hidden = new Set(draft.hiddenBlocks);

  const toggle = (blockId: string, visible: boolean) => {
    const next = new Set(hidden);
    if (visible) next.delete(blockId);
    else next.add(blockId);
    update({ hiddenBlocks: Array.from(next) });
  };

  return (
    <Section
      title="Görünürlük"
      description="Sitede görünmesini istemediğin bölümleri kapat. Kapatılan bölüm hiç çizilmez."
    >
      <div className="adm-toggle-list">
        {HIDEABLE_BLOCKS.map((blockId) => (
          <Toggle
            key={blockId}
            checked={!hidden.has(blockId)}
            onChange={(visible) => toggle(blockId, visible)}
            label={BLOCK_LABELS[blockId] ?? blockId}
          />
        ))}
      </div>
    </Section>
  );
}

function NoticesTab({ draft, update }: TabProps) {
  const notice = draft.notices.researchSample!;
  const banner = draft.notices.banner!;

  const patchNotice = (patch: Partial<typeof notice>) =>
    update({ notices: { ...draft.notices, researchSample: { ...notice, ...patch } } });
  const patchBanner = (patch: Partial<typeof banner>) =>
    update({ notices: { ...draft.notices, banner: { ...banner, ...patch } } });

  return (
    <>
      <Section
        title="Rapor kütüphanesi uyarısı"
        description="Kütüphane girişinde ve her dosyanın başlığında görünen sarı kutu."
      >
        <Toggle
          checked={notice.enabled}
          onChange={(enabled) => patchNotice({ enabled })}
          label="Uyarıyı göster"
          description="Gerçek raporları yayımladığında bunu kapatabilirsin."
        />
        <BilingualField label="Başlık" value={notice.title} onChange={(title) => patchNotice({ title })} />
        <BilingualField
          label="Açıklama"
          value={notice.text}
          multiline
          rows={4}
          onChange={(text) => patchNotice({ text })}
        />
      </Section>

      <Section title="Site duyuru bandı" description="Sayfanın en üstünde çıkan ince şerit. Ziyaretçi kapatabilir.">
        <Toggle checked={banner.enabled} onChange={(enabled) => patchBanner({ enabled })} label="Bandı göster" />
        <Field label="Renk">
          <select
            className="adm-input"
            value={banner.tone}
            onChange={(event) => patchBanner({ tone: event.target.value as typeof banner.tone })}
          >
            {BANNER_TONES.map((tone) => (
              <option key={tone} value={tone}>
                {BANNER_TONE_LABELS[tone]}
              </option>
            ))}
          </select>
        </Field>
        <BilingualField label="Mesaj" value={banner.text} multiline rows={2} onChange={(text) => patchBanner({ text })} />
        <BilingualField
          label="Bağlantı yazısı"
          value={banner.linkLabel ?? { tr: "", en: "" }}
          onChange={(linkLabel) => patchBanner({ linkLabel })}
          hint="Boş bırakılırsa bantta bağlantı çıkmaz."
        />
        <Field label="Bağlantı adresi">
          <TextInput
            value={banner.linkUrl ?? ""}
            placeholder="https://…"
            onChange={(linkUrl) => patchBanner({ linkUrl })}
          />
        </Field>
      </Section>
    </>
  );
}

/**
 * Elle güncellenen bir göstergenin bağlanabileceği kaynak varsa onu döndürür.
 * Kullanıcının açık "manuel" seçimini asla kendiliğinden ezmiyoruz; bunun
 * yerine tek tıkla bağlanacak bir öneri gösteriyoruz.
 */
function suggestionFor(id: string): (MacroSeriesDefault & { requiresKey?: string }) | null {
  return DEFAULT_MACRO_SERIES[id] ?? MACRO_SERIES_SUGGESTIONS[id] ?? null;
}

function ConnectSuggestion({
  suggestion,
  providerReady,
  onApply,
}: {
  suggestion: MacroSeriesDefault & { requiresKey?: string };
  providerReady: Partial<Record<(typeof MACRO_SOURCES)[number], boolean>>;
  onApply: (preset: Partial<MacroIndicatorContent>) => void;
}) {
  const needsKey = suggestion.requiresKey && providerReady[suggestion.source] === false;

  return (
    <div className="adm-suggestion">
      <div>
        <b>Bu gösterge otomatikleştirilebilir</b>
        <small>
          Kaynak: {MACRO_SOURCE_LABELS[suggestion.source]} · seri {suggestion.symbol}
          {needsKey ? ` — önce ${suggestion.requiresKey} tanımlanmalı` : ""}
        </small>
      </div>
      <button
        type="button"
        className="adm-btn small"
        disabled={Boolean(needsKey)}
        onClick={() =>
          onApply({
            source: suggestion.source,
            symbol: suggestion.symbol,
            display: suggestion.display,
            precision: suggestion.precision,
          })
        }
      >
        <Zap size={13} /> Kaynağa bağla
      </button>
    </div>
  );
}

function MacroTab({ draft, update }: TabProps) {
  const { indicators, snapshotDate } = draft.macro;
  const providers = trpc.macro.providers.useQuery(undefined, { staleTime: 60_000 });
  const providerReady: Partial<Record<(typeof MACRO_SOURCES)[number], boolean>> = providers.data ?? {};

  const patch = (index: number, value: Partial<MacroIndicatorContent>) =>
    update({
      macro: { snapshotDate, indicators: indicators.map((item, i) => (i === index ? { ...item, ...value } : item)) },
    });

  const setIndicators = (next: MacroIndicatorContent[]) => update({ macro: { snapshotDate, indicators: next } });

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= indicators.length) return;
    const next = [...indicators];
    [next[index], next[target]] = [next[target], next[index]];
    setIndicators(next);
  };

  const hasManual = indicators.some((item) => item.source === "manual");

  /**
   * Aynı seriye bağlanmış göstergeler. Hepsi aynı değeri gösterdiği için
   * gözden kaçması kolay; panelde açıkça uyarıyoruz.
   */
  const duplicateSeries = new Set(
    indicators
      .filter((item) => item.source !== "manual" && item.symbol)
      .map((item) => `${item.source}:${item.symbol}`)
      .filter((key, index, all) => all.indexOf(key) !== index)
  );

  const missingSeries = indicators.filter((item) => item.source !== "manual" && !item.symbol?.trim());

  /** Her göstergeyi bilinen kaynağına, bilineni yoksa manuele döndürür. */
  const resetSources = () => {
    update({
      macro: {
        snapshotDate,
        indicators: indicators.map((item) => {
          const preset = DEFAULT_MACRO_SERIES[item.id];
          if (preset) return { ...item, ...preset };
          return { ...item, source: "manual" as const, symbol: undefined };
        }),
      },
    });
    toast.success("Kaynaklar varsayılana döndürüldü. Kaydetmeyi unutmayın.");
  };

  return (
    <>
      <Section
        actions={
          <button type="button" className="adm-btn" onClick={resetSources}>
            <RotateCcw size={14} /> Varsayılan kaynaklara sıfırla
          </button>
        }
        title="Nasıl çalışıyor"
        description="Her gösterge bir API'ye bağlanabilir. Yahoo Finance, ECB Data Portal ve New York Fed anahtarsız çalışır. FRED ve TCMB EVDS ücretsizdir ama birer API anahtarı ister; anahtar tanımlanana kadar o göstergeleri elle güncelleyin."
      >
        <Field
          label="Manuel göstergelerin tarihi"
          hint="Panelin altında 'Manuel anlık görüntü · …' satırında görünür. Elle girdiğin değerleri tazeledikçe bunu da güncelle."
        >
          <TextInput
            type="date"
            value={snapshotDate}
            onChange={(next) => update({ macro: { snapshotDate: next, indicators } })}
          />
        </Field>
        {!hasManual && <p className="adm-count">Şu an tüm göstergeler canlı; bu tarih sitede görünmüyor.</p>}

        {duplicateSeries.size > 0 && (
          <div className="adm-alert error">
            <AlertTriangle size={15} />
            <div>
              <b>Birden fazla gösterge aynı seriye bağlı</b>
              <p>
                Aşağıdaki kartlarda aynı seri kullanılıyor, bu yüzden hepsi aynı değeri gösterir:{" "}
                <code>{Array.from(duplicateSeries).join(", ")}</code>. Her göstergeye kendi serisini verin
                veya "Varsayılan kaynaklara sıfırla" ile hepsini düzeltin.
              </p>
            </div>
          </div>
        )}

        {missingSeries.length > 0 && (
          <div className="adm-alert warn">
            <AlertTriangle size={15} />
            <div>
              <b>Seri kimliği boş</b>
              <p>
                Şu göstergelerin kaynağı seçili ama serisi girilmemiş:{" "}
                <code>{missingSeries.map((item) => item.label.tr || item.id).join(", ")}</code>. Sitede
                "VERİ YOK" görünürler.
              </p>
            </div>
          </div>
        )}

        <div className="adm-provider-grid">
          {MACRO_SOURCES.filter((source) => source !== "manual").map((source) => (
            <div key={source} className={`adm-provider ${providerReady[source] === false ? "is-off" : "is-on"}`}>
              <b>{MACRO_SOURCE_LABELS[source]}</b>
              <small>{providerReady[source] === false ? "API anahtarı gerekiyor" : "Hazır"}</small>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Göstergeler"
        description="Canlı göstergelerde değer ve günlük değişim Yahoo'dan gelir; sen yalnızca etiketi ve sembolü belirlersin."
        actions={
          <button
            type="button"
            className="adm-btn"
            onClick={() =>
              setIndicators([
                ...indicators,
                {
                  id: `gosterge-${indicators.length + 1}`,
                  source: "manual",
                  tone: "flat",
                  label: { tr: "", en: "" },
                  value: { tr: "", en: "" },
                  note: { tr: "", en: "" },
                },
              ])
            }
          >
            <Plus size={14} /> Gösterge ekle
          </button>
        }
      >
        <div className="adm-card-list">
          {indicators.map((item, index) => {
            const isLive = item.source !== "manual";
            return (
              <div
                key={item.id}
                className={`adm-card ${isLive ? "is-live" : ""} ${
                  item.symbol && duplicateSeries.has(`${item.source}:${item.symbol}`) ? "is-duplicate" : ""
                }`}
              >
                <div className="adm-card-head">
                  <b>
                    {item.label.tr || item.id}
                    {isLive && <span className="adm-live-chip">CANLI</span>}
                  </b>
                  <div className="adm-row-actions">
                    <button type="button" className="adm-icon-btn" onClick={() => move(index, -1)} aria-label="Yukarı">
                      ↑
                    </button>
                    <button type="button" className="adm-icon-btn" onClick={() => move(index, 1)} aria-label="Aşağı">
                      ↓
                    </button>
                    <button
                      type="button"
                      className="adm-icon-btn danger"
                      onClick={() => setIndicators(indicators.filter((_, i) => i !== index))}
                      aria-label="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <Field label="Veri kaynağı">
                  <select
                    className="adm-input"
                    value={item.source}
                    onChange={(event) => {
                      const source = event.target.value as MacroIndicatorContent["source"];
                      // Kaynak değişince seri kimliğini sıfırlıyoruz: bir kaynağın
                      // kodu diğerinde geçerli değil, eski değer sessizce hata verirdi.
                      const keepsSeries = source === item.source;
                      patch(index, {
                        source,
                        symbol: source === "manual" ? undefined : keepsSeries ? item.symbol : "",
                        display: source === "manual" ? item.display : item.display ?? "percent",
                        precision: source === "manual" ? item.precision : item.precision ?? 2,
                      });
                    }}
                  >
                    {MACRO_SOURCES.map((source) => (
                      <option key={source} value={source}>
                        {MACRO_SOURCE_LABELS[source]}
                      </option>
                    ))}
                  </select>
                </Field>

                <BilingualField label="Etiket" value={item.label} onChange={(label) => patch(index, { label })} />

                {!isLive && suggestionFor(item.id) && (
                  <ConnectSuggestion
                    suggestion={suggestionFor(item.id)!}
                    providerReady={providerReady}
                    onApply={(preset) => patch(index, preset)}
                  />
                )}

                {isLive ? (
                  <>
                    <Field label="Seri kimliği" hint={MACRO_SOURCE_HINTS[item.source]}>
                      <TextInput value={item.symbol ?? ""} onChange={(symbol) => patch(index, { symbol })} />
                    </Field>
                    {providerReady[item.source] === false && (
                      <div className="adm-alert warn">
                        <AlertTriangle size={14} />
                        <span>
                          Bu kaynak için API anahtarı tanımlı değil, gösterge sitede "VERİ YOK" görünür.
                          Vercel'e {item.source === "fred" ? "FRED_API_KEY" : "EVDS_API_KEY"} ekleyin.
                        </span>
                      </div>
                    )}
                    <div className="adm-grid-2">
                      <Field label="Gösterim">
                        <select
                          className="adm-input"
                          value={item.display ?? "percent"}
                          onChange={(event) =>
                            patch(index, { display: event.target.value as MacroIndicatorContent["display"] })
                          }
                        >
                          {MACRO_DISPLAYS.map((display) => (
                            <option key={display} value={display}>
                              {MACRO_DISPLAY_LABELS[display]}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Ondalık basamak">
                        <select
                          className="adm-input"
                          value={String(item.precision ?? 2)}
                          onChange={(event) => patch(index, { precision: Number(event.target.value) })}
                        >
                          {[0, 1, 2, 3, 4].map((digits) => (
                            <option key={digits} value={digits}>
                              {digits}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <p className="adm-field-hint">
                      Rozette günlük değişim yüzdesi görünür, rengi yönüne göre otomatik belirlenir.
                    </p>
                  </>
                ) : (
                  <>
                    <BilingualField label="Değer" value={item.value} onChange={(value) => patch(index, { value })} />
                    <BilingualField label="Not rozeti" value={item.note} onChange={(note) => patch(index, { note })} />
                    <Field label="Rozet rengi">
                      <select
                        className="adm-input"
                        value={item.tone}
                        onChange={(event) => patch(index, { tone: event.target.value as MacroIndicatorContent["tone"] })}
                      >
                        {MACRO_TONES.map((tone) => (
                          <option key={tone} value={tone}>
                            {MACRO_TONE_LABELS[tone]}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Section>
    </>
  );
}

function SessionsTab({ draft, update }: TabProps) {
  const sessions = draft.sessions;

  return (
    <Section
      title="Piyasa seansları"
      description="Açık/kapalı durumu borsanın saat diliminden otomatik hesaplanır; buradan yalnızca hangi borsaların listeleneceğini seçersin."
    >
      <div className="adm-toggle-list">
        {DEFAULT_SESSION_IDS.map((id) => (
          <Toggle
            key={id}
            checked={sessions.find((session) => session.id === id)?.enabled ?? true}
            label={SESSION_LABELS[id] ?? id}
            onChange={(next) =>
              update({
                sessions: DEFAULT_SESSION_IDS.map((sessionId) => ({
                  id: sessionId,
                  enabled: sessionId === id ? next : sessions.find((s) => s.id === sessionId)?.enabled ?? true,
                })),
              })
            }
          />
        ))}
      </div>
    </Section>
  );
}

function WatchlistTab({ draft, update }: TabProps) {
  const [text, setText] = useState(draft.watchlist.join("\n"));

  const apply = () => {
    const symbols = text
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
    update({ watchlist: symbols });
    toast.success(`${symbols.length} sembol listeye alındı.`);
  };

  return (
    <Section
      title="İzleme listesi"
      description="Panodaki varsayılan listede hangi semboller, hangi sırayla görünsün. Boş bırakırsan koddaki tam liste kullanılır."
      actions={
        <button type="button" className="adm-btn" onClick={apply}>
          <Check size={14} /> Listeyi uygula
        </button>
      }
    >
      <Field
        label="Semboller"
        hint="Her satıra bir sembol. Sitedeki adıyla yazın (örn. THYAO, BIST 100, S&P 500). Tanınmayanlar atlanır."
      >
        <textarea
          className="adm-input adm-textarea"
          rows={14}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
      </Field>
      <button
        type="button"
        className="adm-btn ghost small"
        onClick={() => {
          setText("");
          update({ watchlist: [] });
        }}
      >
        <RotateCcw size={13} /> Varsayılan listeye dön
      </button>
    </Section>
  );
}
