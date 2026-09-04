import React, { useState, useMemo, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Grid2X2,
  FileText,
  Info,
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
import { useContent } from "@/content/ContentContext";
import { type ResearchReport, type ReportCategory } from "../data/researchReports";
import { gsap, useGSAP } from "../lib/gsap";
import { useI18n, type TranslationKey } from "@/i18n";
import { copyText } from "@/lib/clipboard";

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
  const { t, language } = useI18n();
  const { reports: storedReports, researchNotice, reportCategories } = useContent();

  // "Tümü" sanal bir sekmedir; kalanlar panelde tanımlı kategorilerden gelir.
  const categoryTabs = useMemo(
    () => [
      { id: "ALL", label: t("research.catAll") },
      ...reportCategories.map((category) => ({ id: category.id, label: category.label[language] })),
    ],
    [reportCategories, language, t]
  );

  // Panelden gelen kayıtlar iki dili birlikte taşır; görünüm için aktif dilin
  // metinleriyle düzleştiriyoruz. Taslak (yayımlanmamış) raporlar sitede çıkmaz.
  const reports = useMemo<ResearchReport[]>(
    () =>
      storedReports
        .filter((report) => report.published)
        .map((report) => ({ ...report, ...report.copy[language] })),
    [storedReports, language]
  );

  const noticeTitle = researchNotice.enabled ? researchNotice.title[language]?.trim() : "";
  const noticeText = researchNotice.enabled ? researchNotice.text[language]?.trim() : "";
  const showNotice = Boolean(noticeTitle || noticeText);

  const [selectedCategory, setSelectedCategory] = useState<ReportCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReportId, setActiveReportId] = useState<string>(reports[0]?.id || "R-01");
  // "CATALOG" (grid of all reports) or "DOSSIER" (focused full reading room)
  const [readingMode, setReadingMode] = useState<"CATALOG" | "DOSSIER">("CATALOG");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: reports.length };
    for (const category of reportCategories) counts[category.id] = 0;
    for (const report of reports) {
      if (counts[report.category] !== undefined) counts[report.category] += 1;
    }
    return counts;
  }, [reports, reportCategories]);

  const filteredReports = useMemo(() => {
    let list = reports;
    if (selectedCategory !== "ALL") {
      list = list.filter((r) => r.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleUpperCase();
      list = list.filter(
        (r) =>
          r.ticker.toLocaleUpperCase().includes(q) ||
          r.title.toLocaleUpperCase().includes(q) ||
          r.subtitle.toLocaleUpperCase().includes(q) ||
          r.focus.toLocaleUpperCase().includes(q) ||
          r.categoryLabel.toLocaleUpperCase().includes(q)
      );
    }
    return list;
  }, [reports, selectedCategory, searchQuery]);

  const activeReport = useMemo(() => {
    return reports.find((r) => r.id === activeReportId) || filteredReports[0] || reports[0];
  }, [reports, activeReportId, filteredReports]);

  // Panelden tüm raporlar kaldırılmışsa bileşenin geri kalanı çalışamaz.
  const hasReports = reports.length > 0 && Boolean(activeReport);

  // Next report for the reading room footer teaser
  const nextReport = useMemo(() => {
    const currentIndex = reports.findIndex((r) => r.id === activeReport?.id);
    if (currentIndex >= 0 && currentIndex < reports.length - 1) {
      return reports[currentIndex + 1];
    }
    return reports[0];
  }, [reports, activeReport]);

  const featured = reports[0];

  const handleOpenDossier = (id: string) => {
    setActiveReportId(id);
    setReadingMode("DOSSIER");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyShare = (report: ResearchReport) => {
    const text = t("research.shareText", {
      title: report.title,
      ticker: report.ticker,
      target: report.targetPrice || t("research.shareNoTarget"),
    });
    void copyText(text).then((ok) =>
      ok
        ? toast.success(t("research.toastShare"))
        : toast.error(t("toast.copyFailed"), { description: t("toast.copyFailedDesc") })
    );
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
    <div ref={libraryContainerRef} className="terminal-research-desk" role="region" aria-label={t("research.aria")}>
      {/* 1. TOP EDITORIAL BANNER */}
      <div className="research-desk-banner">
        <div className="banner-meta">
          <div className="banner-kicker">
            <span className="live-dot" />
            <span>{t("research.kicker")}</span>
            <span className="banner-pill">{t("research.bannerPill")}</span>
          </div>
          <h1 className="banner-title">{t("research.title")}</h1>
          <p className="banner-desc">{t("research.desc")}</p>
        </div>

        <div className="banner-actions">
          {readingMode === "DOSSIER" ? (
            <button onClick={() => setReadingMode("CATALOG")} className="btn-terminal-secondary">
              <ArrowLeft size={14} /> {t("research.backToAll")}
            </button>
          ) : (
            <button onClick={onBack} className="btn-terminal-secondary">
              <Grid2X2 size={14} /> {t("common.backToDashboard")}
            </button>
          )}

          <button
            onClick={() => onContact(t("research.requestSubject", { ticker: activeReport?.ticker ?? "" }))}
            className="btn-terminal-primary"
          >
            <Mail size={14} /> {t("research.requestModel")}
          </button>
        </div>
      </div>

      {/* 2. MODE: CATALOG (GRID VIEW WITH FEATURED REPORT) */}
      {readingMode === "CATALOG" && !hasReports && (
        <div className="research-catalog-wrapper">
          <div className="reports-empty-state">
            <Info size={26} className="notice-icon" />
            <h3>{t("research.libraryEmptyTitle")}</h3>
            <p>{t("research.libraryEmptyDesc")}</p>
          </div>
        </div>
      )}

      {readingMode === "CATALOG" && hasReports && (
        <div className="research-catalog-wrapper">
          {/* Kütüphane genelinde örnek çalışma uyarısı */}
          {showNotice && (
            <div className="research-sample-notice">
              <Info size={16} className="notice-icon" />
              <p>
                {noticeTitle && <strong>{noticeTitle}</strong>} {noticeText}
              </p>
            </div>
          )}

          {/* Spotlight Featured Report */}
          {featured && (
            <div className="featured-research-spotlight">
              <div className="spotlight-badge-row">
                <span className="spotlight-tag">
                  <Sparkles size={12} className="text-emerald-400" />
                  {t("research.spotlightTag")}
                </span>
                <span className="spotlight-period">{featured.period}</span>
              </div>

              <div className="spotlight-content-grid">
                <div className="spotlight-main-col">
                  <div className="spotlight-ticker-group">
                    <span className="spotlight-ticker-badge">{featured.ticker}</span>
                    <span className="spotlight-cat-badge">{featured.categoryLabel}</span>
                    <span className={`spotlight-rec-badge rec-${featured.recommendationTone}`}>
                      {featured.recommendation}
                    </span>
                  </div>

                  <h2 className="spotlight-title">{featured.title}</h2>
                  <p className="spotlight-subtitle">{featured.subtitle}</p>

                  <p className="spotlight-thesis">
                    <strong>{t("research.thesisLabel")}</strong> {featured.executiveSummary.slice(0, 240)}...
                  </p>

                  <div className="spotlight-actions">
                    <button
                      onClick={() => handleOpenDossier(featured.id)}
                      className="btn-spotlight-read"
                      title={t("research.readDossierTitle")}
                    >
                      <BookOpen size={15} /> {t("research.readDossier")}
                    </button>

                    {onOpenSymbolChart && (
                      <button
                        onClick={() => onOpenSymbolChart(featured.ticker)}
                        className="btn-spotlight-chart"
                      >
                        <LineChart size={14} /> {t("research.viewLiveChart")}
                      </button>
                    )}
                  </div>
                </div>

                <div className="spotlight-valuation-card">
                  <span className="card-kicker">{t("research.modelProjection")}</span>
                  <div className="spotlight-metric-main">
                    <span className="metric-lbl">{t("research.targetPrice")}</span>
                    <b className="metric-val">{featured.targetPrice}</b>
                  </div>

                  <div className="spotlight-submetrics">
                    <div className="submetric-box">
                      <span>{t("research.currentReference")}</span>
                      <strong>{featured.currentPrice}</strong>
                    </div>
                    <div className="submetric-box highlight">
                      <span>{t("research.upside")}</span>
                      <strong className="text-emerald-400">{featured.upsidePotential}</strong>
                    </div>
                  </div>

                  <div className="spotlight-method-note">
                    <span>{t("research.methodLabel", { method: featured.methodology })}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs & Search Bar */}
          <div className="research-desk-toolbar">
            <div className="toolbar-categories">
              <span className="toolbar-label">
                <Filter size={12} /> {t("research.categoryLabel")}
              </span>
              <div className="category-button-group">
                {categoryTabs.map((cat) => (
                  <button
                    key={cat.id}
                    className={`category-tab-btn ${selectedCategory === cat.id ? "active" : ""}`}
                    onClick={() => setSelectedCategory(cat.id)}
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
                placeholder={t("research.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                  {t("research.clear")}
                </button>
              )}
            </div>
          </div>

          {/* Research Reports Cards Grid */}
          <div className="reports-editorial-grid">
            {filteredReports.length === 0 ? (
              <div className="reports-empty-state">
                <Search size={32} className="text-slate-500 mb-2" />
                <h3>{t("research.emptyTitle")}</h3>
                <p>{t("research.emptyDesc")}</p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("ALL");
                  }}
                  className="btn-reset-filters"
                >
                  {t("research.showAll")}
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
                        <span className="lbl">{t("research.cardTarget")}</span>
                        <b className="val">{report.targetPrice}</b>
                      </div>
                      {report.upsidePotential && (
                        <div className="upside-figure">
                          <TrendingUp size={12} className="text-emerald-400" />
                          <span className="val">{report.upsidePotential}</span>
                          <span className="lbl">{t("research.cardUpside")}</span>
                        </div>
                      )}
                      <div className="period-figure">
                        <span className="lbl">{t("research.cardPeriod")}</span>
                        <span className="val">{report.period}</span>
                      </div>
                    </div>
                  )}

                  <p className="card-thesis-snippet">{report.executiveSummary.slice(0, 160)}...</p>

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
                          title={t("research.cardChartTitle")}
                        >
                          <LineChart size={13} /> {t("research.cardChart")}
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenDossier(report.id)}
                        className="btn-card-read"
                        title={t("research.readDossierTitle")}
                      >
                        <BookOpen size={13} /> {t("research.cardReadDossier")}
                      </button>

                      {report.pdfUrl && (
                        <a
                          href={report.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-card-pdf"
                          title={t("research.openPdfNewTab")}
                        >
                          <FileText size={13} /> {t("research.cardPdf")}
                        </a>
                      )}
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
              <ArrowLeft size={15} /> {t("research.backToLibrary")}
            </button>

            <div className="reader-center-ticker">
              <span className="ticker-badge">{activeReport.ticker}</span>
              <span className="title-preview">{activeReport.title.slice(0, 48)}...</span>
            </div>

            <div className="reader-action-group">
              {activeReport.pdfUrl && (
                <a
                  href={activeReport.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-reader-pdf"
                  title={t("research.openPdfNewTab")}
                >
                  <FileText size={14} /> {t("research.openPdf")} <ExternalLink size={12} />
                </a>
              )}

              {onOpenSymbolChart && activeReport.ticker && !activeReport.ticker.includes("-") && (
                <button
                  onClick={() => onOpenSymbolChart(activeReport.ticker)}
                  className="btn-reader-chart"
                >
                  <LineChart size={14} /> {t("research.openLiveChart")}
                </button>
              )}

              <button onClick={() => handleCopyShare(activeReport)} className="btn-reader-icon" title={t("research.share")}>
                <Share2 size={14} />
              </button>

              <button onClick={handlePrint} className="btn-reader-icon" title={t("research.print")}>
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
                <span className="pill-code">{t("research.fileId", { id: activeReport.id })}</span>
              </div>

              <h1 className="paper-doc-title">{activeReport.title}</h1>
              <p className="paper-doc-subtitle">{activeReport.subtitle}</p>

              <div className="paper-byline-bar">
                <div className="byline-item author">
                  <span>{t("research.analyst")}</span>
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

              {/* Örnek çalışma uyarısı */}
              {showNotice && (
                <div className="paper-notice-callout">
                  <div className="notice-callout-info">
                    <Info size={18} className="notice-icon" />
                    <div>
                      {noticeTitle && <strong>{noticeTitle}</strong>}
                      <p>{noticeText}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Target Price & Valuation Highlights Matrix */}
            {activeReport.targetPrice && (
              <div className="dossier-valuation-highlight-strip">
                <div className="val-stat-box target">
                  <span className="stat-lbl">{t("research.statTarget")}</span>
                  <b className="stat-num text-emerald-400">{activeReport.targetPrice}</b>
                  <small className="stat-note">{t("research.statTargetNote")}</small>
                </div>

                {activeReport.currentPrice && (
                  <div className="val-stat-box current">
                    <span className="stat-lbl">{t("research.statCurrent")}</span>
                    <b className="stat-num">{activeReport.currentPrice}</b>
                    <small className="stat-note">{t("research.statCurrentNote")}</small>
                  </div>
                )}

                {activeReport.upsidePotential && (
                  <div className="val-stat-box upside">
                    <span className="stat-lbl">{t("research.statUpside")}</span>
                    <b className="stat-num text-emerald-400">{activeReport.upsidePotential}</b>
                    <small className="stat-note">{t("research.statUpsideNote")}</small>
                  </div>
                )}

                <div className="val-stat-box method">
                  <span className="stat-lbl">{t("research.statMethod")}</span>
                  <span className="stat-method-desc">{activeReport.methodology}</span>
                  <small className="stat-note">{t("research.statMethodNote")}</small>
                </div>
              </div>
            )}

            {/* Section 1: Executive Summary & Thesis */}
            <section className="paper-section">
              <div className="paper-section-head">
                <span className="sec-indicator" />
                <h3>{t("research.execSummaryHeading")}</h3>
              </div>
              <div className="paper-executive-card">
                <p className="executive-body">{activeReport.executiveSummary}</p>
                <div className="executive-focus-strip">
                  <b>{t("research.focusLabel")}</b>
                  <span>{activeReport.focus}</span>
                </div>
              </div>
            </section>

            {/* Section 2: Valuation & Fundamental Metrics */}
            {activeReport.valuationMetrics && activeReport.valuationMetrics.length > 0 && (
              <section className="paper-section">
                <div className="paper-section-head">
                  <span className="sec-indicator" />
                  <h3>{t("research.metricsHeading")}</h3>
                  <span className="head-badge">{t("research.metricsBadge")}</span>
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
                  <h3>{t("research.catalystsHeading")}</h3>
                </div>
                <div className="catalysts-structured-list">
                  {activeReport.keyCatalysts.map((cat, idx) => {
                    const parts = cat.split(":");
                    const title =
                      parts.length > 1
                        ? parts[0]
                        : t("research.catalystFallback", { index: idx + 1 });
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
                  <h4>{t("research.driversHeading")}</h4>
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
                  <h4>{t("research.risksHeading")}</h4>
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
                <h3>{t("research.verdictHeading")}</h3>
              </div>
              <p className="verdict-text">{activeReport.analystNote}</p>

              <div className="analyst-credentials-strip">
                <div className="analyst-bio">
                  <b className="analyst-name">{activeReport.author}</b>
                  <span className="analyst-degrees">{t("research.analystCredentials")}</span>
                  <small className="analyst-moat">{t("research.analystMoat")}</small>
                </div>

                <button
                  onClick={() =>
                    onContact(
                      t("research.requestThisSubject", {
                        ticker: activeReport.ticker,
                        title: activeReport.title,
                      })
                    )
                  }
                  className="btn-request-full-model"
                >
                  <Mail size={14} /> {t("research.requestThisModel")}
                </button>
              </div>
            </section>

            {/* Section 6: Legal Regulatory Notice */}
            <div className="dossier-legal-notice">
              <ShieldAlert size={15} className="text-amber-400 flex-shrink-0" />
              <p>
                <strong>{t("research.legalTitle")}</strong> {t("research.legalText")}
              </p>
            </div>

            {/* Next Report Teaser */}
            {nextReport && nextReport.id !== activeReport.id && (
              <div className="next-dossier-teaser" onClick={() => handleOpenDossier(nextReport.id)}>
                <div className="teaser-content">
                  <span className="teaser-kicker">{t("research.nextTeaser")}</span>
                  <h4 className="teaser-title">{nextReport.title}</h4>
                  <span className="teaser-pill">
                    {nextReport.ticker} · {nextReport.recommendation}
                  </span>
                </div>
                <div className="teaser-arrow-btn">
                  <span>{t("research.nextCta")}</span>
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
