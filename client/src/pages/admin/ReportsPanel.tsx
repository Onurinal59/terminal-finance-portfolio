/** Rapor kütüphanesi yönetimi: ekle, düzenle, yayımla, PDF yükle, sil. */
import { useMemo, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Copy, FileUp, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  REPORT_CATEGORIES,
  REPORT_TONES,
  type Locale,
  type ReportContent,
  type ReportCopyContent,
} from "@shared/siteContent";
import { Field, Section, StringListEditor, TextArea, TextInput, Toggle } from "./fields";

const EMPTY_COPY: ReportCopyContent = {
  title: "",
  subtitle: "",
  categoryLabel: "",
  recommendation: "",
  period: "",
  readTime: "",
  authorTitle: "",
  focus: "",
  executiveSummary: "",
  keyCatalysts: [],
  valuationMetrics: [],
  financialDrivers: [],
  risks: [],
  analystNote: "",
  methodology: "",
  source: "",
};

const CATEGORY_LABELS: Record<(typeof REPORT_CATEGORIES)[number], string> = {
  EQUITY: "Hisse değerleme",
  MOAT: "Ekonomik hendek",
  SECTOR: "Sektör analizi",
  MACRO: "Makro & TMS 29",
};

const TONE_LABELS: Record<(typeof REPORT_TONES)[number], string> = {
  bullish: "Pozitif (yeşil)",
  moat: "Hendek (mavi)",
  neutral: "Nötr (gri)",
  highlight: "Öne çıkan (mor)",
};

function makeId(existing: ReportContent[]) {
  let index = existing.length + 1;
  let candidate = `R-${String(index).padStart(2, "0")}`;
  while (existing.some((report) => report.id === candidate)) {
    index += 1;
    candidate = `R-${String(index).padStart(2, "0")}`;
  }
  return candidate;
}

function emptyReport(existing: ReportContent[]): ReportContent {
  return {
    id: makeId(existing),
    ticker: "YENİ",
    category: "EQUITY",
    recommendationTone: "neutral",
    author: "Onur İnal",
    link: "",
    published: false,
    copy: { tr: { ...EMPTY_COPY }, en: { ...EMPTY_COPY } },
  };
}

export function ReportsPanel({
  reports,
  onChange,
}: {
  reports: ReportContent[];
  onChange: (next: ReportContent[]) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(reports[0]?.id ?? null);
  const [copyLocale, setCopyLocale] = useState<Locale>("tr");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selected = useMemo(
    () => reports.find((report) => report.id === selectedId) ?? null,
    [reports, selectedId]
  );

  const patchReport = (patch: Partial<ReportContent>) => {
    if (!selected) return;
    onChange(reports.map((report) => (report.id === selected.id ? { ...report, ...patch } : report)));
  };

  const patchCopy = (patch: Partial<ReportCopyContent>) => {
    if (!selected) return;
    patchReport({
      copy: { ...selected.copy, [copyLocale]: { ...selected.copy[copyLocale], ...patch } },
    });
  };

  const addReport = () => {
    const created = emptyReport(reports);
    onChange([...reports, created]);
    setSelectedId(created.id);
  };

  const duplicateReport = () => {
    if (!selected) return;
    const copy: ReportContent = {
      ...structuredClone(selected),
      id: makeId(reports),
      published: false,
    };
    onChange([...reports, copy]);
    setSelectedId(copy.id);
  };

  const removeReport = () => {
    if (!selected) return;
    if (!window.confirm(`"${selected.ticker}" raporu silinsin mi? Bu işlem kaydedince kalıcı olur.`)) return;
    const next = reports.filter((report) => report.id !== selected.id);
    onChange(next);
    setSelectedId(next[0]?.id ?? null);
  };

  const move = (direction: -1 | 1) => {
    if (!selected) return;
    const index = reports.findIndex((report) => report.id === selected.id);
    const target = index + direction;
    if (target < 0 || target >= reports.length) return;
    const next = [...reports];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleUpload = async (file: File) => {
    if (!selected) return;
    if (file.type !== "application/pdf") {
      toast.error("Yalnızca PDF yükleyebilirsiniz.");
      return;
    }
    setUploading(true);
    try {
      const safeName = file.name.replace(/[^\w.\-]+/g, "-");
      const blob = await upload(`reports/${selected.ticker}-${safeName}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload",
      });
      patchReport({ pdfUrl: blob.url });
      toast.success("PDF yüklendi. Değişikliği kaydetmeyi unutmayın.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yükleme başarısız");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const copy = selected?.copy[copyLocale];

  return (
    <Section
      title="Raporlar"
      description="Kütüphanedeki her dosyayı buradan düzenleyin. Yayımlanmayanlar sitede görünmez."
      actions={
        <button type="button" className="adm-btn" onClick={addReport}>
          <Plus size={14} /> Yeni rapor
        </button>
      }
    >
      <div className="adm-split">
        <aside className="adm-report-list">
          {reports.length === 0 && <p className="adm-empty">Henüz rapor yok. "Yeni rapor" ile başlayın.</p>}
          {reports.map((report) => (
            <button
              type="button"
              key={report.id}
              className={`adm-report-row ${report.id === selectedId ? "is-active" : ""}`}
              onClick={() => setSelectedId(report.id)}
            >
              <span className="adm-report-ticker">{report.ticker}</span>
              <span className="adm-report-title">{report.copy.tr.title || "(başlıksız)"}</span>
              <span className={`adm-report-state ${report.published ? "on" : "off"}`}>
                {report.published ? "Yayında" : "Taslak"}
              </span>
            </button>
          ))}
        </aside>

        <div className="adm-report-editor">
          {!selected && <p className="adm-empty">Düzenlemek için soldan bir rapor seçin.</p>}

          {selected && (
            <>
              <div className="adm-row-actions">
                <button type="button" className="adm-btn ghost small" onClick={() => move(-1)}>
                  Yukarı taşı
                </button>
                <button type="button" className="adm-btn ghost small" onClick={() => move(1)}>
                  Aşağı taşı
                </button>
                <button type="button" className="adm-btn ghost small" onClick={duplicateReport}>
                  <Copy size={13} /> Kopyala
                </button>
                <button type="button" className="adm-btn danger small" onClick={removeReport}>
                  <Trash2 size={13} /> Sil
                </button>
              </div>

              <Toggle
                checked={selected.published}
                onChange={(published) => patchReport({ published })}
                label="Sitede yayımla"
                description="Kapalıyken rapor yalnızca bu panelde görünür."
              />

              <div className="adm-grid-2">
                <Field label="Hisse / kod">
                  <TextInput value={selected.ticker} onChange={(ticker) => patchReport({ ticker })} />
                </Field>
                <Field label="Dosya kimliği" hint="Değiştirmeniz gerekmez.">
                  <TextInput value={selected.id} onChange={(id) => patchReport({ id })} />
                </Field>
                <Field label="Kategori">
                  <select
                    className="adm-input"
                    value={selected.category}
                    onChange={(event) => patchReport({ category: event.target.value as ReportContent["category"] })}
                  >
                    {REPORT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {CATEGORY_LABELS[category]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Tavsiye rozeti rengi">
                  <select
                    className="adm-input"
                    value={selected.recommendationTone}
                    onChange={(event) =>
                      patchReport({ recommendationTone: event.target.value as ReportContent["recommendationTone"] })
                    }
                  >
                    {REPORT_TONES.map((tone) => (
                      <option key={tone} value={tone}>
                        {TONE_LABELS[tone]}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Hedef fiyat" hint="Boş bırakılırsa değerleme şeridi gizlenir.">
                  <TextInput value={selected.targetPrice ?? ""} onChange={(targetPrice) => patchReport({ targetPrice })} />
                </Field>
                <Field label="Cari referans fiyat">
                  <TextInput value={selected.currentPrice ?? ""} onChange={(currentPrice) => patchReport({ currentPrice })} />
                </Field>
                <Field label="Potansiyel getiri">
                  <TextInput
                    value={selected.upsidePotential ?? ""}
                    onChange={(upsidePotential) => patchReport({ upsidePotential })}
                  />
                </Field>
                <Field label="Yazar">
                  <TextInput value={selected.author} onChange={(author) => patchReport({ author })} />
                </Field>
                <Field label="Dış bağlantı">
                  <TextInput value={selected.link} onChange={(link) => patchReport({ link })} />
                </Field>
              </div>

              <div className="adm-pdf-box">
                <div>
                  <b>PDF dosyası</b>
                  {selected.pdfUrl ? (
                    <p>
                      <a href={selected.pdfUrl} target="_blank" rel="noreferrer">
                        Yüklü dosyayı aç
                      </a>
                    </p>
                  ) : (
                    <p>Yüklü dosya yok — rapor yalnızca site içinde okunur.</p>
                  )}
                </div>
                <div className="adm-pdf-actions">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file);
                    }}
                  />
                  <button
                    type="button"
                    className="adm-btn small"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileUp size={13} /> {uploading ? "Yükleniyor…" : "PDF yükle"}
                  </button>
                  {selected.pdfUrl && (
                    <button
                      type="button"
                      className="adm-btn ghost small"
                      onClick={() => patchReport({ pdfUrl: undefined })}
                    >
                      <X size={13} /> Bağlantıyı kaldır
                    </button>
                  )}
                </div>
              </div>

              <div className="adm-locale-tabs">
                {(["tr", "en"] as Locale[]).map((locale) => (
                  <button
                    type="button"
                    key={locale}
                    className={copyLocale === locale ? "is-active" : ""}
                    onClick={() => setCopyLocale(locale)}
                  >
                    {locale === "tr" ? "Türkçe metin" : "İngilizce metin"}
                  </button>
                ))}
              </div>

              {copy && (
                <div className="adm-copy-editor">
                  <Field label="Başlık">
                    <TextArea value={copy.title} rows={2} onChange={(title) => patchCopy({ title })} />
                  </Field>
                  <Field label="Alt başlık">
                    <TextArea value={copy.subtitle} rows={2} onChange={(subtitle) => patchCopy({ subtitle })} />
                  </Field>
                  <div className="adm-grid-2">
                    <Field label="Kategori etiketi">
                      <TextInput value={copy.categoryLabel} onChange={(categoryLabel) => patchCopy({ categoryLabel })} />
                    </Field>
                    <Field label="Tavsiye metni">
                      <TextInput value={copy.recommendation} onChange={(recommendation) => patchCopy({ recommendation })} />
                    </Field>
                    <Field label="Dönem">
                      <TextInput value={copy.period} onChange={(period) => patchCopy({ period })} />
                    </Field>
                    <Field label="Okuma süresi">
                      <TextInput value={copy.readTime} onChange={(readTime) => patchCopy({ readTime })} />
                    </Field>
                    <Field label="Yazar unvanı">
                      <TextInput value={copy.authorTitle} onChange={(authorTitle) => patchCopy({ authorTitle })} />
                    </Field>
                    <Field label="Kaynak">
                      <TextInput value={copy.source} onChange={(source) => patchCopy({ source })} />
                    </Field>
                  </div>
                  <Field label="Araştırma odak noktası">
                    <TextArea value={copy.focus} rows={3} onChange={(focus) => patchCopy({ focus })} />
                  </Field>
                  <Field label="Yönetici özeti">
                    <TextArea
                      value={copy.executiveSummary}
                      rows={7}
                      onChange={(executiveSummary) => patchCopy({ executiveSummary })}
                    />
                  </Field>
                  <StringListEditor
                    label="Stratejik katalizörler"
                    items={copy.keyCatalysts}
                    addLabel="Katalizör ekle"
                    onChange={(keyCatalysts) => patchCopy({ keyCatalysts })}
                  />
                  <MetricsEditor
                    metrics={copy.valuationMetrics}
                    onChange={(valuationMetrics) => patchCopy({ valuationMetrics })}
                  />
                  <StringListEditor
                    label="Finansal & operasyonel sürücüler"
                    items={copy.financialDrivers}
                    addLabel="Sürücü ekle"
                    onChange={(financialDrivers) => patchCopy({ financialDrivers })}
                  />
                  <StringListEditor
                    label="Temel riskler"
                    items={copy.risks}
                    addLabel="Risk ekle"
                    onChange={(risks) => patchCopy({ risks })}
                  />
                  <Field label="Analist sonuç değerlendirmesi">
                    <TextArea value={copy.analystNote} rows={5} onChange={(analystNote) => patchCopy({ analystNote })} />
                  </Field>
                  <Field label="Yöntem">
                    <TextArea value={copy.methodology} rows={2} onChange={(methodology) => patchCopy({ methodology })} />
                  </Field>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}

function MetricsEditor({
  metrics,
  onChange,
}: {
  metrics: ReportCopyContent["valuationMetrics"];
  onChange: (next: ReportCopyContent["valuationMetrics"]) => void;
}) {
  const patch = (index: number, value: Partial<ReportCopyContent["valuationMetrics"][number]>) => {
    onChange(metrics.map((metric, i) => (i === index ? { ...metric, ...value } : metric)));
  };

  return (
    <div className="adm-field">
      <span className="adm-field-label">Finansal göstergeler tablosu</span>
      <div className="adm-list">
        {metrics.map((metric, index) => (
          <div key={index} className="adm-metric-row">
            <TextInput value={metric.label} placeholder="Etiket" onChange={(label) => patch(index, { label })} />
            <TextInput value={metric.value} placeholder="Değer" onChange={(value) => patch(index, { value })} />
            <TextInput
              value={metric.benchmark ?? ""}
              placeholder="Karşılaştırma"
              onChange={(benchmark) => patch(index, { benchmark })}
            />
            <label className="adm-check">
              <input
                type="checkbox"
                checked={metric.isPositive ?? false}
                onChange={(event) => patch(index, { isPositive: event.target.checked })}
              />
              Olumlu
            </label>
            <button
              type="button"
              className="adm-icon-btn danger"
              onClick={() => onChange(metrics.filter((_, i) => i !== index))}
              aria-label="Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="adm-btn ghost small"
        onClick={() => onChange([...metrics, { label: "", value: "" }])}
      >
        <Plus size={13} /> Gösterge ekle
      </button>
    </div>
  );
}
