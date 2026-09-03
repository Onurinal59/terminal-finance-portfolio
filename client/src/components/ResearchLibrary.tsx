import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Grid2X2,
  LineChart,
  Mail,
  Printer,
  Search,
  Share2,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { researchReportsData, ResearchReport, ReportCategory } from "../data/researchReports";
import { gsap, useGSAP } from "../lib/gsap";

interface ResearchLibraryProps {
  onBack: () => void;
  onContact: (customSubject?: string) => void;
  onOpenSymbolChart?: (symbol: string) => void;
}

export const ResearchLibrary: React.FC<ResearchLibraryProps> = ({
  onBack,
  onContact,
  onOpenSymbolChart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("TÜMÜ");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReportId, setActiveReportId] = useState<string>(researchReportsData[0]?.id || "R-01");
  // "CATALOG" (grid of all reports) or "DOSSIER" (focused full reading room)
  const [readingMode, setReadingMode] = useState<"CATALOG" | "DOSSIER">("CATALOG");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      TÜMÜ: researchReportsData.length,
      EQUITY: 0,
      MOAT: 0,
      SECTOR: 0,
      MACRO: 0,
    };
    researchReportsData.forEach((r) => {
      if (counts[r.category] !== undefined) {
        counts[r.category] += 1;
      }
    });
    return counts;
  }, []);

  const filteredReports = useMemo(() => {
    let list = researchReportsData;
    if (selectedCategory !== "TÜMÜ") {
      list = list.filter((r) => r.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toUpperCase();
      list = list.filter(
        (r) =>
          r.ticker.toUpperCase().includes(q) ||
          r.title.toUpperCase().includes(q) ||
          r.subtitle.toUpperCase().includes(q) ||
          r.focus.toUpperCase().includes(q) ||
          r.categoryLabel.toUpperCase().includes(q)
      );
    }
    return list;
  }, [selectedCategory, searchQuery]);

  const activeReport = useMemo(() => {
    return (
      researchReportsData.find((r) => r.id === activeReportId) ||
      filteredReports[0] ||
      researchReportsData[0]
    );
  }, [activeReportId, filteredReports]);

  // Next report for the reading room footer teaser
  const nextReport = useMemo(() => {
    const currentIndex = researchReportsData.findIndex((r) => r.id === activeReport.id);
    if (currentIndex >= 0 && currentIndex < researchReportsData.length - 1) {
      return researchReportsData[currentIndex + 1];
    }
    return researchReportsData[0];
  }, [activeReport]);

  const handleOpenDossier = (id: string) => {
    setActiveReportId(id);
    setReadingMode("DOSSIER");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenPdf = (report: ResearchReport) => {
    if (report.pdfUrl) {
      const link = document.createElement("a");
      link.href = report.pdfUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${report.ticker} Raporu (PDF) Açılıyor`, {
        description: "PDF dokümanı yeni sekmede açıldı.",
      });
    } else {
      toast.info(`${report.ticker} PDF dosyası hazırlanıyor.`);
    }
  };

  const handleCopyShare = (report: ResearchReport) => {
    const text = `${report.title} - ${report.ticker} Analizi (Hedef: ${report.targetPrice || "N/A"}) - Onur İnal Araştırma Masası`;
    navigator.clipboard.writeText(text);
    toast.success("Rapor referansı ve başlığı panoya kopyalandı!");
  };

  const handlePrint = () => {
    window.print();
  };

  const libraryContainerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!libraryContainerRef.current) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>(".report-magazine-card");
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.06,
              ease: "power2.out",
              clearProps: "transform,opacity",
            }
          );
        }
      });

      return () => mm.revert();
    },
    { dependencies: [selectedCategory, searchQuery, readingMode], scope: libraryContainerRef }
  );

  return (
    <div ref={libraryContainerRef} className="terminal-research-desk" role="region" aria-label="Araştırma Raporları Kütüphanesi">
      {/* 1. TOP EDITORIAL BANNER */}
      <div className="research-desk-banner">
        <div className="banner-meta">
          <div className="banner-kicker">
            <span className="live-dot" />
            <span>ONUR İNAL // SERMAYE PİYASALARI & ARAŞTIRMA MASASI</span>
            <span className="banner-pill">MEASURE MOAT MODELLEMESİ</span>
          </div>
          <h1 className="banner-title">Araştırma Raporları & Şirket Değerleme Kütüphanesi</h1>
          <p className="banner-desc">
            İndirgenmiş Nakit Akımları (DCF), Ekonomik Hendek (Moat), Sermaye Getirisi (ROIC vs. WACC) ve
            TMS 29 Enflasyon Muhasebesi düzeltmeleriyle hazırlanmış kurumsal yatırım analizleri.
          </p>
        </div>

        <div className="banner-actions">
          {readingMode === "DOSSIER" ? (
            <button onClick={() => setReadingMode("CATALOG")} className="btn-terminal-secondary">
              <ArrowLeft size={14} /> TÜM RAPORLARA DÖN
            </button>
          ) : (
            <button onClick={onBack} className="btn-terminal-secondary">
              <Grid2X2 size={14} /> PANOYA DÖN
            </button>
          )}

          <button
            onClick={() => onContact(`Araştırma Dosyası & Model Talebi: ${activeReport.ticker}`)}
            className="btn-terminal-primary"
          >
            <Mail size={14} /> FİNANSAL MODEL TALEP ET
          </button>
        </div>
      </div>

      {/* 2. MODE: CATALOG (GRID VIEW WITH FEATURED REPORT) */}
      {readingMode === "CATALOG" && (
        <div className="research-catalog-wrapper">
          {/* Spotlight Featured Report */}
          {researchReportsData[0] && (
            <div className="featured-research-spotlight">
              <div className="spotlight-badge-row">
                <span className="spotlight-tag">
                  <Sparkles size={12} className="text-emerald-400" />
                  ÖNE ÇIKAN DEĞERLEME DOSYASI
                </span>
                <span className="spotlight-period">{researchReportsData[0].period}</span>
              </div>

              <div className="spotlight-content-grid">
                <div className="spotlight-main-col">
                  <div className="spotlight-ticker-group">
                    <span className="spotlight-ticker-badge">{researchReportsData[0].ticker}</span>
                    <span className="spotlight-cat-badge">{researchReportsData[0].categoryLabel}</span>
                    <span className={`spotlight-rec-badge rec-${researchReportsData[0].recommendationTone}`}>
                      {researchReportsData[0].recommendation}
                    </span>
                  </div>

                  <h2 className="spotlight-title">{researchReportsData[0].title}</h2>
                  <p className="spotlight-subtitle">{researchReportsData[0].subtitle}</p>

                  <p className="spotlight-thesis">
                    <strong>Yatırım Tezi:</strong> {researchReportsData[0].executiveSummary.slice(0, 240)}...
                  </p>

                  <div className="spotlight-actions">
                    <a
                      href={researchReportsData[0].pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-spotlight-read"
                      title="PDF Raporunu Aç"
                      onClick={() => {
                        toast.success(`${researchReportsData[0].ticker} Raporu (PDF) Açılıyor`);
                      }}
                    >
                      <FileText size={15} /> RAPORU OKU (PDF)
                      <ExternalLink size={14} />
                    </a>

                    <button
                      onClick={() => handleOpenDossier(researchReportsData[0].id)}
                      className="btn-spotlight-summary"
                      title="Yönetici Özeti ve Tezi İncele"
                    >
                      <BookOpen size={14} /> ÖZET & TEZ
                    </button>

                    {onOpenSymbolChart && (
                      <button
                        onClick={() => onOpenSymbolChart(researchReportsData[0].ticker)}
                        className="btn-spotlight-chart"
                      >
                        <LineChart size={14} /> CANLI GRAFİĞİ GÖR
                      </button>
                    )}
                  </div>
                </div>

                <div className="spotlight-valuation-card">
                  <span className="card-kicker">12 AYLIK MODEL PROJEKSİYONU</span>
                  <div className="spotlight-metric-main">
                    <span className="metric-lbl">HEDEF FİYAT</span>
                    <b className="metric-val">{researchReportsData[0].targetPrice}</b>
                  </div>

                  <div className="spotlight-submetrics">
                    <div className="submetric-box">
                      <span>Cari Referans</span>
                      <strong>{researchReportsData[0].currentPrice}</strong>
                    </div>
                    <div className="submetric-box highlight">
                      <span>Potansiyel Getiri</span>
                      <strong className="text-emerald-400">{researchReportsData[0].upsidePotential}</strong>
                    </div>
                  </div>

                  <div className="spotlight-method-note">
                    <span>Yöntem: {researchReportsData[0].methodology}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs & Search Bar */}
          <div className="research-desk-toolbar">
            <div className="toolbar-categories">
              <span className="toolbar-label">
                <Filter size={12} /> KATEGORİ:
              </span>
              <div className="category-button-group">
                {(
                  [
                    { id: "TÜMÜ", label: "TÜMÜ" },
                    { id: "EQUITY", label: "HİSSE DEĞERLEME" },
                    { id: "MOAT", label: "EKONOMİK HENDEK" },
                    { id: "SECTOR", label: "SEKTÖR ANALİZİ" },
                    { id: "MACRO", label: "MAKRO & TMS 29" },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab-btn ${selectedCategory === cat.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id as ReportCategory)}
                  >
                    <span>{cat.label}</span>
                    <small>({categoryCounts[cat.id] || 0})</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="toolbar-search-box">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Hisse kodu, sektör veya anahtar kelime ara (THYAO, BIMAS, Moat, TMS 29)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Research Reports Cards Grid */}
          <div className="reports-editorial-grid">
            {filteredReports.length === 0 ? (
              <div className="reports-empty-state">
                <Search size={32} className="text-slate-500 mb-2" />
                <h3>Arama kriterine uygun rapor bulunamadı</h3>
                <p>Arama terimini değiştirerek veya filtreleri temizleyerek tekrar deneyebilirsiniz.</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("TÜMÜ");
                  }}
                  className="btn-reset-filters"
                >
                  Tüm Raporları Göster
                </button>
              </div>
            ) : (
              filteredReports.map((report) => (
                <article key={report.id} className="report-magazine-card">
                  <div className="card-top-header">
                    <div className="card-ticker-wrap">
                      <span className="card-ticker-pill">{report.ticker}</span>
                      <span className="card-cat-pill">{report.categoryLabel}</span>
                    </div>
                    <span className={`card-rec-pill rec-${report.recommendationTone}`}>
                      {report.recommendation}
                    </span>
                  </div>

                  <h3 className="card-title">{report.title}</h3>
                  <p className="card-subtitle">{report.subtitle}</p>

                  {report.targetPrice && (
                    <div className="card-target-banner">
                      <div className="target-figure">
                        <span className="lbl">Hedef Fiyat</span>
                        <b className="val">{report.targetPrice}</b>
                      </div>
                      {report.upsidePotential && (
                        <div className="upside-figure">
                          <TrendingUp size={12} className="text-emerald-400" />
                          <span className="val">{report.upsidePotential}</span>
                          <span className="lbl">Potansiyel</span>
                        </div>
                      )}
                      <div className="period-figure">
                        <span className="lbl">Dönem</span>
                        <span className="val">{report.period}</span>
                      </div>
                    </div>
                  )}

                  <p className="card-thesis-snippet">
                    {report.executiveSummary.slice(0, 160)}...
                  </p>

                  <div className="card-footer-actions">
                    <div className="card-meta-author">
                      <span className="author-name">{report.author}</span>
                      <span className="author-read">{report.readTime}</span>
                    </div>

                    <div className="card-action-btns">
                      {onOpenSymbolChart && report.ticker && !report.ticker.includes("-") && (
                        <button
                          onClick={() => onOpenSymbolChart(report.ticker)}
                          className="btn-card-chart"
                          title="Canlı Grafiği Aç"
                        >
                          <LineChart size={13} /> Grafik
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenDossier(report.id)}
                        className="btn-card-dossier"
                        title="Yönetici Özeti ve Metrikleri İncele"
                      >
                        <BookOpen size={13} /> Özet
                      </button>

                      <a
                        href={report.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-card-read"
                        title="PDF Raporunu Aç"
                        onClick={() => {
                          toast.success(`${report.ticker} Raporu (PDF) Açılıyor`);
                        }}
                      >
                        <FileText size={13} /> Raporu Oku (PDF)
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      )}

      {/* 3. MODE: DOSSIER (FOCUSED INSTITUTIONAL READING ROOM) */}
      {readingMode === "DOSSIER" && activeReport && (
        <div className="research-dossier-reading-room">
          {/* Sticky Reader Navigation Bar */}
          <div className="reader-sticky-nav">
            <button onClick={() => setReadingMode("CATALOG")} className="btn-back-catalog">
              <ArrowLeft size={15} /> TÜM RAPORLAR KÜTÜPHANESİNE DÖN
            </button>

            <div className="reader-center-ticker">
              <span className="ticker-badge">{activeReport.ticker}</span>
              <span className="title-preview">{activeReport.title.slice(0, 48)}...</span>
            </div>

            <div className="reader-action-group">
              <button
                onClick={() => handleOpenPdf(activeReport)}
                className="btn-reader-pdf"
                title="PDF Raporunu Yeni Sekmede Aç / İndir"
              >
                <FileText size={14} /> PDF RAPORU AÇ <ExternalLink size={12} />
              </button>

              {onOpenSymbolChart && activeReport.ticker && !activeReport.ticker.includes("-") && (
                <button
                  onClick={() => onOpenSymbolChart(activeReport.ticker)}
                  className="btn-reader-chart"
                >
                  <LineChart size={14} /> CANLI GRAFİĞİ AÇ
                </button>
              )}

              <button onClick={() => handleCopyShare(activeReport)} className="btn-reader-icon" title="Paylaş">
                <Share2 size={14} />
              </button>

              <button onClick={handlePrint} className="btn-reader-icon" title="Yazdır">
                <Printer size={14} />
              </button>
            </div>
          </div>

          {/* Dossier Document Paper */}
          <article className="dossier-document-paper">
            {/* Header / Masthead */}
            <div className="paper-masthead">
              <div className="masthead-pills">
                <span className="pill-ticker">{activeReport.ticker}</span>
                <span className="pill-cat">{activeReport.categoryLabel}</span>
                <span className={`pill-rec rec-${activeReport.recommendationTone}`}>
                  {activeReport.recommendation}
                </span>
                <span className="pill-code">DOSYA ID: {activeReport.id}</span>
              </div>

              <h1 className="paper-doc-title">{activeReport.title}</h1>
              <p className="paper-doc-subtitle">{activeReport.subtitle}</p>

              <div className="paper-byline-bar">
                <div className="byline-item author">
                  <span>ANALİST</span>
                  <b>{activeReport.author}</b>
                  <small>({activeReport.authorTitle})</small>
                </div>
                <div className="byline-item date">
                  <CalendarDays size={14} />
                  <span>{activeReport.period}</span>
                </div>
                <div className="byline-item duration">
                  <Clock size={14} />
                  <span>{activeReport.readTime}</span>
                </div>
                <div className="byline-item source">
                  <ExternalLink size={14} />
                  <span>{activeReport.source}</span>
                </div>
              </div>

              {/* PDF Direct Access Banner */}
              <div className="paper-pdf-callout">
                <div className="pdf-callout-info">
                  <FileText size={18} className="text-emerald-400" />
                  <div>
                    <strong>Resmi Araştırma Raporu Belgesi (PDF)</strong>
                    <p>Metodoloji, duyarlılık matrisleri ve kapsamlı projeksiyonlar.</p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenPdf(activeReport)}
                  className="btn-callout-pdf"
                  title="PDF Raporunu Yeni Sekmede Aç"
                >
                  <Download size={14} /> PDF RAPORU GÖRÜNTÜLE
                  <ExternalLink size={13} />
                </button>
              </div>
            </div>

            {/* Target Price & Valuation Highlights Matrix */}
            {activeReport.targetPrice && (
              <div className="dossier-valuation-highlight-strip">
                <div className="val-stat-box target">
                  <span className="stat-lbl">HEDEF FİYAT (12 AY)</span>
                  <b className="stat-num text-emerald-400">{activeReport.targetPrice}</b>
                  <small className="stat-note">Model Değerleme Hedefi</small>
                </div>

                {activeReport.currentPrice && (
                  <div className="val-stat-box current">
                    <span className="stat-lbl">CARİ REFERANS FİYAT</span>
                    <b className="stat-num">{activeReport.currentPrice}</b>
                    <small className="stat-note">Model Başlangıç Değeri</small>
                  </div>
                )}

                {activeReport.upsidePotential && (
                  <div className="val-stat-box upside">
                    <span className="stat-lbl">POTANSİYEL GETİRİ</span>
                    <b className="stat-num text-emerald-400">{activeReport.upsidePotential}</b>
                    <small className="stat-note">Piyasa Fiyatına Göre İskonto</small>
                  </div>
                )}

                <div className="val-stat-box method">
                  <span className="stat-lbl">DEĞERLEME METODU</span>
                  <span className="stat-method-desc">{activeReport.methodology}</span>
                  <small className="stat-note">Ağırlıklı Hibrit Projeksiyon</small>
                </div>
              </div>
            )}

            {/* Section 1: Executive Summary & Thesis */}
            <section className="paper-section">
              <div className="paper-section-head">
                <span className="sec-indicator" />
                <h3>YÖNETİCİ ÖZETİ & YATIRIM TEZİ</h3>
              </div>
              <div className="paper-executive-card">
                <p className="executive-body">{activeReport.executiveSummary}</p>
                <div className="executive-focus-strip">
                  <b>Araştırma Odak Noktası:</b>
                  <span>{activeReport.focus}</span>
                </div>
              </div>
            </section>

            {/* Section 2: Valuation & Fundamental Metrics */}
            {activeReport.valuationMetrics && activeReport.valuationMetrics.length > 0 && (
              <section className="paper-section">
                <div className="paper-section-head">
                  <span className="sec-indicator" />
                  <h3>FİNANSAL GÖSTERGELER & MODEL MATRİSİ</h3>
                  <span className="head-badge">SEKTÖR BENCHMARK</span>
                </div>
                <div className="metrics-cards-grid">
                  {activeReport.valuationMetrics.map((metric, idx) => (
                    <div key={idx} className="metric-cell-box">
                      <span className="metric-label">{metric.label}</span>
                      <b className="metric-value">{metric.value}</b>
                      {metric.benchmark && (
                        <div className="metric-bench-row">
                          <span className="bench-dot" />
                          <span>{metric.benchmark}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Catalysts */}
            {activeReport.keyCatalysts && activeReport.keyCatalysts.length > 0 && (
              <section className="paper-section">
                <div className="paper-section-head">
                  <span className="sec-indicator" />
                  <h3>STRATEJİK YATIRIM KATALİZÖRLERİ</h3>
                </div>
                <div className="catalysts-structured-list">
                  {activeReport.keyCatalysts.map((cat, idx) => {
                    const parts = cat.split(":");
                    const title = parts.length > 1 ? parts[0] : `Katalizör 0${idx + 1}`;
                    const desc = parts.length > 1 ? parts.slice(1).join(":") : cat;
                    return (
                      <div key={idx} className="catalyst-row-card">
                        <div className="catalyst-number">0{idx + 1}</div>
                        <div className="catalyst-text">
                          <h4>{title.trim()}</h4>
                          <p>{desc.trim()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Section 4: Drivers vs. Risks */}
            <div className="paper-drivers-risks-layout">
              {/* Financial & Operational Drivers */}
              <section className="column-card drivers">
                <div className="col-header text-emerald-400">
                  <CheckCircle2 size={16} />
                  <h4>FİNANSAL & OPERASYONEL SÜRÜCÜLER</h4>
                </div>
                <div className="col-points-list">
                  {activeReport.financialDrivers.map((driver, idx) => (
                    <div key={idx} className="col-point-item green">
                      <span className="point-bullet" />
                      <p>{driver}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Risks & Sensitivities */}
              <section className="column-card risks">
                <div className="col-header text-rose-400">
                  <ShieldAlert size={16} />
                  <h4>TEMEL RİSKLER & OYNAKLIK UNSURLARI</h4>
                </div>
                <div className="col-points-list">
                  {activeReport.risks.map((risk, idx) => (
                    <div key={idx} className="col-point-item red">
                      <span className="point-bullet" />
                      <p>{risk}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Section 5: Analyst Conclusion & Signature Box */}
            <section className="analyst-verdict-box">
              <div className="verdict-header">
                <Sparkles size={16} className="text-cyan-400" />
                <h3>ANALİST SONUÇ DEĞERLENDİRMESİ</h3>
              </div>
              <p className="verdict-text">{activeReport.analystNote}</p>

              <div className="analyst-credentials-strip">
                <div className="analyst-bio">
                  <b className="analyst-name">{activeReport.author}</b>
                  <span className="analyst-degrees">
                    Finansal Analist · Afyon Kocatepe Üniversitesi · Uluslararası Ticaret ve Finansman & İktisat (Çift Ana Dal)
                  </span>
                  <small className="analyst-moat">Measure Moat Metodolojisi & BIST Hisse Araştırma Masası</small>
                </div>

                <button
                  onClick={() =>
                    onContact(`Finansal Model Talebi: ${activeReport.ticker} (${activeReport.title})`)
                  }
                  className="btn-request-full-model"
                >
                  <Mail size={14} /> BU FİNANSAL MODELİ TALEP ET
                </button>
              </div>
            </section>

            {/* Section 6: Legal Regulatory Notice */}
            <div className="dossier-legal-notice">
              <ShieldAlert size={15} className="text-amber-400 flex-shrink-0" />
              <p>
                <strong>YASAL UYARI (SPK MEVZUATI):</strong> Bu araştırma raporu ve şirket değerleme dosyası,
                Onur İnal’ın akademik ve kişisel finansal analiz portfolyosu kapsamında hazırlanmıştır.
                Burada yer alan hiçbir veri, hedef fiyat veya getiri projeksiyonu yatırım danışmanlığı kapsamında
                değildir (Yatırım Tavsiyesi Değildir - YTD).
              </p>
            </div>

            {/* Next Report Teaser */}
            {nextReport && nextReport.id !== activeReport.id && (
              <div className="next-dossier-teaser" onClick={() => handleOpenDossier(nextReport.id)}>
                <div className="teaser-content">
                  <span className="teaser-kicker">SIRADAKİ ARAŞTIRMA DOSYASI</span>
                  <h4 className="teaser-title">{nextReport.title}</h4>
                  <span className="teaser-pill">
                    {nextReport.ticker} · {nextReport.recommendation}
                  </span>
                </div>
                <div className="teaser-arrow-btn">
                  <span>Sonraki Raporu Oku</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  );
};
