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
  Check,
  Loader2,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { HIDEABLE_BLOCKS, MACRO_TONES, BANNER_TONES } from "@shared/siteContent";
import type { MacroIndicatorContent } from "@shared/siteContent";
import { trpc } from "@/lib/trpc";
import { DEFAULT_SESSION_IDS } from "@/content/defaults";
import { DEFAULT_WATCHLIST_SYMBOLS } from "./Home";
import { BilingualField, Field, Section, TextInput, Toggle } from "./admin/fields";
import { ReportsPanel } from "./admin/ReportsPanel";
import { TextsPanel } from "./admin/TextsPanel";
import { buildWorkingDraft, toDraftPayload, useDraft, type WorkingDraft } from "./admin/useDraft";
import "./admin/admin.css";

const TABS = [
  { id: "reports", label: "Raporlar" },
  { id: "texts", label: "Metinler" },
  { id: "visibility", label: "Görünürlük" },
  { id: "notices", label: "Uyarılar" },
  { id: "macro", label: "Makro" },
  { id: "sessions", label: "Seanslar" },
  { id: "watchlist", label: "İzleme listesi" },
] as const;
type TabId = (typeof TABS)[number]["id"];

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

  const missingConfig = status.data?.missingConfig ?? [];
  const session = status.data?.session ?? null;

  if (!session) {
    return <LoginScreen missingConfig={missingConfig} loginError={loginError} />;
  }

  return (
    <Editor
      email={session.email}
      name={session.name}
      storageReady={status.data?.storageReady ?? false}
    />
  );
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
  const [ready, setReady] = useState(false);
  const { draft, update, isDirty, reset } = useDraft(
    buildWorkingDraft({ schemaVersion: 1, revision: 0, updatedAt: "" }, DEFAULT_WATCHLIST_SYMBOLS)
  );
  const [revision, setRevision] = useState(0);

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

  return (
    <div className="adm-shell">
      <header className="adm-topbar">
        <div className="adm-topbar-left">
          <a href="/" className="adm-back-link">
            <ArrowLeft size={14} /> Site
          </a>
          <span className="adm-title">Yönetim Paneli</span>
          <span className="adm-revision">sürüm {revision}</span>
        </div>
        <div className="adm-topbar-right">
          <span className="adm-user" title={email}>
            {name}
          </span>
          <button type="button" className="adm-btn ghost small" onClick={logout}>
            <LogOut size={13} /> Çıkış
          </button>
          <button
            type="button"
            className="adm-btn primary"
            onClick={save}
            disabled={!isDirty || saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 size={14} className="adm-spin" /> : <Save size={14} />}
            {isDirty ? "Kaydet" : "Kaydedildi"}
          </button>
        </div>
      </header>

      {!storageReady && (
        <div className="adm-alert warn adm-inline-alert">
          <AlertTriangle size={15} />
          <div>
            <b>Depo bağlı değil</b>
            <p>
              Vercel panelinden bir Blob Store oluşturup projeye bağlayın (<code>BLOB_READ_WRITE_TOKEN</code>).
              O zamana kadar kaydetme çalışmaz.
            </p>
          </div>
        </div>
      )}

      <nav className="adm-tabs">
        {TABS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={tab === item.id ? "is-active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main className="adm-main">
        {tab === "reports" && (
          <ReportsPanel reports={draft.reports} onChange={(reports) => update({ reports })} />
        )}

        {tab === "texts" && (
          <TextsPanel
            overrides={draft.translations}
            onChange={(translations) => update({ translations })}
          />
        )}

        {tab === "visibility" && <VisibilityTab draft={draft} update={update} />}
        {tab === "notices" && <NoticesTab draft={draft} update={update} />}
        {tab === "macro" && <MacroTab draft={draft} update={update} />}
        {tab === "sessions" && <SessionsTab draft={draft} update={update} />}
        {tab === "watchlist" && <WatchlistTab draft={draft} update={update} />}
      </main>
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
      description="Sitede görünmesini istemediğin bölümleri kapat. Kapatılan bölüm hiç render edilmez."
    >
      <div className="adm-toggle-list">
        {HIDEABLE_BLOCKS.map((blockId) => (
          <Toggle
            key={blockId}
            checked={!hidden.has(blockId)}
            onChange={(visible) => toggle(blockId, visible)}
            label={BLOCK_LABELS[blockId] ?? blockId}
            description={blockId}
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

function MacroTab({ draft, update }: TabProps) {
  const { indicators, snapshotDate } = draft.macro;

  const patch = (index: number, value: Partial<MacroIndicatorContent>) =>
    update({
      macro: {
        snapshotDate,
        indicators: indicators.map((item, i) => (i === index ? { ...item, ...value } : item)),
      },
    });

  const setIndicators = (next: MacroIndicatorContent[]) => update({ macro: { snapshotDate, indicators: next } });

  return (
    <Section
      title="Makro göstergeler"
      description="Bu değerler canlı bir kaynaktan gelmez; elle güncellenir. Tarihi de güncellemeyi unutma."
      actions={
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            setIndicators([
              ...indicators,
              {
                id: `gosterge-${indicators.length + 1}`,
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
      <Field label="Anlık görüntü tarihi" hint="Panelin altında 'Manuel anlık görüntü · …' satırında görünür.">
        <TextInput
          type="date"
          value={snapshotDate}
          onChange={(next) => update({ macro: { snapshotDate: next, indicators } })}
        />
      </Field>

      <div className="adm-card-list">
        {indicators.map((item, index) => (
          <div key={item.id} className="adm-card">
            <div className="adm-card-head">
              <b>{item.label.tr || item.id}</b>
              <button
                type="button"
                className="adm-icon-btn danger"
                onClick={() => setIndicators(indicators.filter((_, i) => i !== index))}
                aria-label="Sil"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <BilingualField label="Etiket" value={item.label} onChange={(label) => patch(index, { label })} />
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
          </div>
        ))}
      </div>
    </Section>
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
        {DEFAULT_SESSION_IDS.map((id) => {
          const entry = sessions.find((session) => session.id === id);
          const enabled = entry?.enabled ?? true;
          return (
            <Toggle
              key={id}
              checked={enabled}
              label={SESSION_LABELS[id] ?? id}
              onChange={(next) =>
                update({
                  sessions: DEFAULT_SESSION_IDS.map((sessionId) => ({
                    id: sessionId,
                    enabled:
                      sessionId === id ? next : sessions.find((s) => s.id === sessionId)?.enabled ?? true,
                  })),
                })
              }
            />
          );
        })}
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
