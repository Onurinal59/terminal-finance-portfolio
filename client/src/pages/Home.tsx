/** Finansal araştırma terminali: canlı Yahoo fiyat/OHLC ve yıllık mali tablo verileri. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowUpRight, Award, BarChart3, Bell, BookOpen, Briefcase, CalendarDays,
  CheckCircle2, ChevronDown, Code2, Coins, Download, ExternalLink, FileText,
  GraduationCap, Grid2X2, History, Info, Layers, LineChart, Linkedin, Lock, Mail,
  Minus, MoreHorizontal, PieChart, Plus, Scale, Search, SlidersHorizontal, Trash2, TrendingDown, TrendingUp, UserRound, Globe,
} from "lucide-react";
import { toast } from "sonner";
import { GlobalMarketSearch } from "@/components/GlobalMarketSearch";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useContent } from "@/content/ContentContext";
import { MobileModulesSheet, type MobileModuleId } from "@/components/MobileModulesSheet";
import { ResearchLibrary } from "@/components/ResearchLibrary";
import { ContactDesk } from "@/components/ContactDesk";
import { TerminalFooter } from "@/components/TerminalFooter";
import { excludeTransientDiscovery, normalizeDiscoverySymbol } from "@/lib/marketDiscovery";
import { getAutoScrollDelta, placeUnlockedPanelBefore } from "@/lib/panelOrder";
import { rememberRecentSymbol } from "@/lib/recentSymbols";
import { gsap, refreshScrollTriggers, useGSAP } from "@/lib/gsap";
import { trpc } from "@/lib/trpc";
import {
  formatClock,
  formatCompactNumber,
  formatDateTime,
  formatDecimal,
  formatPercent,
  useI18n,
  type Translate,
  type TranslationKey,
} from "@/i18n";

type TerminalView = "DASHBOARD" | "PROFILE" | "RESEARCH" | "CONTACT";
type WatchCategory = "TÜMÜ" | "TÜRKİYE" | "ABD" | "MAKRO";
type PanelId = "profile" | "chart" | "summary" | "archive";
type FinancialStatementKind = "income" | "balance" | "cashflow";
type ChartPoint = { time: number; close: number | null; high: number | null; low: number | null; open: number | null; volume: number | null };
type LiveQuote = { symbol: string; shortName: string; currency: string; price: number; change: number | null; changePercent: number | null; marketState: string };
type MarketRow = { symbol: string; providerSymbol: string; category: Exclude<WatchCategory, "TÜMÜ">; kind: string; value: string; change: string; pct: string; tone: "up" | "down" | "flat"; last: number; precision: number; currency: string; sourceName?: string; marketState?: string };
type StatementValue = { asOfDate: string; currency: string; raw: number; formatted: string };
type FinancialStatementsData = { symbol: string; statement: FinancialStatementKind; periods: Array<{ asOfDate: string; currency: string }>; rows: Array<{ key: string; label: string; values: Array<StatementValue | null> }>; chartAvailable: boolean; chartCurrency: string | null; source: "Yahoo Finance" };
type DiscoveredSymbol = { symbol: string; providerSymbol: string; name: string };

const profilePhoto = "/media/onur-inal.jpg";
const linkedInUrl = "https://www.linkedin.com/in/onur%C4%B1nal/";
const email = "onurinal815@gmail.com";
const intervals = ["1G", "5G", "1A", "3A", "1Y"] as const;
const defaultPanelOrder: PanelId[] = ["profile", "summary", "chart", "archive"];
/** Depolama anahtarları tek yerde; okuma ve yazmanın ayrışmasını önler. */
const STORAGE_KEYS = {
  panelOrder: "analiz-terminal-order-v10",
  lockedPanels: "analiz-terminal-locked-panels-v1",
  recentSymbols: "analiz-terminal-recent-symbols-v1",
  legacyWatchlist: "analiz-terminal-user-watchlist-v1",
} as const;
const cvLibrary = {
  TR: {
    photo: { labelKey: "cv.labelTrPhoto", href: "/cv/Onur_Inal_CV_TR_Fotografli.pdf", file: "Onur_Inal_CV_TR_Fotografli.pdf" },
    plain: { labelKey: "cv.labelTrPlain", href: "/cv/Onur_Inal_CV_TR_ATS.pdf", file: "Onur_Inal_CV_TR_ATS.pdf" },
  },
  EN: {
    photo: { labelKey: "cv.labelEnPhoto", href: "/cv/Onur_Inal_CV_EN_Fotografli.pdf", file: "Onur_Inal_CV_EN_Fotografli.pdf" },
    plain: { labelKey: "cv.labelEnPlain", href: "/cv/Onur_Inal_CV_EN_ATS.pdf", file: "Onur_Inal_CV_EN_ATS.pdf" },
  },
} as const satisfies Record<"TR" | "EN", Record<"photo" | "plain", { labelKey: TranslationKey; href: string; file: string }>>;
const marketSeeds: MarketRow[] = [
  // BIST / Türkiye
  ["BIST 100", "XU100.IS", "TÜRKİYE", "ENDEKS", 2, "TRY"],
  ["BIST 30", "XU030.IS", "TÜRKİYE", "ENDEKS", 2, "TRY"],
  ["THYAO", "THYAO.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["ASELS", "ASELS.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["TUPRS", "TUPRS.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["AKBNK", "AKBNK.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["GARAN", "GARAN.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["ISCTR", "ISCTR.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["BIMAS", "BIMAS.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["EREGL", "EREGL.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["KCHOL", "KCHOL.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["SISE", "SISE.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["PGSUS", "PGSUS.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["FROTO", "FROTO.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  ["SAHOL", "SAHOL.IS", "TÜRKİYE", "HİSSE", 2, "TRY"],
  // ABD / Global
  ["S&P 500", "^GSPC", "ABD", "ENDEKS", 2, "USD"],
  ["NASDAQ 100", "^NDX", "ABD", "ENDEKS", 2, "USD"],
  ["VIX", "^VIX", "ABD", "VOLATİLİTE", 2, "USD"],
  ["AAPL", "AAPL", "ABD", "HİSSE", 2, "USD"],
  ["MSFT", "MSFT", "ABD", "HİSSE", 2, "USD"],
  ["NVDA", "NVDA", "ABD", "HİSSE", 2, "USD"],
  ["GOOGL", "GOOGL", "ABD", "HİSSE", 2, "USD"],
  ["AMZN", "AMZN", "ABD", "HİSSE", 2, "USD"],
  ["TSLA", "TSLA", "ABD", "HİSSE", 2, "USD"],
  ["BRK.B", "BRK-B", "ABD", "DEĞER", 2, "USD"],
  // Makro / Döviz / Emtia / Kripto
  ["USD/TRY", "TRY=X", "MAKRO", "KUR", 4, "TRY"],
  ["EUR/TRY", "EURTRY=X", "MAKRO", "KUR", 4, "TRY"],
  ["ALTIN", "GC=F", "MAKRO", "EMTİA", 2, "USD"],
  ["PETROL", "CL=F", "MAKRO", "EMTİA", 2, "USD"],
  ["ABD 10Y", "^TNX", "MAKRO", "TAHVİL", 3, "%"],
  ["BTC-USD", "BTC-USD", "MAKRO", "KRİPTO", 2, "USD"],
].map(([symbol, providerSymbol, category, kind, precision, currency]) => ({ symbol: String(symbol), providerSymbol: String(providerSymbol), category: category as MarketRow["category"], kind: String(kind), precision: Number(precision), currency: String(currency), value: "—", change: "—", pct: "—", tone: "flat" as const, last: 0 }));

/** Yönetim panelinin "izleme listesi" sekmesine varsayılan evreni göstermek için. */
export const DEFAULT_WATCHLIST_SYMBOLS = marketSeeds.map((seed) => seed.symbol);

const statementLabelKeys: Record<FinancialStatementKind, TranslationKey> = {
  income: "statement.income.label",
  balance: "statement.balance.label",
  cashflow: "statement.cashflow.label",
};
const statementTitleKeys: Record<FinancialStatementKind, { title: TranslationKey; subtitle: TranslationKey }> = {
  income: { title: "statement.income.title", subtitle: "statement.income.subtitle" },
  balance: { title: "statement.balance.title", subtitle: "statement.balance.subtitle" },
  cashflow: { title: "statement.cashflow.title", subtitle: "statement.cashflow.subtitle" },
};

/** Sunucudan gelen mali tablo satır etiketlerini istemci sözlüğüne çevirir. */
function financialRowLabel(t: Translate, key: string, fallback: string) {
  const translationKey = `fin.${key}` as TranslationKey;
  const label = t(translationKey);
  return label === translationKey ? fallback : label;
}

/** Piyasa satırlarında kategori / tür / sembol adlarını çevirir, bilinmeyeni olduğu gibi bırakır. */
function lookupLabel(t: Translate, prefix: "category" | "kind" | "symbol", value: string) {
  const translationKey = `${prefix}.${value}` as TranslationKey;
  const label = t(translationKey);
  return label === translationKey ? value : label;
}

function formatCompactVal(num: number, currency = "") {
  const abs = Math.abs(num);
  const sign = num < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}${(abs / 1e12).toFixed(1)}T ${currency}`.trim();
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(1)}B ${currency}`.trim();
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M ${currency}`.trim();
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)}K ${currency}`.trim();
  return `${sign}${abs.toFixed(1)} ${currency}`.trim();
}
const statementBarKeys: Record<FinancialStatementKind, string[]> = { income: ["revenue", "netIncome"], balance: ["assets", "equity"], cashflow: ["operatingCashFlow", "freeCashFlow"] };
const statementDetailKeys: Record<FinancialStatementKind, string[]> = {
  income: ["revenue", "costOfRevenue", "grossProfit", "operatingExpense", "operatingIncome", "pretaxIncome", "taxProvision", "netIncome", "dilutedEPS"],
  balance: ["cash", "receivables", "inventory", "currentAssets", "assets", "currentLiabilities", "longTermDebt", "liabilities", "debt", "equity"],
  cashflow: ["operatingCashFlow", "capex", "investingCashFlow", "financingCashFlow", "debtIssued", "debtRepaid", "freeCashFlow", "endCash"],
};
function formatPrice(value: number, precision: number) { return formatDecimal(value, precision); }
function pctNumber(row: MarketRow) { return Number.parseFloat(row.pct.replace("%", "").replace(",", ".")); }
function mergeQuote(seed: MarketRow, quote?: LiveQuote): MarketRow {
  if (!quote) return seed;
  const tone: MarketRow["tone"] = quote.change === null ? "flat" : quote.change >= 0 ? "up" : "down";
  const signed = (value: number | null) => value === null ? "—" : `${value >= 0 ? "+" : ""}${formatPrice(value, seed.precision)}`;
  return { ...seed, value: formatPrice(quote.price, seed.precision), change: signed(quote.change), pct: quote.changePercent === null ? "—" : `${quote.changePercent >= 0 ? "+" : ""}${formatPrice(quote.changePercent, 2)}%`, tone, last: quote.price, currency: quote.currency || seed.currency, sourceName: quote.shortName, marketState: quote.marketState };
}

function TerminalPanel({ id, title, code, children, className = "", dragged, onDragStart, onDrop, movable = true, locked = false, onToggleLock }: { id: string; title: string; code: string; children: React.ReactNode; className?: string; dragged: PanelId | null; onDragStart: (id: PanelId | null) => void; onDrop: (id: PanelId) => void; movable?: boolean; locked?: boolean; onToggleLock?: () => void }) {
  const { t } = useI18n();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 821px)").matches);
  useEffect(() => { const media = window.matchMedia("(min-width: 821px)"); const sync = () => setDesktop(media.matches); sync(); media.addEventListener("change", sync); return () => media.removeEventListener("change", sync); }, []);
  const canDrag = movable && desktop && !locked;
  const target = canDrag && !locked && dragged !== null && dragged !== (id as PanelId);
  const dragOver = (event: React.DragEvent<HTMLElement>) => { event.preventDefault(); const delta = getAutoScrollDelta(event.clientY, window.innerHeight); if (delta) window.scrollBy(0, delta); };
  return <section id={id} className={`terminal-panel workspace-panel ${className} ${canDrag ? "panel-movable" : "panel-locked"} ${dragged === (id as PanelId) ? "panel-dragging" : ""} ${target ? "panel-drop-target" : ""}`} onDragOver={canDrag ? dragOver : undefined} onDrop={canDrag ? (event) => { event.preventDefault(); onDrop(id as PanelId); } : undefined} onDragEnd={canDrag ? () => onDragStart(null) : undefined}>
    {target && <div className="panel-drop-indicator">{t("panel.dropHere")}</div>}
    <div className="panel-titlebar" draggable={canDrag} onDragStart={canDrag ? (event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-analiz-panel", id); onDragStart(id as PanelId); } : undefined}>
      <div className="panel-title">{canDrag ? <span className="drag-grip" title={t("panel.dragHint")}>⠿</span> : <span title={locked ? t("panel.lockedHint") : movable ? t("panel.mobileDragOff") : t("panel.static")}><Lock size={11} className="panel-lock"/></span>}<span className="panel-led"/><span className="panel-title-text" title={title}>{title}</span><em>{code}</em></div>
      <div className="panel-actions"><button onClick={() => { setCollapsed((state) => !state); setMenuOpen(false); }} title={collapsed ? t("panel.expand") : t("panel.collapse")} aria-label={collapsed ? t("panel.ariaExpand", { title }) : t("panel.ariaCollapse", { title })}>{collapsed ? <Plus size={12}/> : <Minus size={12}/>}</button><button onClick={() => setMenuOpen((state) => !state)} title={t("panel.options")} aria-label={t("panel.ariaOptions", { title })}><MoreHorizontal size={14}/></button>{menuOpen && <div className="panel-options"><button onClick={() => { setCollapsed(false); setMenuOpen(false); }}>{t("panel.menuExpand")}</button><button onClick={() => { setCollapsed(true); setMenuOpen(false); }}>{t("panel.menuCollapse")}</button>{movable && onToggleLock && <button onClick={() => { onToggleLock(); setMenuOpen(false); }}>{locked ? t("panel.menuUnlock") : t("panel.menuLock")}</button>}</div>}</div>
    </div>
    {!collapsed && <div className="panel-body">{children}</div>}
  </section>;
}

function InteractiveChart({ row, points, interval, isLoading, onRetry }: { row: MarketRow; points: ChartPoint[]; interval: string; isLoading: boolean; onRetry: () => void }) {
  const { t } = useI18n();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [style, setStyle] = useState<"candle" | "line">("candle");
  const [showVolume, setShowVolume] = useState(true);
  const canvasRef = useRef<SVGSVGElement>(null);
  const valid = points.filter((point) => point.open !== null && point.high !== null && point.low !== null && point.close !== null);
  const prices = valid.flatMap((point) => [point.high!, point.low!]);
  const floor = prices.length ? Math.min(...prices) : 0;
  const ceiling = prices.length ? Math.max(...prices) : 1;
  const spread = Math.max(ceiling - floor, Math.max(Math.abs(row.last) * 0.002, 0.0001));
  const maxVolume = Math.max(1, ...valid.map((point) => point.volume ?? 0));

  const x = (index: number) => (valid.length < 2 ? 230 : 16 + (index / (valid.length - 1)) * 420);
  const y = (value: number) => 124 - ((value - floor) / spread) * 104;
  const activeIndex = hoverIndex ?? Math.max(valid.length - 1, 0);
  const active = valid[activeIndex];
  const path = valid.map((point, index) => `${index ? "L" : "M"}${x(index)} ${y(point.close!)}`).join(" ");
  const label = (time: number) => formatDateTime(time);

  const chooseIndex = (ratio: number) => {
    if (valid.length) setHoverIndex(Math.round(Math.min(1, Math.max(0, ratio)) * (valid.length - 1)));
  };
  const move = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    chooseIndex((event.clientX - rect.left) / rect.width);
  };
  const keyMove = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (!valid.length || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const current = hoverIndex ?? valid.length - 1;
    setHoverIndex(event.key === "Home" ? 0 : event.key === "End" ? valid.length - 1 : Math.min(valid.length - 1, Math.max(0, current + (event.key === "ArrowLeft" ? -1 : 1))));
  };
  const volumeWidth = Math.max(2, Math.min(8, 330 / Math.max(valid.length, 12)));

  const priceLevels = [
    { y: 20, val: ceiling },
    { y: 55, val: floor + spread * 0.66 },
    { y: 90, val: floor + spread * 0.33 },
    { y: 124, val: floor },
  ];

  const isRightSide = active ? x(activeIndex) > 230 : false;
  const tooltipStyle: React.CSSProperties = isRightSide
    ? { right: `${Math.min(76, Math.max(4, ((500 - x(activeIndex)) / 500) * 100 + 4))}%`, left: "auto" }
    : { left: `${Math.min(76, Math.max(4, (x(activeIndex) / 500) * 100 + 4))}%`, right: "auto" };

  return (
    <div className="chart-content chart-content-refined">
      <div className="chart-metadata">
        <div>
          <span>{row.symbol}</span>
          <b>{row.value}</b>
          <strong className={row.tone}>{row.change} <small>({row.pct})</small></strong>
        </div>
        <div className="chart-stats">
          <span>{t("chart.high")} <b>{formatPrice(ceiling, row.precision)}</b></span>
          <span>{t("chart.low")} <b>{formatPrice(floor, row.precision)}</b></span>
          <span>{t("chart.volume")} <b>{active?.volume ? formatCompactNumber(active.volume) : "—"}</b></span>
        </div>
      </div>
      <div className="chart-view-controls" aria-label={t("chart.viewAria")}>
        <button className={style === "candle" ? "active" : ""} onClick={() => setStyle("candle")}>{t("chart.styleCandle")}</button>
        <button className={style === "line" ? "active" : ""} onClick={() => setStyle("line")}>{t("chart.styleLine")}</button>
        <button className={showVolume ? "active" : ""} onClick={() => setShowVolume((val) => !val)}>{t("chart.volume")}</button>
      </div>
      <div className="chart-canvas">
        <span className="chart-mode-label">{t("chart.modeLabel")}</span>
        {isLoading && <div className="chart-loading">{t("chart.loading")}</div>}
        {!isLoading && !valid.length && (
          <div className="chart-loading chart-error">
            <span>{t("chart.error")}</span>
            <button onClick={onRetry}>{t("common.retry")}</button>
          </div>
        )}
        <svg
          ref={canvasRef}
          viewBox="0 0 500 170"
          preserveAspectRatio="none"
          onMouseMove={move}
          onMouseLeave={() => setHoverIndex(null)}
          onKeyDown={keyMove}
          tabIndex={0}
          aria-label={t("chart.svgAria", { symbol: row.symbol })}
        >
          <defs>
            <linearGradient id="chart-fill-refined" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#00f59b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00f59b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {priceLevels.map((lvl) => (
            <g key={lvl.y}>
              <line x1="16" x2="436" y1={lvl.y} y2={lvl.y} stroke="rgba(255,255,255,0.07)" strokeDasharray="3 4" />
              <text x="495" y={lvl.y + 3} textAnchor="end" fill="#64748b" fontSize="8.5" fontFamily="var(--font-mono)">
                {formatPrice(lvl.val, row.precision)}
              </text>
            </g>
          ))}
          {showVolume && <line x1="16" x2="436" y1="134" y2="134" stroke="rgba(255,255,255,0.1)" strokeDasharray="1 3" />}
          {showVolume && valid.map((point, index) => {
            const height = ((point.volume ?? 0) / maxVolume) * 26;
            return (
              <rect
                key={`volume-${point.time}`}
                x={x(index) - volumeWidth / 2}
                y={162 - height}
                width={volumeWidth}
                height={Math.max(1, height)}
                fill={point.close! >= point.open! ? "rgba(0, 245, 155, 0.35)" : "rgba(251, 113, 133, 0.35)"}
              />
            );
          })}
          {valid.length > 1 && style === "line" && (
            <>
              <path d={`${path} L${x(valid.length - 1)} 132 L${x(0)} 132 Z`} fill="url(#chart-fill-refined)" />
              <path d={path} fill="none" stroke="#00f59b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}
          {valid.length > 1 && style === "candle" && valid.map((point, index) => {
            const up = point.close! >= point.open!;
            const bodyWidth = Math.max(3, Math.min(9, 210 / Math.max(valid.length, 18)));
            const color = up ? "#00f59b" : "#fb7185";
            return (
              <g key={point.time}>
                <line x1={x(index)} x2={x(index)} y1={y(point.high!)} y2={y(point.low!)} stroke={color} strokeWidth="1" />
                <rect
                  x={x(index) - bodyWidth / 2}
                  y={Math.min(y(point.open!), y(point.close!))}
                  width={bodyWidth}
                  height={Math.max(2, Math.abs(y(point.open!) - y(point.close!)))}
                  fill={up ? color : "transparent"}
                  stroke={color}
                  strokeWidth="1"
                />
              </g>
            );
          })}
          {active && (
            <>
              <line x1={x(activeIndex)} x2={x(activeIndex)} y1="12" y2="162" stroke="#38bdf8" strokeDasharray="3 3" strokeWidth="1" />
              <circle cx={x(activeIndex)} cy={y(active.close!)} r="3.5" fill="#080d12" stroke="#38bdf8" strokeWidth="1.5" />
            </>
          )}
        </svg>
        {active && (
          <div className="ohlc-tooltip" style={tooltipStyle}>
            <span>{label(active.time)}</span>
            <div>
              <b>{t("chart.ohlcOpen")}</b>{formatPrice(active.open!, row.precision)}
              <b>{t("chart.ohlcHigh")}</b>{formatPrice(active.high!, row.precision)}
            </div>
            <div>
              <b>{t("chart.ohlcLow")}</b>{formatPrice(active.low!, row.precision)}
              <b>{t("chart.ohlcClose")}</b>{formatPrice(active.close!, row.precision)}
            </div>
            <small>{t("chart.volume")}: {active.volume ? formatCompactNumber(active.volume) : "—"}</small>
          </div>
        )}
        <div className="chart-x-axis">
          <span>{valid[0] ? label(valid[0].time) : "—"}</span>
          <span>{active ? label(active.time) : "—"}</span>
          <span>{valid.at(-1) ? label(valid.at(-1)!.time) : "—"}</span>
        </div>
      </div>
      <div className="chart-footer">
        <span>YAHOO FINANCE / {interval} / {row.marketState ?? t("chart.delayed")}</span>
        <span><Activity size={12} /> {row.currency} · {row.sourceName ?? row.providerSymbol}</span>
      </div>
    </div>
  );
}

function StatementExplorer({
  row,
  statement,
  data,
  isLoading,
  isError,
  onRetry,
  onSelectStatement,
}: {
  row: MarketRow;
  statement: FinancialStatementKind;
  data?: FinancialStatementsData;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onSelectStatement?: (kind: FinancialStatementKind) => void;
}) {
  const { t } = useI18n();
  const [selectedKey, setSelectedKey] = useState("");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const availableRows = useMemo(() => {
    return (data?.rows ?? [])
      .filter((item) => statementDetailKeys[statement].includes(item.key) && item.values.some(Boolean))
      .map((item) => ({ ...item, label: financialRowLabel(t, item.key, item.label) }));
  }, [data?.rows, statement, t]);

  const defaultMetricKey = useMemo(() => {
    if (statement === "income") return "revenue";
    if (statement === "balance") return "assets";
    return "operatingCashFlow";
  }, [statement]);

  const selected = useMemo(() => {
    return (
      availableRows.find((item) => item.key === selectedKey) ??
      availableRows.find((item) => item.key === defaultMetricKey) ??
      availableRows[0]
    );
  }, [availableRows, selectedKey, defaultMetricKey]);

  const periods = data?.periods ?? [];
  const values = useMemo(() => {
    return periods.map((period, index) => ({
      period,
      value: selected?.values[index] ?? null,
    }));
  }, [periods, selected]);

  const rawValues = values.map((item) => item.value?.raw ?? 0);
  const maxRaw = Math.max(0, ...rawValues);
  const minRaw = Math.min(0, ...rawValues);

  const ceiling = maxRaw > 0 ? maxRaw * 1.18 : 0;
  const floor = minRaw < 0 ? minRaw * 1.18 : 0;
  const span = Math.max(1, ceiling - floor);

  const activeIndex = hoverIndex ?? Math.max(values.length - 1, 0);
  const active = values[activeIndex];

  const year = (date: string) => {
    try {
      return new Date(`${date}T00:00:00Z`).getUTCFullYear();
    } catch {
      return date.slice(0, 4);
    }
  };

  const svgW = 700;
  const svgH = 230;
  const padLeft = 68;
  const padRight = 32;
  const padTop = 38;
  const padBottom = 32;
  const chartW = svgW - padLeft - padRight;
  const chartH = svgH - padTop - padBottom;

  const getX = (index: number) =>
    values.length < 2 ? padLeft + chartW / 2 : padLeft + (index / (values.length - 1)) * chartW;

  const getY = (raw: number) => padTop + chartH - ((raw - floor) / span) * chartH;
  const baseline = Math.min(padTop + chartH, Math.max(padTop, getY(0)));

  // YoY growth per period
  const yoyGrowth = values.map((item, idx) => {
    if (idx === 0) return null;
    const prev = values[idx - 1]?.value?.raw;
    const curr = item?.value?.raw;
    if (prev === null || prev === undefined || curr === null || curr === undefined || prev === 0) return null;
    return ((curr - prev) / Math.abs(prev)) * 100;
  });

  // Overall 4Y change
  const firstVal = values.find((v) => v.value?.raw !== null && v.value?.raw !== undefined)?.value?.raw;
  const lastVal = values[values.length - 1]?.value?.raw;
  const overallChange = firstVal && lastVal && firstVal !== 0 ? ((lastVal - firstVal) / Math.abs(firstVal)) * 100 : null;

  // Margin % calculation if income statement
  const revRow = useMemo(() => (data?.rows ?? []).find((r) => r.key === "revenue"), [data?.rows]);
  const marginForActive = useMemo(() => {
    if (statement !== "income" || !revRow || !active?.value?.raw) return null;
    // Gelirin kendi kendine oranı her zaman %100; anlamsız olduğu için gösterilmez.
    if (selected?.key === "revenue") return null;
    const revVal = revRow.values[activeIndex]?.raw;
    if (!revVal || revVal <= 0) return null;
    return (active.value.raw / revVal) * 100;
  }, [statement, revRow, active, activeIndex, selected?.key]);

  const line = values
    .map((item, index) => `${index ? "L" : "M"}${getX(index)} ${getY(item.value?.raw ?? 0)}`)
    .join(" ");

  const hasRows = availableRows.length > 0;

  const selectMetric = (key: string) => {
    setSelectedKey(key);
    setHoverIndex(null);
  };

  const move = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || !values.length) return;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = Math.min(0.999, Math.max(0, (event.clientX - rect.left) / rect.width));
    const idx = Math.min(values.length - 1, Math.max(0, Math.floor(ratio * values.length)));
    setHoverIndex(idx);
  };

  const handleTouch = (event: React.TouchEvent<SVGSVGElement>) => {
    if (!svgRef.current || !values.length) return;
    const touch = event.touches[0];
    if (!touch) return;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = Math.min(0.999, Math.max(0, (touch.clientX - rect.left) / rect.width));
    const idx = Math.min(values.length - 1, Math.max(0, Math.floor(ratio * values.length)));
    setHoverIndex(idx);
  };

  // Y-axis grid levels
  const gridSteps = [0, 0.33, 0.66, 1];
  const gridLevels = gridSteps.map((step) => {
    const val = floor + (1 - step) * span;
    return { val, y: getY(val) };
  });

  const currencyLabel = data?.chartCurrency ?? row.currency ?? "TRY";
  const barWidth = Math.min(46, Math.max(26, chartW / (Math.max(values.length, 2) * 2.2)));

  // Matrix table items
  const matrixKeys = statementDetailKeys[statement].slice(0, 6);
  const matrixRows = useMemo(() => {
    return (data?.rows ?? []).filter((r) => matrixKeys.includes(r.key) && r.values.some(Boolean));
  }, [data?.rows, matrixKeys]);

  return (
    <div className="statement-explorer statement-chart">
      {/* Top Header Card */}
      <div className="statement-header-bar">
        <div className="statement-header-left">
          <div className="statement-tag-group">
            <span className="statement-kind-pill">{t(statementTitleKeys[statement].title)}</span>
            <span className="statement-badge-mono">{row.symbol}</span>
            <span className="statement-currency-pill">{currencyLabel}</span>
            <span className="statement-periods-pill">{t("statement.periods", { count: periods.length })}</span>
          </div>
          <h4 className="statement-headline">{t(statementTitleKeys[statement].subtitle)}</h4>
        </div>

        {selected && active && (
          <div className="statement-active-metric-card">
            <div className="metric-card-top">
              <span className="metric-card-label">{selected.label}</span>
              <span className="metric-card-year">{year(active.period.asOfDate)}</span>
            </div>
            <div className="metric-card-bottom">
              <b className="metric-card-value">{active.value?.formatted ?? "—"}</b>
              {yoyGrowth[activeIndex] !== null && (
                <span
                  className={`metric-card-change ${
                    (yoyGrowth[activeIndex] ?? 0) >= 0 ? "positive" : "negative"
                  }`}
                >
                  {(yoyGrowth[activeIndex] ?? 0) >= 0 ? "+" : ""}
                  {(yoyGrowth[activeIndex] ?? 0).toFixed(1)}% YoY
                </span>
              )}
              {marginForActive !== null && (
                <span className="metric-card-margin" title={t("statement.marginTitle")}>
                  {t("statement.margin", { value: marginForActive.toFixed(1) })}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="statement-state loading">
          <Activity size={16} className="animate-spin" />
          <span>{t("statement.loading")}</span>
        </div>
      )}

      {!isLoading && isError && (
        <div className="statement-state error">
          <span>{t("statement.error")}</span>
          <button onClick={onRetry}>{t("common.retryAgain")}</button>
        </div>
      )}

      {!isLoading && !isError && !hasRows && (
        <div className="statement-state empty">
          <span>{t("statement.empty")}</span>
        </div>
      )}

      {!isLoading && !isError && hasRows && (
        <div className="statement-visual statement-trend">
          {/* Interactive Metric Selection Bar */}
          <div className="statement-metric-picker" role="tablist" aria-label={t("statement.metricPickerAria")}>
            {availableRows.map((item) => {
              const lastVal = item.values.at(-1)?.formatted ?? "";
              const isSelected = selected?.key === item.key;
              return (
                <button
                  key={item.key}
                  className={isSelected ? "active" : ""}
                  onClick={() => selectMetric(item.key)}
                >
                  <span className="picker-chip-name">{item.label}</span>
                  {lastVal && <span className="picker-chip-val">{lastVal}</span>}
                </button>
              );
            })}
          </div>

          {/* SVG Trend & Bar Chart */}
          <div className="statement-trend-visual">
            {/* Real-time Inspection HUD */}
            {active && (
              <div className="statement-inspector-hud" aria-live="polite">
                <div className="hud-period-chip">
                  <CalendarDays size={13} className="hud-cal-icon text-sky-400" />
                  <span className="hud-period-year">{year(active.period.asOfDate)}</span>
                  <span className="hud-period-date">({active.period.asOfDate})</span>
                </div>
                <div className="hud-metric-chip">
                  <span className="hud-metric-label">{selected?.label}:</span>
                  <b className="hud-metric-value">{active.value?.formatted ?? "—"}</b>
                  <span className="hud-metric-currency">{active.value?.currency ?? currencyLabel}</span>
                </div>
                <div className="hud-badges-group">
                  {yoyGrowth[activeIndex] !== null && (
                    <span
                      className={`hud-badge ${
                        (yoyGrowth[activeIndex] ?? 0) >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {(yoyGrowth[activeIndex] ?? 0) >= 0 ? "▲ +" : "▼ "}
                      {Math.abs(yoyGrowth[activeIndex] ?? 0).toFixed(1)}% YoY
                    </span>
                  )}
                  {marginForActive !== null && (
                    <span className="hud-badge margin">
                      {t("statement.margin", { value: marginForActive.toFixed(1) })}
                    </span>
                  )}
                </div>
              </div>
            )}

            <svg
              ref={svgRef}
              className="statement-main-chart-svg"
              viewBox={`0 0 ${svgW} ${svgH}`}
              preserveAspectRatio="none"
              onMouseMove={move}
              onMouseLeave={() => setHoverIndex(null)}
              onTouchStart={handleTouch}
              onTouchMove={handleTouch}
              tabIndex={0}
              aria-label={t("statement.trendAria", { label: selected?.label ?? t("statement.metricFallback") })}
            >
              <defs>
                <linearGradient id="finBarPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f59b" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="finBarPosActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity="1" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="finBarNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#9f1239" stopOpacity="0.45" />
                </linearGradient>
                <linearGradient id="finBarNegActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fb7185" stopOpacity="1" />
                  <stop offset="100%" stopColor="#be123c" stopOpacity="0.8" />
                </linearGradient>
                <filter id="trendGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.5" />
                </filter>
              </defs>

              {/* Horizontal grid lines & Y-axis labels */}
              {gridLevels.map(({ val, y }, idx) => (
                <g key={`grid-${idx}`}>
                  <line
                    x1={padLeft - 8}
                    x2={svgW - padRight}
                    y1={y}
                    y2={y}
                    stroke="rgba(146,180,190,.12)"
                    strokeDasharray="3 4"
                  />
                  <text
                    x={padLeft - 12}
                    y={y + 3}
                    textAnchor="end"
                    fill="#64748b"
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {formatCompactVal(val, currencyLabel)}
                  </text>
                </g>
              ))}

              {/* Baseline (Zero) */}
              <line
                x1={padLeft - 8}
                x2={svgW - padRight}
                y1={baseline}
                y2={baseline}
                stroke="#334155"
                strokeWidth="1.2"
              />

              {/* Multi-Period Bars */}
              {values.map((item, index) => {
                const raw = item.value?.raw ?? 0;
                const isPos = raw >= 0;
                const barY = isPos ? getY(raw) : baseline;
                const barH = Math.max(3, Math.abs(getY(raw) - baseline));
                const barX = getX(index) - barWidth / 2;
                const isItemActive = activeIndex === index;
                const change = yoyGrowth[index];

                return (
                  <g key={item.period.asOfDate} className="fin-bar-group">
                    {/* Background column highlight on hover */}
                    {isItemActive && (
                      <rect
                        x={getX(index) - barWidth}
                        y={padTop}
                        width={barWidth * 2}
                        height={chartH}
                        fill="rgba(56, 189, 248, 0.04)"
                        rx="4"
                      />
                    )}

                    {/* The Financial Bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barH}
                      rx="4"
                      fill={
                        isPos
                          ? isItemActive
                            ? "url(#finBarPosActive)"
                            : "url(#finBarPos)"
                          : isItemActive
                          ? "url(#finBarNegActive)"
                          : "url(#finBarNeg)"
                      }
                      stroke={isItemActive ? (isPos ? "#34d399" : "#fb7185") : "transparent"}
                      strokeWidth="1"
                    />

                    {/* YoY growth badge above bar */}
                    {change !== null && (
                      <g
                        transform={`translate(${getX(index)}, ${
                          isPos ? Math.max(14, barY - 10) : Math.min(svgH - 24, barY + barH + 14)
                        })`}
                        opacity={isItemActive ? 0.15 : 1}
                      >
                        <rect
                          x="-23"
                          y="-8"
                          width="46"
                          height="14"
                          rx="3"
                          fill={change >= 0 ? "rgba(0, 245, 155, 0.15)" : "rgba(244, 63, 94, 0.15)"}
                          stroke={change >= 0 ? "rgba(0, 245, 155, 0.4)" : "rgba(244, 63, 94, 0.4)"}
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="2.5"
                          textAnchor="middle"
                          fill={change >= 0 ? "#00f59b" : "#f43f5e"}
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="700"
                        >
                          {change >= 0 ? "+" : ""}
                          {change.toFixed(0)}%
                        </text>
                      </g>
                    )}

                    {index === 0 && (
                      <g
                        transform={`translate(${getX(index)}, ${Math.max(14, barY - 10)})`}
                        opacity={isItemActive ? 0.15 : 1}
                      >
                        <rect
                          x="-16"
                          y="-8"
                          width="32"
                          height="14"
                          rx="3"
                          fill="rgba(148, 163, 184, 0.12)"
                          stroke="rgba(148, 163, 184, 0.25)"
                          strokeWidth="0.8"
                        />
                        <text
                          x="0"
                          y="2.5"
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="700"
                        >
                          {t("statement.base")}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Connecting Trend Line */}
              {values.length > 1 && (
                <path
                  d={line}
                  fill="none"
                  stroke="#fbbf24"
                  strokeWidth="2.2"
                  filter="url(#trendGlow)"
                />
              )}

              {/* Milestone Dots & Interactive Cursor */}
              {values.map((item, index) => {
                const isItemActive = activeIndex === index;
                const raw = item.value?.raw ?? 0;
                const dotX = getX(index);
                const dotY = getY(raw);
                return (
                  <g key={`dot-${item.period.asOfDate}`}>
                    {isItemActive && (
                      <>
                        <line
                          x1={dotX}
                          x2={dotX}
                          y1={padTop}
                          y2={svgH - padBottom + 12}
                          stroke="rgba(56, 189, 248, 0.6)"
                          strokeDasharray="2 3"
                          strokeWidth="1.2"
                        />
                        <circle cx={dotX} cy={dotY} r="7" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6" />
                      </>
                    )}
                    <circle
                      cx={dotX}
                      cy={dotY}
                      r={isItemActive ? "4.5" : "3.5"}
                      fill="#091017"
                      stroke={isItemActive ? "#fbbf24" : "#f59e0b"}
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Years Bottom Axis */}
            <div className="statement-years-axis">
              {periods.map((period, idx) => (
                <div
                  key={period.asOfDate}
                  className={`year-tick ${activeIndex === idx ? "active" : ""}`}
                  onClick={() => setHoverIndex(idx)}
                >
                  <b>{year(period.asOfDate)}</b>
                  <small>{period.asOfDate.slice(5)}</small>
                </div>
              ))}
            </div>
          </div>

          {/* Comparative 4-Period Matrix Table */}
          {matrixRows.length > 0 && (
            <div className="statement-matrix-wrapper">
              <div className="matrix-table-title">
                <div className="table-heading-wrap">
                  <FileText size={13} />
                  <span>{t("statement.matrixTitle", { title: t(statementTitleKeys[statement].title) })}</span>
                </div>
                <small>{t("statement.matrixHint")}</small>
              </div>

              <div className="statement-matrix-scroll">
                <table className="statement-matrix-table">
                  <thead>
                    <tr>
                      <th className="th-metric">{t("statement.thMetric")}</th>
                      {periods.map((p) => (
                        <th key={p.asOfDate} className="th-year">
                          {year(p.asOfDate)}
                        </th>
                      ))}
                      <th className="th-growth">{t("statement.thChange")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map((r) => {
                      const isRowSelected = selected?.key === r.key;
                      const firstRaw = r.values[0]?.raw;
                      const lastRaw = r.values[r.values.length - 1]?.raw;
                      const periodGrowth =
                        firstRaw && lastRaw && firstRaw !== 0
                          ? ((lastRaw - firstRaw) / Math.abs(firstRaw)) * 100
                          : null;

                      return (
                        <tr
                          key={r.key}
                          className={`matrix-row ${isRowSelected ? "row-selected" : ""}`}
                          onClick={() => selectMetric(r.key)}
                        >
                          <td className="td-label">
                            <span className="row-indicator" />
                            <span>{financialRowLabel(t, r.key, r.label)}</span>
                          </td>
                          {periods.map((p, idx) => {
                            const val = r.values[idx];
                            return (
                              <td key={p.asOfDate} className="td-val">
                                {val?.formatted ?? "—"}
                              </td>
                            );
                          })}
                          <td className="td-growth">
                            {periodGrowth !== null ? (
                              <span className={`growth-chip ${periodGrowth >= 0 ? "pos" : "neg"}`}>
                                {periodGrowth >= 0 ? "+" : ""}
                                {periodGrowth.toFixed(0)}%
                              </span>
                            ) : (
                              <span className="growth-chip neutral">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Verification & Caption */}
          <div className="statement-chart-footer">
            <div className="caption-info">
              <CheckCircle2 size={12} className="text-emerald-400" />
              <span>
                {data?.chartAvailable ? t("statement.captionAudited") : t("statement.captionNormalized")}
              </span>
            </div>
            <div className="caption-source">
              <span>{t("statement.source")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePanel({ onOpenFullProfile }: { onOpenFullProfile: () => void }) {
  const { t } = useI18n();
  const { isBlockVisible } = useContent();
  const [downloadStep, setDownloadStep] = useState<"idle" | "language" | "format" | "ready" | "downloading">("idle");
  const [cvLanguage, setCvLanguage] = useState<"TR" | "EN">("TR");
  const [format, setFormat] = useState<"photo" | "plain">("photo");
  const cv = cvLibrary[cvLanguage][format];
  const chooseLanguage = (next: "TR" | "EN") => { setCvLanguage(next); setDownloadStep("format"); };
  const chooseFormat = (next: "photo" | "plain") => { setFormat(next); setDownloadStep("ready"); };
  const beginDownload = () => {
    setDownloadStep("downloading");
    window.setTimeout(() => {
      const anchor = document.createElement("a");
      anchor.href = cv.href;
      anchor.download = cv.file;
      anchor.click();
      setDownloadStep("ready");
    }, 600);
  };

  return (
    <div className="profile-terminal profile-card-modern">
      <div className="profile-identity">
        <div className="profile-photo-wrapper">
          <img src={profilePhoto} alt="Onur İnal" />
          <span className="profile-badge-dot" title={t("profile.badgeTitle")} />
        </div>
        <div className="profile-bio-text">
          <div className="profile-kicker">{t("profile.kicker")}</div>
          <h1>{t("profile.name")}</h1>
          <p>{t("profile.role")}</p>
          <div className="profile-links">
            {isBlockVisible("profile.linkedin") && (
              <a href={linkedInUrl} target="_blank" rel="noreferrer" className="profile-social-link">
                <Linkedin size={13} /> {t("profile.linkedin")} <ExternalLink size={11} />
              </a>
            )}
            <button onClick={onOpenFullProfile} className="profile-expand-link">
              <UserRound size={13} /> {t("profile.fullProfile")} <ArrowUpRight size={11} />
            </button>
          </div>
        </div>
        {isBlockVisible("profile.gpa") && (
          <div className="profile-mark">
            <b>{t("profile.gpaValue")}</b>
            <small>{t("profile.gpaLabel")}</small>
          </div>
        )}
      </div>

      <div className="profile-highlights-grid">
        {isBlockVisible("profile.research") && (
          <div className="highlight-pill">
            <BookOpen size={15} />
            <div>
              <span>{t("profile.researchLabel")}</span>
              <b>{t("profile.researchValue")}</b>
            </div>
          </div>
        )}
        {isBlockVisible("profile.tech") && (
          <div className="highlight-pill">
            <Code2 size={15} />
            <div>
              <span>{t("profile.techLabel")}</span>
              <b>{t("profile.techValue")}</b>
            </div>
          </div>
        )}
      </div>

      <div className="profile-summary">
        <span>{t("profile.summaryLabel")}</span>
        <p>{t("profile.summaryText")}</p>
      </div>

      {isBlockVisible("profile.cvDownload") && (
      <div className={`cv-selector cv-step-${downloadStep}`}>
        <div className="cv-info">
          <span>{t("cv.title")}</span>
          <p>
            {downloadStep === "idle" ? t("cv.stepIdle") :
             downloadStep === "language" ? t("cv.stepLanguage") :
             downloadStep === "format" ? t("cv.stepFormat") :
             downloadStep === "downloading" ? t("cv.stepDownloading") :
             t("cv.stepReady")}
          </p>
        </div>
        {downloadStep === "idle" && (
          <button className="cv-start" onClick={() => setDownloadStep("language")}>
            <Download size={14} /> {t("cv.start")} <ChevronDown size={13} />
          </button>
        )}
        {downloadStep === "language" && (
          <div className="cv-split">
            <button onClick={() => chooseLanguage("TR")}>{t("cv.langTr")}</button>
            <button onClick={() => chooseLanguage("EN")}>{t("cv.langEn")}</button>
          </div>
        )}
        {downloadStep === "format" && (
          <div className="cv-split">
            <button onClick={() => chooseFormat("photo")}>{t("cv.formatPhoto")}</button>
            <button onClick={() => chooseFormat("plain")}>{t("cv.formatAts")}</button>
          </div>
        )}
        {downloadStep === "ready" && (
          <button className="cv-start" onClick={beginDownload}>
            <Download size={14} />{" "}
            {t("cv.downloadCta", {
              language: cvLanguage === "TR" ? t("cv.langTr") : t("cv.langEn"),
              label: t(cv.labelKey),
            })}
          </button>
        )}
        {downloadStep === "downloading" && (
          <button className="cv-start downloading" disabled>
            <Activity size={14} /> {t("cv.preparing")}
          </button>
        )}
      </div>
      )}
    </div>
  );
}

function ProfileView({ onBack, onContact }: { onBack: () => void; onContact: () => void }) {
  const { t } = useI18n();
  const { isBlockVisible } = useContent();
  const downloadCv = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    toast.success(t("toast.cvStarted"));
  };

  return (
    <div className="profile-view-module">
      <div className="module-banner">
        <div>
          <span>{t("profileView.kicker")}</span>
          <h1>{t("profile.name")}</h1>
          <p>{t("profileView.education")}</p>
        </div>
        <div className="banner-actions">
          <button onClick={onBack} className="btn-secondary">
            <Grid2X2 size={14} /> {t("common.backToDashboard")}
          </button>
          <button onClick={onContact} className="btn-primary">
            <Mail size={14} /> {t("common.contactCta")}
          </button>
        </div>
      </div>

      <div className="profile-full-layout">
        <aside className="profile-sidebar-card">
          <div className="analyst-head">
            <div className="analyst-avatar-box">
              <img src={profilePhoto} alt="Onur İnal" />
            </div>
            <h2>{t("profile.name")}</h2>
            <p>{t("profileView.role")}</p>
            {isBlockVisible("profileView.gpa") && (
              <div className="analyst-gpa-badge">
                <span>{t("profileView.gpaLabel")}</span>
                <b>{t("profileView.gpaValue")} <small>{t("profileView.gpaScale")}</small></b>
              </div>
            )}
          </div>

          <div className="analyst-facts">
            <div className="fact-row">
              <span>{t("profileView.factUniversity")}</span>
              <b>{t("profileView.factUniversityValue")}</b>
            </div>
            <div className="fact-row">
              <span>{t("profileView.factMajor")}</span>
              <b>{t("profileView.factMajorValue")}</b>
            </div>
            <div className="fact-row">
              <span>{t("profileView.factDoubleMajor")}</span>
              <b>{t("profileView.factDoubleMajorValue")}</b>
            </div>
            <div className="fact-row">
              <span>{t("profileView.factTerm")}</span>
              <b>{t("profileView.factTermValue")}</b>
            </div>
            <div className="fact-row">
              <span>{t("profileView.factAward")}</span>
              <b className="text-amber">{t("profileView.factAwardValue")}</b>
            </div>
            <div className="fact-row">
              <span>{t("profileView.factLanguages")}</span>
              <b>{t("profileView.factLanguagesValue")}</b>
            </div>
            <div className="fact-row">
              <span>{t("profileView.factLocation")}</span>
              <b>{t("profileView.factLocationValue")}</b>
            </div>
          </div>

          <div className="analyst-social-stack">
            <a href={linkedInUrl} target="_blank" rel="noreferrer">
              <Linkedin size={15} /> {t("profileView.linkedinLink")} <ExternalLink size={12} />
            </a>
            <a href={`mailto:${email}`}>
              <Mail size={15} /> {email} <ArrowUpRight size={12} />
            </a>
            <a href="https://measure-moat.vercel.app/#roadmap" target="_blank" rel="noreferrer">
              <BookOpen size={15} /> {t("profileView.moatLink")} <ExternalLink size={12} />
            </a>
          </div>

          <div className="cv-download-center">
            <div className="cv-center-title">
              <FileText size={14} />
              <span>{t("profileView.cvCenter")}</span>
            </div>
            <div className="cv-cards-grid">
              <button onClick={() => downloadCv("/cv/Onur_Inal_CV_TR_Fotografli.pdf", "Onur_Inal_CV_TR_Fotografli.pdf")}>
                <Download size={13} />
                <div>
                  <b>{t("profileView.cvTrPhoto")}</b>
                  <small>{t("profileView.cvTrPhotoNote")}</small>
                </div>
              </button>
              <button onClick={() => downloadCv("/cv/Onur_Inal_CV_TR_ATS.pdf", "Onur_Inal_CV_TR_ATS.pdf")}>
                <Download size={13} />
                <div>
                  <b>{t("profileView.cvTrAts")}</b>
                  <small>{t("profileView.cvTrAtsNote")}</small>
                </div>
              </button>
              <button onClick={() => downloadCv("/cv/Onur_Inal_CV_EN_Fotografli.pdf", "Onur_Inal_CV_EN_Fotografli.pdf")}>
                <Download size={13} />
                <div>
                  <b>{t("profileView.cvEnPhoto")}</b>
                  <small>{t("profileView.cvEnPhotoNote")}</small>
                </div>
              </button>
              <button onClick={() => downloadCv("/cv/Onur_Inal_CV_EN_ATS.pdf", "Onur_Inal_CV_EN_ATS.pdf")}>
                <Download size={13} />
                <div>
                  <b>{t("profileView.cvEnAts")}</b>
                  <small>{t("profileView.cvEnAtsNote")}</small>
                </div>
              </button>
            </div>
          </div>
        </aside>

        <div className="profile-main-content">
          <section className="profile-section-card">
            <div className="section-card-head">
              <Briefcase size={16} />
              <h2>{t("profileView.visionTitle")}</h2>
            </div>
            <p className="philosophy-text">{t("profileView.visionP1")}</p>
            <p className="philosophy-text">{t("profileView.visionP2")}</p>
          </section>

          <section className="profile-section-card">
            <div className="section-card-head">
              <GraduationCap size={16} />
              <h2>{t("profileView.academicTitle")}</h2>
            </div>
            <div className="academic-timeline">
              <div className="academic-item">
                <div className="academic-dot" />
                <div className="academic-body">
                  <div className="academic-header">
                    <b>{t("profileView.academicSchool")}</b>
                    <span>{t("profileView.academicPeriod")}</span>
                  </div>
                  <p>
                    {t("profileView.academicDetail")} <b>{t("profileView.academicGpa")}</b>
                  </p>
                  {isBlockVisible("profileView.awards") && (
                    <div className="award-callout">
                      <Award size={15} />
                      <span><b>{t("profileView.awardTitle")}</b> {t("profileView.awardDesc")}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="coursework-tags">
              <span>{t("profileView.courseworkLabel")}</span>
              <em>{t("profileView.course1")}</em>
              <em>{t("profileView.course2")}</em>
              <em>{t("profileView.course3")}</em>
              <em>{t("profileView.course4")}</em>
              <em>{t("profileView.course5")}</em>
              <em>{t("profileView.course6")}</em>
              <em>{t("profileView.course7")}</em>
            </div>
          </section>

          <section className="profile-section-card">
            <div className="section-card-head">
              <Layers size={16} />
              <h2>{t("profileView.matrixTitle")}</h2>
            </div>
            <div className="matrix-grid">
              <div className="matrix-card">
                <b>{t("profileView.matrix1Title")}</b>
                <ul>
                  <li>{t("profileView.matrix1Item1")}</li>
                  <li>{t("profileView.matrix1Item2")}</li>
                  <li>{t("profileView.matrix1Item3")}</li>
                  <li>{t("profileView.matrix1Item4")}</li>
                </ul>
              </div>
              <div className="matrix-card">
                <b>{t("profileView.matrix2Title")}</b>
                <ul>
                  <li>{t("profileView.matrix2Item1")}</li>
                  <li>{t("profileView.matrix2Item2")}</li>
                  <li>{t("profileView.matrix2Item3")}</li>
                  <li>{t("profileView.matrix2Item4")}</li>
                </ul>
              </div>
              <div className="matrix-card">
                <b>{t("profileView.matrix3Title")}</b>
                <ul>
                  <li>{t("profileView.matrix3Item1")}</li>
                  <li>{t("profileView.matrix3Item2")}</li>
                  <li>{t("profileView.matrix3Item3")}</li>
                  <li>{t("profileView.matrix3Item4")}</li>
                </ul>
              </div>
              <div className="matrix-card">
                <b>{t("profileView.matrix4Title")}</b>
                <ul>
                  <li>{t("profileView.matrix4Item1")}</li>
                  <li>{t("profileView.matrix4Item2")}</li>
                  <li>{t("profileView.matrix4Item3")}</li>
                  <li>{t("profileView.matrix4Item4")}</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="profile-section-card highlight-card">
            <div className="section-card-head">
              <BookOpen size={16} />
              <h2>{t("profileView.moatTitle")}</h2>
            </div>
            <p>{t("profileView.moatDesc")}</p>
            <div className="project-action-row">
              <a href="https://measure-moat.vercel.app/#roadmap" target="_blank" rel="noreferrer" className="btn-accent">
                <ExternalLink size={14} /> {t("profileView.moatCta")}
              </a>
              <button onClick={onContact} className="btn-outline">
                <Mail size={14} /> {t("profileView.moatContact")}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SummaryPanel({
  markets,
  isRefreshing,
  selectedSymbol,
  onSelect,
}: {
  markets: MarketRow[];
  isRefreshing: boolean;
  selectedSymbol?: string;
  onSelect?: (symbol: string) => void;
}) {
  const { t } = useI18n();
  const bySymbol = (symbol: string) => markets.find((item) => item.symbol === symbol);
  const benchmarks = [
    "BIST 100",
    "S&P 500",
    "NASDAQ 100",
    "USD/TRY",
    "ALTIN",
    "PETROL",
  ].map(bySymbol).filter(Boolean) as MarketRow[];

  const movers = markets
    .filter((item) => item.kind === "HİSSE" && item.last > 0 && Number.isFinite(pctNumber(item)))
    .sort((a, b) => pctNumber(b) - pctNumber(a));
  const advance = movers.filter((item) => item.tone === "up").length;
  const decline = movers.filter((item) => item.tone === "down").length;
  const pulse = movers.length ? Math.round((advance / movers.length) * 100) : 50;
  const topGainer = movers[0];
  const topLoser = movers.at(-1);

  return (
    <div className="summary-terminal summary-revamp">
      <div className="summary-hero">
        <div className="summary-pulse">
          <span className="summary-section-label">{t("summary.sessionCompass")}</span>
          <div className="pulse-pill-wrap">
            <span className={`pulse-badge ${advance >= decline ? "up" : "down"}`}>
              {advance >= decline ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {advance >= decline ? t("summary.buyerLed") : t("summary.sellerLed")}
            </span>
            <small>{t("summary.breadth", { advance, decline })}</small>
          </div>
        </div>
        <div className="summary-gauge">
          <div className="gauge-header">
            <span>{t("summary.riskAppetite")}</span>
            <b className={pulse < 35 ? "tone-down" : pulse > 65 ? "tone-up" : "tone-neutral"}>
              {pulse} / 100
            </b>
          </div>
          <div className="gauge-track">
            <i
              className={pulse < 35 ? "risk-low" : "risk-normal"}
              style={{ width: `${Math.max(8, Math.min(100, pulse))}%` }}
            />
          </div>
        </div>
      </div>

      <div className="summary-grid-modern">
        {benchmarks.map((item) => {
          const isSelected = item.symbol === selectedSymbol;
          return (
            <button
              type="button"
              key={item.symbol}
              className={`summary-card-modern ${isSelected ? "selected" : ""}`}
              onClick={() => onSelect?.(item.symbol)}
              title={t("common.openChart", { symbol: item.symbol })}
            >
              <div className="summary-card-row-top">
                <span className="summary-card-sym">{lookupLabel(t, "symbol", item.symbol)}</span>
                <span className="summary-card-price">{item.value}</span>
              </div>
              <div className="summary-card-row-bot">
                <div className="summary-card-subtag">
                  <span className="summary-card-curr">{item.currency}</span>
                  <span className={`summary-card-change ${item.tone}`}>{item.change}</span>
                </div>
                <span className={`summary-card-pill ${item.tone}`}>
                  {item.tone === "up" ? <TrendingUp size={9} /> : item.tone === "down" ? <TrendingDown size={9} /> : <Minus size={9} />}
                  {item.pct}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="summary-movers-modern">
        <div
          className="mover-card mover-gain"
          onClick={() => topGainer && onSelect?.(topGainer.symbol)}
          role="button"
          tabIndex={0}
          title={topGainer ? t("common.openChart", { symbol: topGainer.symbol }) : undefined}
        >
          <div className="mover-tag up">
            <TrendingUp size={12} />
            <span>{t("summary.topGainer")}</span>
          </div>
          <div className="mover-data">
            <b>{topGainer?.symbol ?? "—"}</b>
            {topGainer?.sourceName && (
              <span className="mover-company">{topGainer.sourceName}</span>
            )}
            <strong className="up">{topGainer?.pct ?? "—"}</strong>
          </div>
        </div>

        <div
          className="mover-card mover-lose"
          onClick={() => topLoser && onSelect?.(topLoser.symbol)}
          role="button"
          tabIndex={0}
          title={topLoser ? t("common.openChart", { symbol: topLoser.symbol }) : undefined}
        >
          <div className="mover-tag down">
            <TrendingDown size={12} />
            <span>{t("summary.topLoser")}</span>
          </div>
          <div className="mover-data">
            <b>{topLoser?.symbol ?? "—"}</b>
            {topLoser?.sourceName && (
              <span className="mover-company">{topLoser.sourceName}</span>
            )}
            <strong className="down">{topLoser?.pct ?? "—"}</strong>
          </div>
        </div>
      </div>

      <div className="summary-footer-modern">
        <div className="summary-footer-left">
          <Activity size={12} />
          <span>{t("summary.depth", { count: markets.length })}</span>
        </div>
        <div className="summary-footer-right">
          <span className={`feed-indicator ${isRefreshing ? "refreshing" : "live"}`}>
            <i />
            {isRefreshing ? t("summary.updating") : t("summary.live")}
          </span>
        </div>
      </div>
    </div>
  );
}

function FinancialAnalysisPanel({ row, points, statement, onOpenResearch }: { row: MarketRow; points: ChartPoint[]; statement: FinancialStatementKind; onOpenResearch: () => void }) {
  const { t } = useI18n();
  const [dockStatement, setDockStatement] = useState<FinancialStatementKind>(statement);

  useEffect(() => {
    setDockStatement(statement);
  }, [statement]);

  const request = trpc.market.statements.useQuery({ symbol: row.providerSymbol, statement: dockStatement }, { staleTime: 45_000, retry: 1 });
  const statements = request.data as FinancialStatementsData | undefined;
  const valid = points.filter((point) => point.high !== null && point.low !== null && point.close !== null);
  const high = valid.length ? Math.max(...valid.map((point) => point.high!)) : null;
  const low = valid.length ? Math.min(...valid.map((point) => point.low!)) : null;
  const position = high !== null && low !== null && high !== low && row.last > 0 ? Math.round(((row.last - low) / (high - low)) * 100) : null;
  const rangePct = high !== null && low !== null && low !== 0 ? ((high - low) / low) * 100 : null;

  const rowsByKey = useMemo(() => new Map((statements?.rows ?? []).map((item) => [item.key, item])), [statements?.rows]);

  const topMetricKey = dockStatement === "income" ? "revenue" : dockStatement === "balance" ? "assets" : "operatingCashFlow";
  const benchmarkRaw = rowsByKey.get(topMetricKey)?.values.at(-1)?.raw ?? 0;

  const latest = statementDetailKeys[dockStatement]
    .map((key) => rowsByKey.get(key))
    .filter(Boolean)
    .map((item) => {
      const lastVal = item!.values.at(-1);
      const isKeyMetric = ["revenue", "grossProfit", "operatingIncome", "netIncome", "assets", "equity", "debt", "operatingCashFlow", "freeCashFlow"].includes(item!.key);
      const ratio = benchmarkRaw > 0 && lastVal?.raw ? (lastVal.raw / benchmarkRaw) * 100 : null;
      return {
        key: item!.key,
        label: financialRowLabel(t, item!.key, item!.label),
        value: lastVal,
        isKeyMetric,
        ratio,
      };
    })
    .filter((item) => item.value);

  const lastPeriod = statements?.periods.at(-1);
  const lastYear = lastPeriod ? lastPeriod.asOfDate.slice(0, 4) : t("analysis.annualFallback");

  return (
    <>
      <section className="analysis-dock analysis-dock-expanded financial-analysis-panel">
        <div className="analysis-dock-head"><span>{t("analysis.title")}</span><b>{row.symbol}</b></div>
        <div className="analysis-ticker"><span>{row.sourceName ?? row.symbol}</span><small>YAHOO FINANCE · {row.marketState ?? t("chart.delayed")}</small></div>
        <div className="analysis-price"><span>{t("analysis.lastPrice")}</span><b>{row.value}</b><em className={row.tone}>{row.change} ({row.pct})</em></div>
        <div className="analysis-metrics"><div><span>{t("analysis.periodHigh")}</span><b>{high === null ? "—" : formatPrice(high, row.precision)}</b></div><div><span>{t("analysis.periodLow")}</span><b>{low === null ? "—" : formatPrice(low, row.precision)}</b></div></div>
        <div className="analysis-position"><span>{t("analysis.pricePosition")}</span><div><i style={{ width: `${position ?? 0}%` }}/></div><b>{position === null ? t("analysis.awaitingData") : formatPercent(position)}</b></div>
        <div className="analysis-signal-grid"><div><span>{t("analysis.periodRange")}</span><b>{rangePct === null ? "—" : formatPercent(formatPrice(rangePct, 2))}</b></div><div><span>{t("analysis.candleCount")}</span><b>{valid.length || "—"}</b></div><div><span>{t("analysis.priceState")}</span><b className={row.tone}>{row.tone === "up" ? t("analysis.positive") : row.tone === "down" ? t("analysis.negative") : t("analysis.neutral")}</b></div><div><span>{t("analysis.dataCoverage")}</span><b>{valid.length ? "OHLC" : t("analysis.pending")}</b></div></div>
      </section>

      {/* Upgraded Annual Financials Dock Section */}
      <section className="annual-financial-panel" aria-label={t("analysis.annualAria", { symbol: row.symbol })}>
        <div className="annual-financial-head">
          <div className="annual-head-title">
            <span>{t("analysis.annualTitle")}</span>
            <span className="annual-year-chip">{lastYear}</span>
          </div>
          <div className="annual-statement-tabs" role="tablist">
            <button
              className={dockStatement === "income" ? "active" : ""}
              onClick={() => setDockStatement("income")}
              title={t("analysis.tabIncomeTitle")}
            >
              {t("analysis.tabIncome")}
            </button>
            <button
              className={dockStatement === "balance" ? "active" : ""}
              onClick={() => setDockStatement("balance")}
              title={t("analysis.tabBalanceTitle")}
            >
              {t("analysis.tabBalance")}
            </button>
            <button
              className={dockStatement === "cashflow" ? "active" : ""}
              onClick={() => setDockStatement("cashflow")}
              title={t("analysis.tabCashTitle")}
            >
              {t("analysis.tabCash")}
            </button>
          </div>
        </div>

        <div className="annual-statement-subtitle">
          <FileText size={11} />
          <span>{t(statementTitleKeys[dockStatement].title)}</span>
          <em>{statements?.chartCurrency ?? row.currency ?? "TRY"}</em>
        </div>

        <div className="annual-financial-list">
          {latest.length ? (
            latest.map((item) => (
              <div
                className={`analysis-fundamental-row ${item.isKeyMetric ? "key-metric-row" : ""}`}
                key={item.label}
              >
                <div className="fundamental-row-left">
                  <span className="fundamental-label">{item.label}</span>
                  {item.ratio !== null && dockStatement === "income" && item.key !== "revenue" && (
                    <span
                      className={`fundamental-ratio-tag ${
                        item.ratio >= 0 ? "positive" : "negative"
                      }`}
                    >
                      {t("analysis.marginTag", { value: item.ratio.toFixed(1) })}
                    </span>
                  )}
                  {item.ratio !== null && dockStatement === "balance" && item.key !== "assets" && (
                    <span className="fundamental-ratio-tag neutral">
                      {t("analysis.shareTag", { value: item.ratio.toFixed(0) })}
                    </span>
                  )}
                </div>

                <div className="fundamental-row-right">
                  <b className="fundamental-value">{item.value?.formatted}</b>
                  <small className="fundamental-currency">{item.value?.currency ?? row.currency}</small>
                </div>
              </div>
            ))
          ) : (
            <div className="analysis-fundamental-empty">
              {request.isFetching ? (
                <div className="annual-loading">
                  <Activity size={14} className="animate-spin" />
                  <span>{t("analysis.loadingAnnual")}</span>
                </div>
              ) : (
                t("analysis.noStatement", { statement: t(statementLabelKeys[dockStatement]) })
              )}
            </div>
          )}
        </div>

        <div className="analysis-method">
          <Info size={13} />
          <span>{t("analysis.method")}</span>
        </div>

        <button className="annual-research-btn" onClick={onOpenResearch}>
          <BookOpen size={14} /> {t("analysis.reportLibrary")} <ArrowUpRight size={13} />
        </button>
      </section>
    </>
  );
}

/**
 * Makro göstergeler canlı bir veri kaynağından değil, elle güncellenen bir anlık
 * görüntüden gelir. Değerler ve tarih yönetim panelinden düzenlenir; panel hiç
 * kullanılmamışsa koddaki varsayılanlar (content/defaults.ts) gösterilir.
 */
function MacroEconomyPanel() {
  const { t, locale, language } = useI18n();
  const { macroIndicators, macroSnapshotDate } = useContent();

  const snapshotDate = useMemo(() => {
    const parsed = new Date(`${macroSnapshotDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return macroSnapshotDate;
    return parsed.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  }, [macroSnapshotDate, locale]);

  return (
    <div className="macro-economy-panel">
      <div className="macro-grid">
        {macroIndicators.map((item) => (
          <div key={item.id} className="macro-item">
            <span className="macro-item-label">{item.label[language]}</span>
            <div className="macro-item-val-row">
              <b className="macro-item-val">{item.value[language]}</b>
              <small className={`macro-item-tag ${item.tone}`}>{item.note[language]}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="macro-snapshot-note">
        <span>{t("macro.snapshotLabel", { date: snapshotDate })}</span>
        <small>{t("macro.snapshotSources")}</small>
      </div>
    </div>
  );
}

/**
 * Seans tanımları. Saatler borsanın kendi yerel saatiyle, dakika cinsinden tutulur;
 * açık/kapalı rozeti IANA saat dilimi üzerinden hesaplandığı için yaz saati geçişlerinde kaymaz.
 */
type MarketSession = {
  id: string;
  marketKey: TranslationKey;
  cityKey: TranslationKey;
  timeZone: string;
  open: number;
  close: number;
  /** Öğle arası gibi seans içi molalar (Tokyo). */
  breaks?: Array<[number, number]>;
};

const marketSessions: MarketSession[] = [
  { id: "bist", marketKey: "hours.bist", cityKey: "hours.bistCity", timeZone: "Europe/Istanbul", open: 600, close: 1080 },
  { id: "nyse", marketKey: "hours.nyse", cityKey: "hours.nyseCity", timeZone: "America/New_York", open: 570, close: 960 },
  { id: "lse", marketKey: "hours.lse", cityKey: "hours.lseCity", timeZone: "Europe/London", open: 480, close: 990 },
  {
    id: "tse",
    marketKey: "hours.tse",
    cityKey: "hours.tseCity",
    timeZone: "Asia/Tokyo",
    open: 540,
    close: 930,
    breaks: [[690, 750]],
  },
];

function minutesLabel(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Borsanın kendi saat diliminde o anki gün ve dakika. */
function marketLocalTime(timeZone: string, now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const hour = Number(pick("hour")) % 24;
  return { weekday: pick("weekday"), minutes: hour * 60 + Number(pick("minute")) };
}

/** Resmî tatiller kapsam dışıdır; hafta sonu ve seans saatleri dikkate alınır. */
function isSessionOpen(session: MarketSession, now: Date) {
  const { weekday, minutes } = marketLocalTime(session.timeZone, now);
  if (weekday === "Sat" || weekday === "Sun") return false;
  if (minutes < session.open || minutes >= session.close) return false;
  return !session.breaks?.some(([from, to]) => minutes >= from && minutes < to);
}

function MarketHoursPanel() {
  const { t } = useI18n();
  const { isSessionEnabled } = useContent();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="market-hours-panel">
      <div className="hours-list">
        {marketSessions.filter((session) => isSessionEnabled(session.id)).map((session) => {
          const live = isSessionOpen(session, now);
          return (
            <div key={session.id} className="hours-row">
              <div className="hours-info">
                <b>{t(session.marketKey)}</b>
                <small>
                  {minutesLabel(session.open)} — {minutesLabel(session.close)} · {t(session.cityKey)}
                </small>
              </div>
              <span className={`hours-badge ${live ? "live" : "closed"}`}>
                <i /> {live ? t("hours.open") : t("hours.closed")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const valuationConcepts: Array<{ id: string; titleKey: TranslationKey; descKey: TranslationKey }> = [
  { id: "dcf", titleKey: "valuation.dcfTitle", descKey: "valuation.dcfDesc" },
  { id: "roic", titleKey: "valuation.roicTitle", descKey: "valuation.roicDesc" },
  { id: "dupont", titleKey: "valuation.dupontTitle", descKey: "valuation.dupontDesc" },
  { id: "peer", titleKey: "valuation.peerTitle", descKey: "valuation.peerDesc" },
];

function ValuationDeskPanel({ onOpenResearch }: { onOpenResearch: () => void }) {
  const { t } = useI18n();
  return (
    <div className="valuation-desk-panel">
      <div className="valuation-card-list">
        {valuationConcepts.map((concept) => (
          <div key={concept.id} className="valuation-card">
            <b>{t(concept.titleKey)}</b>
            <p>{t(concept.descKey)}</p>
          </div>
        ))}
      </div>
      <div className="valuation-footer">
        <button onClick={onOpenResearch} className="valuation-link-btn">
          <BookOpen size={13} /> {t("valuation.cta")} <ArrowUpRight size={12} />
        </button>
      </div>
    </div>
  );
}

function WatchlistPanel({
  tab,
  onTab,
  category,
  onCategory,
  watchRows,
  discoveryRows,
  recentRows,
  selectedSymbol,
  onSelect,
  onClearRecent,
  onOpenChart,
}: {
  tab: "WATCH" | "DISCOVER";
  onTab: (tab: "WATCH" | "DISCOVER") => void;
  category: WatchCategory;
  onCategory: (category: WatchCategory) => void;
  watchRows: MarketRow[];
  discoveryRows: MarketRow[];
  recentRows: MarketRow[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  onClearRecent: () => void;
  onOpenChart?: (symbol: string) => void;
}) {
  const { t } = useI18n();
  const [scanMode, setScanMode] = useState<"ALL" | "GAINERS" | "LOSERS" | "VOLATILE">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [watchSearch, setWatchSearch] = useState("");

  const filteredWatchRows = useMemo(() => {
    if (!watchSearch.trim()) return watchRows;
    const q = watchSearch.trim().toUpperCase();
    return watchRows.filter(
      (r) =>
        r.symbol.toUpperCase().includes(q) ||
        (r.sourceName && r.sourceName.toUpperCase().includes(q)) ||
        r.kind.toUpperCase().includes(q)
    );
  }, [watchRows, watchSearch]);

  const selectedRow = useMemo(() => {
    return (
      watchRows.find((r) => r.symbol === selectedSymbol) ??
      discoveryRows.find((r) => r.symbol === selectedSymbol) ??
      null
    );
  }, [watchRows, discoveryRows, selectedSymbol]);

  const stocks = useMemo(() => {
    return discoveryRows.filter((item) => Number.isFinite(pctNumber(item)) || item.last > 0);
  }, [discoveryRows]);

  const gainers = useMemo(() => [...stocks].sort((a, b) => pctNumber(b) - pctNumber(a)), [stocks]);
  const losers = useMemo(() => [...stocks].sort((a, b) => pctNumber(a) - pctNumber(b)), [stocks]);
  const volatile = useMemo(() => [...stocks].sort((a, b) => Math.abs(pctNumber(b)) - Math.abs(pctNumber(a))), [stocks]);

  const scannedItems = useMemo(() => {
    let list: MarketRow[] = [];
    if (scanMode === "GAINERS") list = gainers;
    else if (scanMode === "LOSERS") list = losers;
    else if (scanMode === "VOLATILE") list = volatile;
    else list = stocks;

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toUpperCase();
      list = list.filter((r) => r.symbol.toUpperCase().includes(q) || (r.sourceName && r.sourceName.toUpperCase().includes(q)) || r.kind.toUpperCase().includes(q));
    }
    return list;
  }, [scanMode, gainers, losers, volatile, stocks, searchTerm]);

  return (
    <div className="watchlist-container">
      <div className="watch-panel-tabs">
        <button className={tab === "WATCH" ? "active" : ""} onClick={() => onTab("WATCH")}>
          {t("watch.tabWatch")}
        </button>
        <button className={tab === "DISCOVER" ? "active" : ""} onClick={() => onTab("DISCOVER")}>
          {t("watch.tabDiscover")}
        </button>
      </div>

      {tab === "WATCH" ? (
        <div className="watchlist-inner-wrap">
          <div className="watchlist-label">
            <span>{t("watch.universeLabel")}</span>
            <small>{t("watch.symbolCount", { shown: filteredWatchRows.length, total: watchRows.length })}</small>
          </div>

          <div className="watchlist-search-box">
            <div className="watchlist-search-inner">
              <Search size={12} />
              <input
                type="text"
                placeholder={t("watch.filterPlaceholder")}
                value={watchSearch}
                onChange={(e) => setWatchSearch(e.target.value)}
              />
              {watchSearch && (
                <button onClick={() => setWatchSearch("")} className="watchlist-search-clear" aria-label={t("watch.clearSearch")}>
                  ×
                </button>
              )}
            </div>
          </div>

          <div className="watchlist-filters">
            {(["TÜMÜ", "TÜRKİYE", "ABD", "MAKRO"] as WatchCategory[]).map((item) => (
              <button key={item} className={category === item ? "active" : ""} onClick={() => onCategory(item)}>
                {lookupLabel(t, "category", item)}
              </button>
            ))}
          </div>

          <div className="watchlist-scroll-list">
            {filteredWatchRows.map((item) => {
              const pctVal = Math.min(100, Math.max(8, Math.abs(pctNumber(item)) * 14));
              const isSelected = selectedSymbol === item.symbol;
              return (
                <div className={isSelected ? "watch-row selected" : "watch-row"} key={item.providerSymbol}>
                  <div className="watch-row-select" onClick={() => onSelect(item.symbol)}>
                    <div className="watch-item-sym-col">
                      <div className="watch-item-sym-row">
                        <b>{lookupLabel(t, "symbol", item.symbol)}</b>
                        <span className="watch-kind-badge">{lookupLabel(t, "kind", item.kind)}</span>
                      </div>
                      <small className="watch-item-name">{item.sourceName ? item.sourceName : lookupLabel(t, "symbol", item.symbol)}</small>
                    </div>
                    <div className="watch-item-bar-col" title={t("watch.changeStrength", { pct: item.pct })}>
                      <div className="watch-bar-track">
                        <div
                          className={`watch-bar-fill ${item.tone}`}
                          style={{ width: `${pctVal}%` }}
                        />
                      </div>
                    </div>
                    <div className="watch-item-val-col">
                      <strong>{item.value}</strong>
                      <em className={`watch-item-pill ${item.tone}`}>
                        {item.tone === "up" ? <TrendingUp size={10} /> : item.tone === "down" ? <TrendingDown size={10} /> : null}
                        {item.pct}
                      </em>
                    </div>
                    <button
                      type="button"
                      className="watch-chart-quick-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.symbol);
                        onOpenChart?.(item.symbol);
                      }}
                      title={t("common.openChart", { symbol: item.symbol })}
                    >
                      <LineChart size={12} />
                      <span>{t("common.chart")}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedRow && (
            <div className="watchlist-mobile-sticky-action">
              <div className="sticky-action-info">
                <span className="sticky-dot" />
                <div className="sticky-text-wrap">
                  <b>{lookupLabel(t, "symbol", selectedRow.symbol)}</b>
                  <span className="sticky-val">{selectedRow.value}</span>
                  <span className={`sticky-pill ${selectedRow.tone}`}>{selectedRow.pct}</span>
                </div>
              </div>
              <button
                type="button"
                className="sticky-action-btn"
                onClick={() => onOpenChart?.(selectedRow.symbol)}
              >
                <LineChart size={14} />
                <span>{t("watch.viewChart")}</span>
              </button>
            </div>
          )}

          <div className="watchlist-footnote">
            <Info size={11} />
            <span>{t("watch.footnote")}</span>
          </div>
        </div>
      ) : (
        <div className="discovery-workspace">
          {/* Category Switcher */}
          <div className="watchlist-filters discovery-filters">
            {(["TÜMÜ", "TÜRKİYE", "ABD", "MAKRO"] as WatchCategory[]).map((item) => (
              <button key={item} className={category === item ? "active" : ""} onClick={() => onCategory(item)}>
                {lookupLabel(t, "category", item)}
              </button>
            ))}
          </div>

          {/* SON İNCELENENLER / SON AÇILANLAR */}
          <section className="recent-group">
            <div className="recent-group-head">
              <span className="recent-group-title">
                <History size={13} />
                <b>{t("discovery.recentTitle")}</b>
                <small className="recent-count">{recentRows.length}</small>
              </span>
              {recentRows.length > 0 && (
                <button className="recent-clear-btn" onClick={onClearRecent} title={t("discovery.clearRecentTitle")}>
                  <Trash2 size={12} /> {t("common.clear")}
                </button>
              )}
            </div>
            {recentRows.length > 0 ? (
              <div className="recent-items-list">
                {recentRows.map((item) => (
                  <div
                    key={`recent-${item.providerSymbol}`}
                    className={`recent-item-btn ${selectedSymbol === item.symbol ? "selected" : ""}`}
                    onClick={() => onSelect(item.symbol)}
                  >
                    <div className="recent-item-left">
                      <b>{lookupLabel(t, "symbol", item.symbol)}</b>
                      <small>{item.sourceName ?? lookupLabel(t, "kind", item.kind)}</small>
                    </div>
                    <div className="recent-item-right">
                      <strong>{item.value}</strong>
                      <span className={`recent-pill ${item.tone}`}>
                        {item.tone === "up" ? <TrendingUp size={10} /> : item.tone === "down" ? <TrendingDown size={10} /> : null}
                        {item.pct}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="watch-chart-quick-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item.symbol);
                        onOpenChart?.(item.symbol);
                      }}
                      title={t("common.openChartShort")}
                    >
                      <LineChart size={12} />
                      <span>{t("common.chart")}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="recent-empty-prompt">
                <small>{t("discovery.recentEmpty")}</small>
              </div>
            )}
          </section>

          {/* KAPSAMLI PİYASA TARAMASI (FULL SCANNER) */}
          <section className="discovery-scanner-section">
            <div className="scanner-section-head">
              <div className="scanner-title-row">
                <span className="scanner-title">
                  <SlidersHorizontal size={13} />
                  <b>{t("discovery.scanTitle")}</b>
                </span>
                <small className="scanner-count">{t("discovery.assetCount", { count: scannedItems.length })}</small>
              </div>

              {/* Scan Mode Toggles */}
              <div className="scanner-mode-tabs">
                <button className={scanMode === "ALL" ? "active" : ""} onClick={() => setScanMode("ALL")}>{t("discovery.scanAll")}</button>
                <button className={scanMode === "GAINERS" ? "active" : ""} onClick={() => setScanMode("GAINERS")}>{t("discovery.scanGainers")}</button>
                <button className={scanMode === "LOSERS" ? "active" : ""} onClick={() => setScanMode("LOSERS")}>{t("discovery.scanLosers")}</button>
                <button className={scanMode === "VOLATILE" ? "active" : ""} onClick={() => setScanMode("VOLATILE")}>{t("discovery.scanVolatile")}</button>
              </div>

              {/* Live Search Input for Scanner */}
              <div className="scanner-search-wrapper">
                <Search size={12} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t("discovery.scanPlaceholder")}
                />
                {searchTerm && (
                  <button className="scanner-search-clear" onClick={() => setSearchTerm("")}>✕</button>
                )}
              </div>
            </div>

            {/* Scanned Results */}
            <div className="discovery-scanner-list">
              {scannedItems.length > 0 ? (
                scannedItems.map((item) => {
                  const pctVal = Math.abs(pctNumber(item));
                  const barWidth = Math.min(100, Math.max(12, pctVal * 16));
                  return (
                    <div
                      key={`scan-${item.providerSymbol}`}
                      className={`discovery-row-btn ${selectedSymbol === item.symbol ? "selected" : ""}`}
                      onClick={() => onSelect(item.symbol)}
                    >
                      <div className="discovery-row-main">
                        <div className="discovery-sym-wrap">
                          <b>{lookupLabel(t, "symbol", item.symbol)}</b>
                          <small className="discovery-kind-badge">{lookupLabel(t, "kind", item.kind)}</small>
                        </div>
                        <span className="discovery-name-text">{item.sourceName ?? lookupLabel(t, "category", item.category)}</span>
                      </div>
                      <div className="discovery-row-bar">
                        <div className="discovery-bar-track">
                          <i className={`discovery-bar-fill ${item.tone}`} style={{ width: `${barWidth}%` }} />
                        </div>
                      </div>
                      <div className="discovery-row-values">
                        <strong>{item.value}</strong>
                        <span className={`discovery-pill ${item.tone}`}>
                          {item.tone === "up" ? <TrendingUp size={10} /> : item.tone === "down" ? <TrendingDown size={10} /> : null}
                          {item.pct}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="watch-chart-quick-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(item.symbol);
                          onOpenChart?.(item.symbol);
                        }}
                        title={t("common.openChartShort")}
                      >
                        <LineChart size={12} />
                        <span>{t("common.chart")}</span>
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="discovery-empty">
                  <p>{t("discovery.empty")}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

type MobileModuleFilter = "ALL" | "CHART" | "WATCH" | "FINANCIALS" | "SUMMARY" | "MACRO";

export default function Home() {
  const { t, language } = useI18n();
  const { isBlockVisible, watchlistOverride } = useContent();
  const [activeView, setActiveView] = useState<TerminalView>(() => { const view = new URLSearchParams(window.location.search).get("view"); return view === "PROFILE" ? "PROFILE" : view === "RESEARCH" ? "RESEARCH" : view === "CONTACT" ? "CONTACT" : "DASHBOARD"; });
  const [mobileFilter, setMobileFilter] = useState<MobileModuleFilter>("ALL");
  const [mobileModulesOpen, setMobileModulesOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("THYAO"); const [interval, setInterval] = useState<(typeof intervals)[number]>("5G"); const [chartMode, setChartMode] = useState<"price" | FinancialStatementKind>(() => { const mode = new URLSearchParams(window.location.search).get("chart"); return mode === "income" || mode === "balance" || mode === "cashflow" ? mode : "price"; }); const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") ?? ""); const [watchCategory, setWatchCategory] = useState<WatchCategory>("TÜMÜ"); const [watchTab, setWatchTab] = useState<"WATCH" | "DISCOVER">(() => new URLSearchParams(window.location.search).get("watch") === "discover" ? "DISCOVER" : "WATCH"); const [mobileMenu, setMobileMenu] = useState(false); const [notificationOpen, setNotificationOpen] = useState(false); const [draggedPanel, setDraggedPanel] = useState<PanelId | null>(null); const [clock, setClock] = useState(() => formatClock());
  const [panelOrder, setPanelOrder] = useState<PanelId[]>(() => { try { const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.panelOrder) || "[]"); return Array.isArray(saved) && saved.length === 4 ? saved : defaultPanelOrder; } catch { return defaultPanelOrder; } });
  const [lockedPanels, setLockedPanels] = useState<PanelId[]>(() => { try { const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.lockedPanels) || "[]"); return Array.isArray(saved) ? saved.filter((id): id is PanelId => defaultPanelOrder.includes(id)) : []; } catch { return []; } });
  const [discoveredSymbol, setDiscoveredSymbol] = useState<DiscoveredSymbol | null>(null);
  const [recentSymbols, setRecentSymbols] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEYS.recentSymbols) || "[]");
      return Array.isArray(saved) && saved.length > 0
        ? saved.slice(0, 8).filter((item): item is string => typeof item === "string")
        : ["THYAO", "ASELS", "BIST 100", "S&P 500"];
    } catch {
      return ["THYAO", "ASELS", "BIST 100", "S&P 500"];
    }
  });
  const discoveredSeed = useMemo<MarketRow | null>(() => discoveredSymbol ? { symbol: discoveredSymbol.symbol, providerSymbol: discoveredSymbol.providerSymbol, category: "ABD", kind: "KEŞİF", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "—", sourceName: discoveredSymbol.name } : null, [discoveredSymbol]);
  const watchUniverse = useMemo(() => {
    // Panelden bir liste verilmişse varsayılan evren onunla sınırlanır ve
    // panelde girilen sıra korunur; tanınmayan kodlar sessizce atlanır.
    const seeds = watchlistOverride
      ? watchlistOverride
          .map((symbol) => marketSeeds.find((seed) => seed.symbol === symbol))
          .filter((seed): seed is MarketRow => Boolean(seed))
      : marketSeeds;
    const list = seeds.length ? [...seeds] : [...marketSeeds];
    if (discoveredSeed) list.push(discoveredSeed);
    for (const sym of recentSymbols) {
      if (!list.some((item) => item.symbol === sym)) {
        list.push({
          symbol: sym,
          providerSymbol: sym.includes(".") || sym.startsWith("^") || sym.includes("=") ? sym : `${sym}.IS`,
          category: sym.endsWith(".IS") ? "TÜRKİYE" : "ABD",
          kind: "HİSSE",
          value: "—",
          change: "—",
          pct: "—",
          tone: "flat",
          last: 0,
          precision: 2,
          currency: sym.endsWith(".IS") ? "TRY" : "USD",
        });
      }
    }
    return list.filter((item, index, all) => all.findIndex((candidate) => candidate.providerSymbol === item.providerSymbol) === index);
  }, [discoveredSeed, recentSymbols, watchlistOverride]);
  const quotes = trpc.market.quotes.useQuery({ symbols: watchUniverse.map((item) => item.providerSymbol) }, { refetchInterval: 60_000, staleTime: 40_000, retry: 1 }); const quoteMap = useMemo(() => new Map((quotes.data ?? []).map((item) => [item.symbol, item])), [quotes.data]); const markets = useMemo(() => watchUniverse.map((item) => mergeQuote(item, quoteMap.get(item.providerSymbol))), [watchUniverse, quoteMap]); const row = markets.find((item) => item.symbol === selectedSymbol) ?? markets.find((item) => item.symbol === "THYAO")!;
  const chart = trpc.market.chart.useQuery({ symbol: row.providerSymbol, timeframe: interval }, { refetchInterval: 60_000, staleTime: 40_000, retry: 1 }); const statementKind: FinancialStatementKind = chartMode === "price" ? "income" : chartMode; const statements = trpc.market.statements.useQuery({ symbol: row.providerSymbol, statement: statementKind }, { staleTime: 45_000, retry: 1 }); const search = trpc.market.search.useQuery({ query: query.trim().length >= 1 ? query.trim() : "a" }, { enabled: query.trim().length >= 1, staleTime: 30_000, retry: 1 });
  useEffect(() => { setClock(formatClock()); const timer = window.setInterval(() => setClock(formatClock()), 1000); return () => window.clearInterval(timer); }, [language]); useEffect(() => { window.localStorage.setItem(STORAGE_KEYS.panelOrder, JSON.stringify(panelOrder)); }, [panelOrder]); useEffect(() => { window.localStorage.setItem(STORAGE_KEYS.lockedPanels, JSON.stringify(lockedPanels)); }, [lockedPanels]); useEffect(() => { window.localStorage.removeItem(STORAGE_KEYS.legacyWatchlist); }, []); useEffect(() => { window.localStorage.setItem(STORAGE_KEYS.recentSymbols, JSON.stringify(recentSymbols)); }, [recentSymbols]);

  const tickerSymbols = ["BIST 100", "BIST 30", "THYAO", "ASELS", "TUPRS", "AKBNK", "S&P 500", "NASDAQ 100", "USD/TRY", "ALTIN", "PETROL", "VIX", "AAPL", "MSFT"];
  const tickerItems = useMemo(() => {
    return tickerSymbols.map((sym) => markets.find((m) => m.symbol === sym)).filter(Boolean) as MarketRow[];
  }, [markets]);

  const fixedMarkets = excludeTransientDiscovery(markets);
  const watchRows = fixedMarkets.filter((item) => watchCategory === "TÜMÜ" || item.category === watchCategory);
  const discoveryRows = fixedMarkets.filter((item) => watchCategory === "TÜMÜ" || item.category === watchCategory);
  const recentRows = useMemo(() => {
    return recentSymbols.map((sym) => {
      const found = markets.find((item) => item.symbol === sym);
      if (found) return found;
      return {
        symbol: sym,
        providerSymbol: sym,
        category: "TÜRKİYE" as const,
        kind: "HİSSE",
        value: "—",
        change: "—",
        pct: "—",
        tone: "flat" as const,
        last: 0,
        precision: 2,
        currency: "TRY",
      };
    });
  }, [recentSymbols, markets]);

  const clearRecentSymbols = () => {
    setRecentSymbols([]);
    window.localStorage.removeItem(STORAGE_KEYS.recentSymbols);
    toast.message(t("toast.recentCleared"));
  };

  const terminalRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLElement | null>(null);

  // Initial Hero Load Animation (Stagger intro sequence)
  useGSAP(
    () => {
      if (!terminalRef.current) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        tl.fromTo(
          ".app-chrome",
          { opacity: 0, y: -8 },
          { opacity: 1, y: 0, duration: 0.35, clearProps: "transform,opacity" }
        )
          .fromTo(
            ".tool-ribbon",
            { opacity: 0, y: -6 },
            { opacity: 1, y: 0, duration: 0.3, clearProps: "transform,opacity" },
            "-=0.15"
          )
          .fromTo(
            ".ticker-tape-container",
            { opacity: 0 },
            { opacity: 1, duration: 0.3, clearProps: "opacity" },
            "-=0.15"
          )
          .fromTo(
            [".left-dock", ".terminal-workspace", ".right-dock"],
            { opacity: 0, y: 10 },
            {
              opacity: 1,
              y: 0,
              duration: 0.4,
              stagger: 0.08,
              clearProps: "transform,opacity",
            },
            "-=0.1"
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(
          [
            ".app-chrome",
            ".tool-ribbon",
            ".ticker-tape-container",
            ".left-dock",
            ".terminal-workspace",
            ".right-dock",
          ],
          { opacity: 1, y: 0 }
        );
      });

      return () => mm.revert();
    },
    { scope: terminalRef }
  );

  // View Transition Animation
  useGSAP(
    () => {
      if (!workspaceRef.current) return;
      const mm = gsap.matchMedia();

      // Respect prefers-reduced-motion
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          workspaceRef.current,
          {
            opacity: 0,
            y: 8,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            ease: "power2.out",
            clearProps: "transform,opacity",
          }
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(workspaceRef.current, { opacity: 1, y: 0 });
      });

      return () => mm.revert();
    },
    { dependencies: [activeView], scope: workspaceRef }
  );

  // ScrollTrigger reveals for cards & long content
  useGSAP(
    () => {
      if (!workspaceRef.current) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Subtle scroll reveal for profile cards & report items
        const cards = gsap.utils.toArray<HTMLElement>(
          ".profile-section-card, .matrix-card, .research-card-modern, .valuation-card, .macro-item"
        );

        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 14 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: "power2.out",
              clearProps: "transform,opacity",
              scrollTrigger: {
                trigger: card,
                start: "top 92%",
                toggleActions: "play none none none",
                once: true,
              },
            }
          );
        });
      });

      return () => mm.revert();
    },
    { dependencies: [activeView], scope: workspaceRef }
  );

  const changeView = (view: TerminalView) => {
    setActiveView(view);
    setMobileMenu(false);
    setMobileModulesOpen(false);
    if (view !== "DASHBOARD") {
      setMobileFilter("ALL");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    refreshScrollTriggers();
  };
  const chooseSymbol = (symbol: string) => { setSelectedSymbol(symbol); setRecentSymbols((items) => rememberRecentSymbol(items, symbol)); toast.message(t("toast.chartOpened", { symbol }), { description: t("toast.chartOpenedDesc") }); }; const togglePanelLock = (id: PanelId) => setLockedPanels((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]); const reorder = (target: PanelId) => { if (!draggedPanel || draggedPanel === target) return; setPanelOrder((order) => placeUnlockedPanelBefore(order, draggedPanel, target, lockedPanels)); setDraggedPanel(null); toast.message(t("toast.layoutUpdated")); }; const openSearchResult = (item: { symbol: string; name: string }) => { const symbol = normalizeDiscoverySymbol(item.symbol); setDiscoveredSymbol({ symbol, providerSymbol: item.symbol, name: item.name }); chooseSymbol(symbol); setWatchTab("DISCOVER"); setQuery(""); toast.message(t("toast.discoveryOpened", { symbol: item.symbol }), { description: t("toast.discoveryOpenedDesc") }); }; const resetLayout = () => { setPanelOrder(defaultPanelOrder); setLockedPanels([]); setDraggedPanel(null); toast.message(t("toast.layoutReset")); };

  const handleSelectMobileModule = (modId: MobileModuleId) => {
    if (modId === "PROFILE") {
      changeView("PROFILE");
    } else if (modId === "RESEARCH") {
      changeView("RESEARCH");
    } else if (modId === "CONTACT") {
      changeView("CONTACT");
    } else if (modId === "CHART") {
      changeView("DASHBOARD");
      setMobileFilter("CHART");
    } else if (modId === "WATCH") {
      changeView("DASHBOARD");
      setMobileFilter("WATCH");
    } else if (modId === "FINANCIALS") {
      changeView("DASHBOARD");
      setMobileFilter("FINANCIALS");
    } else if (modId === "SUMMARY") {
      changeView("DASHBOARD");
      setMobileFilter("SUMMARY");
    } else if (modId === "MACRO" || modId === "HOURS") {
      changeView("DASHBOARD");
      setMobileFilter("MACRO");
    }
    setMobileModulesOpen(false);
  };
  const panels: Record<PanelId, React.ReactNode> = {
    profile: <TerminalPanel key="profile" id="profile" title={t("panels.profile")} code="ANALYST" className="profile-panel" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} locked={lockedPanels.includes("profile")} onToggleLock={() => togglePanelLock("profile")}><ProfilePanel onOpenFullProfile={() => changeView("PROFILE")} /></TerminalPanel>,
    chart: (
      <TerminalPanel
        key="chart"
        id="chart"
        title={t("panels.chart")}
        code="CHART"
        className="chart-panel"
        dragged={draggedPanel}
        onDragStart={setDraggedPanel}
        onDrop={reorder}
        locked={lockedPanels.includes("chart")}
        onToggleLock={() => togglePanelLock("chart")}
      >
        <div className="chart-toolbar chart-toolbar-stacked">
          <div className="chart-symbol-select-wrap">
            <span className="symbol-select-kind">{lookupLabel(t, "kind", row.kind)}</span>
            <select
              value={selectedSymbol}
              onChange={(event) => chooseSymbol(event.target.value)}
              aria-label={t("chart.symbolAria")}
            >
              {markets.map((item) => (
                <option key={item.providerSymbol} value={item.symbol}>
                  {lookupLabel(t, "symbol", item.symbol)} · {lookupLabel(t, "kind", item.kind)} ({item.currency})
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="select-arrow" />
          </div>

          <div className="interval-switcher">
            {intervals.map((item) => (
              <button
                key={item}
                className={interval === item && chartMode === "price" ? "active" : ""}
                onClick={() => {
                  setChartMode("price");
                  setInterval(item);
                }}
              >
                {t(`chart.interval.${item}` as TranslationKey)}
              </button>
            ))}
          </div>

          <div className="analysis-tabs" role="tablist" aria-label={t("chart.viewAria")}>
            <button
              className={`tab-btn-price ${chartMode === "price" ? "active" : ""}`}
              onClick={() => setChartMode("price")}
            >
              <SlidersHorizontal size={11} />
              <span>{t("chart.tabPrice")}</span>
            </button>
            <button
              className={`tab-btn-income ${chartMode === "income" ? "active" : ""}`}
              onClick={() => setChartMode("income")}
            >
              <TrendingUp size={11} />
              <span>{t("chart.tabIncome")}</span>
            </button>
            <button
              className={`tab-btn-balance ${chartMode === "balance" ? "active" : ""}`}
              onClick={() => setChartMode("balance")}
            >
              <Scale size={11} />
              <span>{t("chart.tabBalance")}</span>
            </button>
            <button
              className={`tab-btn-cashflow ${chartMode === "cashflow" ? "active" : ""}`}
              onClick={() => setChartMode("cashflow")}
            >
              <Coins size={11} />
              <span>{t("chart.tabCashflow")}</span>
            </button>
          </div>

          <span className="chart-toolbar-note">
            <BarChart3 size={12} />
            <span>{chartMode === "price" ? t("chart.notePrice") : t("chart.noteStatement")}</span>
          </span>
        </div>

        {chartMode === "price" ? (
          <InteractiveChart
            row={row}
            points={chart.data?.points ?? []}
            interval={interval}
            isLoading={chart.isFetching}
            onRetry={() => chart.refetch()}
          />
        ) : (
          <StatementExplorer
            row={row}
            statement={statementKind}
            data={statements.data as FinancialStatementsData | undefined}
            isLoading={statements.isFetching}
            isError={statements.isError}
            onRetry={() => statements.refetch()}
            onSelectStatement={setChartMode}
          />
        )}
      </TerminalPanel>
    ),
    summary: <TerminalPanel key="summary" id="summary" title={t("panels.summary")} code="MARKET_PULSE" className="summary-panel" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} locked={lockedPanels.includes("summary")} onToggleLock={() => togglePanelLock("summary")}><SummaryPanel markets={markets} isRefreshing={quotes.isFetching} selectedSymbol={selectedSymbol} onSelect={chooseSymbol}/></TerminalPanel>,
    archive: <TerminalPanel key="archive" id="archive" title={t("panels.archive")} code="RESEARCH_DESK" className="archive-panel" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} locked={lockedPanels.includes("archive")} onToggleLock={() => togglePanelLock("archive")}><div className="education-bar"><div><span>{t("archive.educationLabel")}</span><b>{t("archive.university")}</b><small>{t("archive.program")}</small></div><div><span>{t("archive.skillsLabel")}</span><b>{t("archive.skillsValue")}</b><small>{t("archive.skillsNote")}</small></div><a href="https://measure-moat.vercel.app/#roadmap" target="_blank" rel="noreferrer"><BookOpen size={15}/> Measure Moat<ExternalLink size={12}/></a></div><div className="archive-compact"><div className="archive-copy"><span>{t("archive.title")}</span><b>{t("archive.headline")}</b><small>{t("archive.note")}</small></div><button onClick={() => changeView("RESEARCH")}><BookOpen size={15}/> {t("archive.cta")} <ArrowUpRight size={13}/></button></div></TerminalPanel>,
  };
  const content = activeView === "PROFILE" ? (
    <TerminalPanel id="profile" title={t("panels.profileFull")} code="ANALYST_PROFILE" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="module-panel">
      <ProfileView onBack={() => changeView("DASHBOARD")} onContact={() => changeView("CONTACT")} />
    </TerminalPanel>
  ) : activeView === "RESEARCH" ? (
    <ResearchLibrary
      onBack={() => changeView("DASHBOARD")}
      onContact={() => changeView("CONTACT")}
      onOpenSymbolChart={(sym) => {
        chooseSymbol(sym);
        changeView("DASHBOARD");
        setMobileFilter("CHART");
      }}
    />
  ) : activeView === "CONTACT" ? (
    <ContactDesk onBack={() => changeView("DASHBOARD")} />
  ) : (
    <div className="workspace-grid">{panelOrder.map((id) => panels[id])}</div>
  );
  const activeLabel = activeView === "PROFILE" ? t("path.profile") : activeView === "RESEARCH" ? t("path.research") : activeView === "CONTACT" ? t("path.contact") : t("path.dashboard");
  const notifications = [
    {
      label: quotes.isFetching ? t("notif.marketUpdating") : t("notif.marketConnected"),
      detail: quotes.isFetching ? t("notif.marketUpdatingDetail") : t("notif.marketConnectedDetail"),
    },
    {
      label: chart.isFetching ? t("notif.chartLoading") : t("notif.chartReady", { symbol: row.symbol }),
      detail: chart.isFetching
        ? t("notif.chartLoadingDetail")
        : t("notif.chartReadyDetail", { interval: t(`chart.interval.${interval}` as TranslationKey) }),
    },
    {
      label: t("notif.panelsLocked", { count: lockedPanels.length }),
      detail: lockedPanels.length ? t("notif.panelsLockedDetail") : t("notif.panelsUnlockedDetail"),
    },
  ];
  return <div ref={terminalRef} className={`terminal-app view-${activeView.toLowerCase()}`}>
    <header className="app-chrome">
      <div className="app-identity">
        <span className="signal-grid"><i/><i/><i/><b/></span>
        <div className="app-title-group">
          <b>ONUR İNAL // PORTFOLIO</b>
          <span className="app-version-badge">v1.0</span>
        </div>
      </div>
      <div className="chrome-center">
        <Activity size={13}/> <span>{t("chrome.marketData")}</span> <em>{quotes.isFetching ? t("chrome.updating") : "YAHOO FINANCE"}</em>
        <span>{t("chrome.clock", { clock })}</span>
      </div>
      <div className="chrome-actions">
        <LanguageSwitcher />
        <button onClick={() => quotes.refetch()} title={t("chrome.refresh")}><Activity size={15}/></button>
        <button className="notification-trigger" onClick={() => setNotificationOpen((state) => !state)} title={t("chrome.notifications")} aria-expanded={notificationOpen}><Bell size={15}/><i/></button>
        <span className="connection-state"><i/> <span>{t("chrome.connected")}</span></span>
        {notificationOpen && <div className="notification-center">
          <div><b>{t("chrome.notificationCenter")}</b><button onClick={() => setNotificationOpen(false)}>{t("common.close")}</button></div>
          {notifications.map((item) => <article key={item.label}><i/><span><b>{item.label}</b><small>{item.detail}</small></span></article>)}
        </div>}
      </div>
    </header>
    <nav className="tool-ribbon">
      <button className="terminal-menu-toggle" onClick={() => setMobileModulesOpen(true)}><Layers size={16}/> {t("nav.modules")}</button>
      <div className={mobileMenu ? "tool-menu open" : "tool-menu"}>
        {(["DASHBOARD", "PROFILE", "RESEARCH", "CONTACT"] as TerminalView[]).filter((view) => view !== "RESEARCH" || isBlockVisible("nav.research")).map((view) => <button key={view} className={activeView === view ? "tool-button active" : "tool-button"} onClick={() => changeView(view)}>{view === "DASHBOARD" ? <Grid2X2 size={16}/> : view === "PROFILE" ? <UserRound size={16}/> : view === "RESEARCH" ? <BookOpen size={16}/> : <Mail size={16}/>} {view === "DASHBOARD" ? t("nav.dashboard") : view === "PROFILE" ? t("nav.profile") : view === "RESEARCH" ? t("nav.research") : t("nav.contact")}</button>)}
      </div>
      <GlobalMarketSearch query={query} onQuery={setQuery} results={search.data ?? []} isLoading={search.isFetching} isError={search.isError} onSelect={openSearchResult}/>
    </nav>
    <div className="ticker-tape-container" aria-label={t("ticker.aria")}>
      <div className="ticker-tape-label">
        <span className="ticker-tape-dot" />
        <span>{t("ticker.live")}</span>
      </div>
      <div className="ticker-tape-track-wrapper">
        <div className="ticker-tape-track">
          {[...tickerItems, ...tickerItems, ...tickerItems, ...tickerItems].map((item, idx) => (
            <button
              key={`${item.symbol}-${idx}`}
              className={`ticker-tape-chip ${selectedSymbol === item.symbol ? "selected" : ""}`}
              onClick={() => chooseSymbol(item.symbol)}
              title={t("common.openChart", { symbol: item.symbol })}
            >
              <span className="ticker-sym">{lookupLabel(t, "symbol", item.symbol)}</span>
              <span className="ticker-val">{item.value}</span>
              <span className={`ticker-pill ${item.tone}`}>{item.pct}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
    {activeView === "DASHBOARD" && (
      <div className="mobile-category-bar" aria-label={t("mobileFilter.aria")}>
        <button
          className={mobileFilter === "ALL" ? "active" : ""}
          onClick={() => setMobileFilter("ALL")}
        >
          {t("mobileFilter.all")}
        </button>
        <button
          className={mobileFilter === "CHART" ? "active" : ""}
          onClick={() => setMobileFilter("CHART")}
        >
          <LineChart size={13} /> {t("mobileFilter.chart")}
        </button>
        <button
          className={mobileFilter === "WATCH" ? "active" : ""}
          onClick={() => setMobileFilter("WATCH")}
        >
          <TrendingUp size={13} /> {t("mobileFilter.watch")}
        </button>
        <button
          className={mobileFilter === "FINANCIALS" ? "active" : ""}
          onClick={() => setMobileFilter("FINANCIALS")}
        >
          <PieChart size={13} /> {t("mobileFilter.financials")}
        </button>
        <button
          className={mobileFilter === "SUMMARY" ? "active" : ""}
          onClick={() => setMobileFilter("SUMMARY")}
        >
          <Grid2X2 size={13} /> {t("mobileFilter.summary")}
        </button>
        <button
          className={mobileFilter === "MACRO" ? "active" : ""}
          onClick={() => setMobileFilter("MACRO")}
        >
          <Globe size={13} /> {t("mobileFilter.macro")}
        </button>
      </div>
    )}
    <div className={`terminal-layout ${activeView !== "DASHBOARD" ? "terminal-layout-fullscreen" : `mobile-filter-${mobileFilter.toLowerCase()}`}`}>
      {activeView === "DASHBOARD" && (
        <aside className="left-dock">
          <TerminalPanel id="watch-dock" title={watchTab === "WATCH" ? t("panels.watchlist") : t("panels.discovery")} code={watchTab === "WATCH" ? "WATCHLIST" : "DISCOVERY"} dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="watchlist-panel">
            <WatchlistPanel
              tab={watchTab}
              onTab={setWatchTab}
              category={watchCategory}
              onCategory={setWatchCategory}
              watchRows={watchRows}
              discoveryRows={discoveryRows}
              recentRows={recentRows}
              selectedSymbol={selectedSymbol}
              onSelect={chooseSymbol}
              onClearRecent={clearRecentSymbols}
              onOpenChart={(sym) => {
                chooseSymbol(sym);
                setMobileFilter("CHART");
              }}
            />
          </TerminalPanel>

          {mobileFilter === "MACRO" && (
            <div className="macro-mobile-header-bar">
              <div className="macro-mobile-title-wrap">
                <span className="macro-mobile-pill">{t("macro.mobilePill")}</span>
                <b>{t("macro.mobileTitle")}</b>
              </div>
              <button
                className="macro-back-to-chart-btn"
                onClick={() => setMobileFilter("CHART")}
              >
                <Grid2X2 size={13} /> {t("macro.backToChart")}
              </button>
            </div>
          )}

          {isBlockVisible("dashboard.macroPanel") && (
            <TerminalPanel id="macro-dock" title={t("panels.macro")} code="MACRO_DESK" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="macro-panel">
              <MacroEconomyPanel />
            </TerminalPanel>
          )}

          {isBlockVisible("dashboard.hoursPanel") && (
            <TerminalPanel id="hours-dock" title={t("panels.hours")} code="MARKET_HOURS" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="hours-panel">
              <MarketHoursPanel />
            </TerminalPanel>
          )}
        </aside>
      )}
      <main ref={workspaceRef} className="terminal-workspace">
        {activeView === "DASHBOARD" && (
          <div className="workspace-path">
            <span className="workspace-path-root">ONUR İNAL // PORTFOLIO</span>
            <ChevronDown size={13} className="path-arrow"/>
            <b>{activeLabel}</b>
            <div/>
            <span className="layout-lock-state">{lockedPanels.length ? t("workspace.locked", { count: lockedPanels.length }) : t("workspace.layoutOpen")}</span>
            <button className="layout-reset" onClick={resetLayout}>{t("workspace.resetLayout")}</button>
          </div>
        )}
        {content}
      </main>
      {activeView === "DASHBOARD" && (
        <aside className="right-dock">
          <div className="quick-links">
            <span>{t("quick.title")}</span>
            <button onClick={() => changeView("PROFILE")}><UserRound size={15}/> {t("quick.profile")} <ArrowUpRight size={13}/></button>
            {isBlockVisible("nav.research") && <button onClick={() => changeView("RESEARCH")}><BookOpen size={15}/> {t("quick.research")} <ArrowUpRight size={13}/></button>}
            <button onClick={() => changeView("CONTACT")}><Mail size={15}/> {t("quick.contact")} <ArrowUpRight size={13}/></button>
          </div>
          <FinancialAnalysisPanel row={row} points={chart.data?.points ?? []} statement={statementKind} onOpenResearch={() => changeView("RESEARCH")}/>
          {isBlockVisible("dashboard.valuationPanel") && (
            <TerminalPanel id="valuation-dock" title={t("panels.valuation")} code="VALUATION_DESK" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="valuation-panel">
              <ValuationDeskPanel onOpenResearch={() => changeView("RESEARCH")} />
            </TerminalPanel>
          )}
        </aside>
      )}
    </div>

    <TerminalFooter onNavigate={changeView} />

    {/* Mobile Bottom App Navigation (Play Store / App Store style) */}
    <nav className="mobile-bottom-nav" aria-label={t("bottomNav.aria")}>
      <button
        className={`bottom-nav-tab ${activeView === "DASHBOARD" && mobileFilter === "ALL" ? "active" : ""}`}
        onClick={() => {
          changeView("DASHBOARD");
          setMobileFilter("ALL");
        }}
      >
        <Grid2X2 size={19} />
        <span>{t("bottomNav.dashboard")}</span>
      </button>

      <button
        className={`bottom-nav-tab ${activeView === "DASHBOARD" && mobileFilter === "WATCH" ? "active" : ""}`}
        onClick={() => {
          changeView("DASHBOARD");
          setMobileFilter("WATCH");
        }}
      >
        <TrendingUp size={19} />
        <span>{t("bottomNav.market")}</span>
      </button>

      <button
        className={`bottom-nav-tab ${activeView === "DASHBOARD" && mobileFilter === "CHART" ? "active" : ""}`}
        onClick={() => {
          changeView("DASHBOARD");
          setMobileFilter("CHART");
        }}
      >
        <LineChart size={19} />
        <span>{t("bottomNav.chart")}</span>
      </button>

      <button
        className={`bottom-nav-tab ${mobileModulesOpen ? "active" : ""}`}
        onClick={() => setMobileModulesOpen(true)}
      >
        <div className="bottom-nav-icon-badge">
          <Layers size={19} />
          <span className="bottom-badge-dot" />
        </div>
        <span>{t("bottomNav.modules")}</span>
      </button>

      <button
        className={`bottom-nav-tab ${activeView === "PROFILE" ? "active" : ""}`}
        onClick={() => changeView("PROFILE")}
      >
        <UserRound size={19} />
        <span>{t("bottomNav.profile")}</span>
      </button>
    </nav>

    <MobileModulesSheet
      isOpen={mobileModulesOpen}
      onClose={() => setMobileModulesOpen(false)}
      onSelectModule={handleSelectMobileModule}
      activeView={activeView}
      activeFilter={mobileFilter}
    />
  </div>;
}
