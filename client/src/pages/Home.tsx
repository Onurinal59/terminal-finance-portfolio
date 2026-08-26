/**
 * Piyasa Odası: gerçek Yahoo Finance verisini, Onur İnal'ın profilini ve araştırma
 * modüllerini çok panelli bir finans terminali içinde birleştirir.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, ArrowUpRight, BarChart3, Bell, BookOpen, CalendarDays, ChevronDown,
  Download, ExternalLink, FileText, Filter, Grid2X2, Info, Linkedin, Lock,
  Mail, Menu, MessageSquare, Minus, MoreHorizontal, Search, Send, TrendingDown,
  TrendingUp, UserRound, X,
} from "lucide-react";
import { toast } from "sonner";
import { buildContactMailto } from "@/lib/contactMailto";
import { getAutoScrollDelta, movePanelOrder, placePanelBefore } from "@/lib/panelOrder";
import { trpc } from "@/lib/trpc";

type TerminalView = "DASHBOARD" | "PROFILE" | "RESEARCH" | "CONTACT";
type WatchCategory = "TÜMÜ" | "TÜRKİYE" | "ABD" | "MAKRO";
type ReportCategory = "TÜMÜ" | "EQUITY" | "MACRO" | "SECTOR";
type PanelId = "profile" | "chart" | "summary" | "archive";
type ChartPoint = { time: number; close: number | null; high: number | null; low: number | null; open: number | null; volume: number | null };
type LiveQuote = { symbol: string; shortName: string; exchange: string; currency: string; price: number; previousClose: number | null; change: number | null; changePercent: number | null; marketState: string; marketTime: number | null };
type MarketRow = { symbol: string; providerSymbol: string; category: Exclude<WatchCategory, "TÜMÜ">; kind: string; value: string; change: string; pct: string; tone: "up" | "down" | "flat"; last: number; precision: number; currency: string; sourceName?: string; marketState?: string };
type ResearchReport = { id: string; title: string; category: Exclude<ReportCategory, "TÜMÜ">; period: string; status: "PDF HAZIR"; focus: string; methodology: string; accent: "green" | "blue" | "red"; href: string; source: string };

const profilePhoto = "/manus-storage/onur-inal-profile_b125dc2a.png";
const linkedInUrl = "https://www.linkedin.com/in/onur%C4%B1nal/";
const email = "onurinal815@gmail.com";
const intervals = ["1G", "5G", "1A", "3A", "1Y"] as const;
const defaultPanelOrder: PanelId[] = ["profile", "chart", "summary", "archive"];

const cvChoices = [
  { id: "TR_PHOTO", label: "TÜRKÇE", detail: "FOTOĞRAFLI CV", href: "/manus-storage/Onur_Inal_CV_Fotografli_61ab782c.pdf" },
  { id: "EN_PHOTO", label: "ENGLISH", detail: "PHOTO CV", href: "/manus-storage/Onur_Inal_CV_EN_Fotografli_90e0f88f.pdf" },
] as const;

const reports: ResearchReport[] = [
  { id: "R-01", title: "Microsoft Equity Research · Örnek", category: "EQUITY", period: "Morningstar / 2011", status: "PDF HAZIR", focus: "Microsoft için öz sermaye araştırması, değerleme çerçevesi, DCF modeli ve ilgili rapor örnekleri.", methodology: "Morningstar örnek kaynak · Hisse araştırması · DCF model", accent: "blue", href: "/manus-storage/2064_sample_b7a5f21a.pdf", source: "Morningstar örnek araştırma raporu" },
];

const marketSeeds: MarketRow[] = [
  { symbol: "BIST 100", providerSymbol: "XU100.IS", category: "TÜRKİYE", kind: "ENDEKS", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "TRY" },
  { symbol: "BIST 30", providerSymbol: "XU030.IS", category: "TÜRKİYE", kind: "ENDEKS", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "TRY" },
  { symbol: "THYAO", providerSymbol: "THYAO.IS", category: "TÜRKİYE", kind: "HİSSE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "TRY" },
  { symbol: "ASELS", providerSymbol: "ASELS.IS", category: "TÜRKİYE", kind: "HİSSE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "TRY" },
  { symbol: "TUPRS", providerSymbol: "TUPRS.IS", category: "TÜRKİYE", kind: "HİSSE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "TRY" },
  { symbol: "AKBNK", providerSymbol: "AKBNK.IS", category: "TÜRKİYE", kind: "HİSSE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "TRY" },
  { symbol: "S&P 500", providerSymbol: "^GSPC", category: "ABD", kind: "ENDEKS", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "NASDAQ 100", providerSymbol: "^NDX", category: "ABD", kind: "ENDEKS", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "VIX", providerSymbol: "^VIX", category: "ABD", kind: "VOLATİLİTE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "AAPL", providerSymbol: "AAPL", category: "ABD", kind: "HİSSE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "MSFT", providerSymbol: "MSFT", category: "ABD", kind: "HİSSE", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "BRK.B", providerSymbol: "BRK-B", category: "ABD", kind: "DEĞER", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "USD/TRY", providerSymbol: "TRY=X", category: "MAKRO", kind: "KUR", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 4, currency: "TRY" },
  { symbol: "EUR/TRY", providerSymbol: "EURTRY=X", category: "MAKRO", kind: "KUR", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 4, currency: "TRY" },
  { symbol: "ALTIN", providerSymbol: "GC=F", category: "MAKRO", kind: "EMTİA", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "PETROL", providerSymbol: "CL=F", category: "MAKRO", kind: "EMTİA", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 2, currency: "USD" },
  { symbol: "ABD 10Y", providerSymbol: "^TNX", category: "MAKRO", kind: "TAHVİL", value: "—", change: "—", pct: "—", tone: "flat", last: 0, precision: 3, currency: "%" },
];

function formatPrice(value: number, precision: number) { return value.toLocaleString("tr-TR", { minimumFractionDigits: precision, maximumFractionDigits: precision }); }
function pctNumber(row: MarketRow) { return Number.parseFloat(row.pct.replace("%", "").replace(",", ".")); }
function mergeQuote(seed: MarketRow, quote?: LiveQuote): MarketRow {
  if (!quote) return seed;
  const tone: MarketRow["tone"] = quote.change === null ? "flat" : quote.change >= 0 ? "up" : "down";
  const signed = (value: number | null) => value === null ? "—" : `${value >= 0 ? "+" : ""}${formatPrice(value, seed.precision)}`;
  return { ...seed, value: formatPrice(quote.price, seed.precision), change: signed(quote.change), pct: quote.changePercent === null ? "—" : `${quote.changePercent >= 0 ? "+" : ""}${formatPrice(quote.changePercent, 2)}%`, tone, last: quote.price, currency: quote.currency || seed.currency, sourceName: quote.shortName, marketState: quote.marketState };
}

function TerminalPanel({ id, title, code, children, className = "", dragged, onDragStart, onDrop, onMove = () => {}, movable = true }: { id: PanelId; title: string; code: string; children: React.ReactNode; className?: string; dragged: PanelId | null; onDragStart: (id: PanelId | null) => void; onDrop: (id: PanelId) => void; onMove?: (id: PanelId, direction: -1 | 1) => void; movable?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const target = movable && dragged !== null && dragged !== id;
  const autoScroll = (event: { preventDefault: () => void; clientY: number }) => { event.preventDefault(); const delta = getAutoScrollDelta(event.clientY, window.innerHeight); if (delta) window.scrollBy(0, delta); };
  return <section className={`terminal-panel workspace-panel ${className} ${movable ? "panel-movable" : "panel-locked"} ${dragged === id ? "panel-dragging" : ""} ${target ? "panel-drop-target" : ""}`} draggable={movable} onDragStart={movable ? (event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-analiz-panel", id); onDragStart(id); } : undefined} onDragOver={movable ? autoScroll : undefined} onDrop={movable ? (event) => { event.preventDefault(); onDrop(id); } : undefined} onDragEnd={movable ? () => onDragStart(null) : undefined}>
    {target && <div className="panel-drop-indicator">BURAYA BIRAK</div>}
    <div className="panel-titlebar"><div className="panel-title">{movable ? <span className="drag-grip" title="Paneli tutup taşı">⠿</span> : <span title="Sabit panel"><Lock size={11} className="panel-lock"/></span>}<span className="panel-led" />{title}<em>{code}</em></div><div className="panel-actions">{movable && <div className="touch-reorder"><button onClick={() => onMove(id, -1)} title="Paneli yukarı taşı" aria-label={`${title} panelini yukarı taşı`}>↑</button><button onClick={() => onMove(id, 1)} title="Paneli aşağı taşı" aria-label={`${title} panelini aşağı taşı`}>↓</button></div>}<button onClick={() => setCollapsed((state) => !state)} title="Paneli aç/kapat" aria-label={`${title} panelini aç/kapat`}><Minus size={12}/></button><button onClick={() => setMenuOpen((state) => !state)} title="Panel seçenekleri" aria-label={`${title} panel seçenekleri`}><MoreHorizontal size={14}/></button>{menuOpen && <div className="panel-options"><button onClick={() => { setMenuOpen(false); toast.message(`${title} açık durumda.`); }}>DURUMU GÖSTER</button><button onClick={() => { setCollapsed(false); setMenuOpen(false); }}>AÇ</button></div>}</div></div>
    {!collapsed && <div className="panel-body">{children}</div>}
  </section>;
}

function InteractiveChart({ row, points, interval, isLoading, onRetry }: { row: MarketRow; points: ChartPoint[]; interval: string; isLoading: boolean; onRetry: () => void }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const valid = points.filter((point) => point.open !== null && point.high !== null && point.low !== null && point.close !== null);
  const values = valid.flatMap((point) => [point.high!, point.low!]);
  const floor = values.length ? Math.min(...values) : 0;
  const ceiling = values.length ? Math.max(...values) : 1;
  const spread = Math.max(ceiling - floor, Math.max(Math.abs(row.last) * .002, .0001));
  const x = (index: number) => valid.length < 2 ? 250 : 8 + (index / (valid.length - 1)) * 484;
  const y = (value: number) => 154 - ((value - floor) / spread) * 132;
  const activeIndex = hoverIndex ?? Math.max(valid.length - 1, 0);
  const active = valid[activeIndex];
  const path = valid.map((point, index) => `${index ? "L" : "M"}${x(index)} ${y(point.close!)}`).join(" ");
  const label = (time: number) => new Date(time).toLocaleString("tr-TR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  const move = (event: React.MouseEvent<SVGSVGElement>) => { if (!valid.length || !canvasRef.current) return; const rect = canvasRef.current.getBoundingClientRect(); const relative = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)); setHoverIndex(Math.round(relative * (valid.length - 1))); };
  return <div className="chart-content"><div className="chart-metadata"><div><span>{row.symbol}</span><b>{row.value}</b><strong className={row.tone}>{row.change} <small>({row.pct})</small></strong></div><div className="chart-stats"><span>YÜKSEK <b>{formatPrice(ceiling, row.precision)}</b></span><span>DÜŞÜK <b>{formatPrice(floor, row.precision)}</b></span><span>HACİM <b>{active?.volume ? new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(active.volume) : "—"}</b></span></div></div><div className="chart-canvas"><span className="chart-mode-label">GERÇEK OHLC · İMLEÇLE İNCELE</span>{isLoading && <div className="chart-loading">CANLI OHLC VERİSİ YÜKLENİYOR…</div>}{!isLoading && !valid.length && <div className="chart-loading chart-error"><span>GRAFİK VERİSİ ALINAMADI</span><button onClick={onRetry}>TEKRAR DENE</button></div>}<svg ref={canvasRef} viewBox="0 0 500 170" preserveAspectRatio="none" onMouseMove={move} onMouseLeave={() => setHoverIndex(null)} aria-label={`${row.symbol} interaktif gerçek fiyat grafiği`}><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#78F27B" stopOpacity=".18"/><stop offset="100%" stopColor="#78F27B" stopOpacity="0"/></linearGradient></defs>{[34, 67, 100, 133].map((lineY) => <line key={lineY} x1="0" x2="500" y1={lineY} y2={lineY} stroke="rgba(153,183,172,.16)" strokeDasharray="2 3"/>)}{valid.length > 1 && <><path d={`${path} L500 170 L0 170 Z`} fill="url(#chart-fill)"/><path d={path} fill="none" stroke="#78F27B" strokeWidth="1.7"/>{valid.map((point, index) => { const up = point.close! >= point.open!; return <g key={point.time}><line x1={x(index)} x2={x(index)} y1={y(point.high!)} y2={y(point.low!)} stroke={up ? "#75e779" : "#e97d74"}/><rect x={x(index) - Math.max(2, 110 / Math.max(valid.length, 16))} y={Math.min(y(point.open!), y(point.close!))} width={Math.max(3, 210 / Math.max(valid.length, 18))} height={Math.max(2, Math.abs(y(point.open!) - y(point.close!)))} fill={up ? "#75e779" : "#e97d74"}/></g>; })}</>}{active && <><line x1={x(activeIndex)} x2={x(activeIndex)} y1="0" y2="170" stroke="#8FC9ED" strokeDasharray="3 3"/><circle cx={x(activeIndex)} cy={y(active.close!)} r="3.2" fill="#0c1920" stroke="#8FC9ED" strokeWidth="1.5"/></>}</svg>{active && <div className="ohlc-tooltip" style={{ left: `${Math.min(72, Math.max(2, (x(activeIndex) / 500) * 100))}%` }}><span>{label(active.time)}</span><div><b>A</b>{formatPrice(active.open!, row.precision)} <b>Y</b>{formatPrice(active.high!, row.precision)}</div><div><b>D</b>{formatPrice(active.low!, row.precision)} <b>K</b>{formatPrice(active.close!, row.precision)}</div><small>HACİM {active.volume ? new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(active.volume) : "—"}</small></div>}<div className="chart-x-axis"><span>{valid[0] ? label(valid[0].time) : "—"}</span><span>{active ? label(active.time) : "—"}</span><span>{valid.at(-1) ? label(valid.at(-1)!.time) : "—"}</span></div></div><div className="chart-footer"><span>YAHOO FINANCE / {interval} / {row.marketState ?? "GECİKMELİ"}</span><span><Activity size={12}/> {row.currency} · {row.sourceName ?? row.providerSymbol}</span></div></div>;
}

function ProfilePanel({ selectedCv, onSelect }: { selectedCv: string; onSelect: (id: string) => void }) {
  const cv = cvChoices.find((item) => item.id === selectedCv) ?? cvChoices[0];
  return <div className="profile-terminal"><div className="profile-identity"><img src={profilePhoto} alt="Onur İnal"/><div><span>ANALİST PROFİLİ</span><h1>ONUR İNAL</h1><p>Finans · Değerleme · Piyasa Araştırması</p><a href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={13}/> LINKEDIN PROFİLİ <ExternalLink size={12}/></a></div><div className="profile-mark"><b>3,20</b><small>GPA / 4,00</small></div></div><div className="profile-highlights"><span>ÇİFT ANA DAL<br/><b>ULUSLARARASI TİCARET & FİNANSMAN · İKTİSAT</b></span><span>AKADEMİK DÖNEM<br/><b>2023 — 2027</b></span><span>YETKİNLİK<br/><b>FİNANSAL ANALİZ · PYTHON · EXCEL</b></span></div><div className="cv-selector"><div><span>CV İNDİR</span><p>Dil tercihini seç.</p></div><div className="cv-options">{cvChoices.map((item) => <button key={item.id} className={selectedCv === item.id ? "active" : ""} onClick={() => onSelect(item.id)}><b>{item.label}</b><small>{item.detail}</small></button>)}</div><a className="cv-download" href={cv.href} download><Download size={15}/> {cv.label} CV İNDİR</a></div></div>;
}

function SummaryPanel({ markets, isRefreshing }: { markets: MarketRow[]; isRefreshing: boolean }) {
  const bySymbol = (symbol: string) => markets.find((item) => item.symbol === symbol);
  const items = ["BIST 100", "S&P 500", "USD/TRY", "VIX", "ALTIN", "ABD 10Y"].map(bySymbol).filter(Boolean) as MarketRow[];
  const movers = markets.filter((item) => item.kind === "HİSSE" && item.last > 0 && Number.isFinite(pctNumber(item))).sort((a, b) => pctNumber(b) - pctNumber(a));
  const advance = movers.filter((item) => item.tone === "up").length;
  const decline = movers.filter((item) => item.tone === "down").length;
  const mood = advance >= decline ? "ALICI AĞIRLIKLI" : "SATICI AĞIRLIKLI";
  const pulse = movers.length ? Math.round((advance / movers.length) * 100) : 50;
  return <div className="summary-terminal summary-revamp"><div className="summary-hero"><div><span>OTURUM PUSULASI</span><b className={advance >= decline ? "up" : "down"}>{mood}</b><small>{advance} pozitif · {decline} negatif seçili hisse</small></div><div className="summary-gauge"><span>RİSK İŞTAHI</span><div><i style={{ width: `${pulse}%` }}/></div><b>{pulse}/100</b></div></div><div className="summary-grid">{items.map((item) => <div className="summary-card" key={item.symbol}><span>{item.symbol}</span><b>{item.value}</b><em className={item.tone}>{item.pct}</em><small>{item.kind} · {item.currency}</small></div>)}</div><div className="summary-bottom"><div><span>GÜNÜN GÜÇLÜSÜ</span><b className={movers[0]?.tone ?? "flat"}><TrendingUp size={12}/>{movers[0]?.symbol ?? "—"}<small>{movers[0]?.pct ?? "—"}</small></b></div><div><span>EN ZAYIF</span><b className={movers.at(-1)?.tone ?? "flat"}><TrendingDown size={12}/>{movers.at(-1)?.symbol ?? "—"}<small>{movers.at(-1)?.pct ?? "—"}</small></b></div><div><span>VERİ AKIŞI</span><b className="summary-flow"><Activity size={12}/>{isRefreshing ? "GÜNCELLENİYOR" : "60 SN / BAĞLI"}</b></div></div></div>;
}

function ArchivePanel({ onOpenResearch }: { onOpenResearch: () => void }) { return <div className="archive-compact"><div className="archive-copy"><span>ARAŞTIRMA ARŞİVİ</span><b>Finansal analiz çalışmalarını incele</b><small>Kütüphane modülünde rapor kartları, metodoloji notları ve yayın durumu tek ekranda tutulur.</small></div><button onClick={onOpenResearch}><BookOpen size={15}/> RAPOR KÜTÜPHANESİNE GİT <ArrowUpRight size={13}/></button></div>; }

function FinancialAnalysisPanel({ row, points, onOpenResearch }: { row: MarketRow; points: ChartPoint[]; onOpenResearch: () => void }) {
  const valid = points.filter((point) => point.high !== null && point.low !== null && point.close !== null);
  const high = valid.length ? Math.max(...valid.map((point) => point.high!)) : null;
  const low = valid.length ? Math.min(...valid.map((point) => point.low!)) : null;
  const position = high !== null && low !== null && high !== low && row.last > 0 ? Math.round(((row.last - low) / (high - low)) * 100) : null;
  return <div className="analysis-dock"><div className="analysis-dock-head"><span>FİNANSAL ANALİZ</span><b>{row.symbol}</b></div><div className="analysis-price"><span>SON FİYAT</span><b>{row.value}</b><em className={row.tone}>{row.pct}</em></div><div className="analysis-metrics"><div><span>DÖNEM YÜKSEK</span><b>{high === null ? "—" : formatPrice(high, row.precision)}</b></div><div><span>DÖNEM DÜŞÜK</span><b>{low === null ? "—" : formatPrice(low, row.precision)}</b></div></div><div className="analysis-position"><span>FİYAT KONUMU</span><div><i style={{ width: `${position ?? 0}%` }}/></div><b>{position === null ? "VERİ BEKLİYOR" : `%${position}`}</b></div><p><Info size={13}/> Teknik fiyat görünümü yalnızca kamuya açık OHLC verisinden hesaplanır; yatırım tavsiyesi değildir.</p><button onClick={onOpenResearch}><FileText size={13}/> ARAŞTIRMA KÜTÜPHANESİ <ArrowUpRight size={12}/></button></div>;
}

function ResearchLibrary({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<ReportCategory>("TÜMÜ");
  const [selectedId, setSelectedId] = useState(reports[0].id);
  const categories: ReportCategory[] = ["TÜMÜ", ...Array.from(new Set(reports.map((report) => report.category)))];
  const filtered = reports.filter((report) => category === "TÜMÜ" || report.category === category);
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0];
  return <div className="library-module"><div className="module-banner"><div><span>ARAŞTIRMA KÜTÜPHANESİ</span><h1>Finansal analiz arşivi</h1><p>Yalnızca açılabilir kaynak dosyası eklenmiş finansal araştırmalar bu kütüphanede listelenir.</p></div><button onClick={onBack}><Grid2X2 size={14}/> PANOYA DÖN</button></div><div className="library-filters"><span><Filter size={13}/> KATEGORİ</span>{categories.map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}<small>{filtered.length} RAPOR</small></div><div className="library-grid"><div className="library-list">{filtered.map((report) => <button className={selected.id === report.id ? "research-item active" : "research-item"} onClick={() => setSelectedId(report.id)} key={report.id}><i className={report.accent}/><div><span>{report.id} · {report.category}</span><b>{report.title}</b><small><CalendarDays size={11}/>{report.period}</small></div><ArrowUpRight size={14}/></button>)}</div><article className="research-preview"><div className="preview-kicker"><span>{selected.category} / KAYNAK RAPOR</span><em>{selected.status}</em></div><h2>{selected.title}</h2><p>{selected.focus}</p><div className="preview-metadata"><div><span>METODOLOJİ</span><b>{selected.methodology}</b></div><div><span>KAYNAK</span><b>{selected.source}</b></div></div><div className="preview-disclosure"><Info size={14}/><span>Bu kart, kullanıcının eklediği örnek PDF’ye doğrudan bağlıdır. Kaynak çalışma yalnızca inceleme amacıyla listelenir.</span></div><div className="report-file-actions"><a href={selected.href} target="_blank" rel="noreferrer"><BookOpen size={14}/> PDF’Yİ AÇ</a><a href={selected.href} download><Download size={14}/> İNDİR</a></div></article></div></div>;
}

function ContactDesk({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("Araştırma portföyü hakkında iletişim");
  const [message, setMessage] = useState("");
  const mailto = useMemo(() => buildContactMailto(email, subject, name, message), [message, name, subject]);
  const openMailClient = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); if (!message.trim()) { toast.message("Mesaj alanını doldur."); return; } window.location.href = mailto; };
  return <div className="contact-module"><div className="module-banner"><div><span>BAĞLANTI MASASI</span><h1>Bir araştırma konuşması başlat</h1><p>Finansal analiz, proje iş birlikleri veya araştırma notları için doğrudan iletişime geçebilirsin.</p></div><button onClick={onBack}><Grid2X2 size={14}/> PANOYA DÖN</button></div><div className="contact-grid"><form className="contact-form" onSubmit={openMailClient}><div className="form-head"><MessageSquare size={16}/><div><b>MESAJ TASLAĞI</b><span>Gönder düğmesi varsayılan e-posta uygulamanı açar.</span></div></div><label>ADIN<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ad Soyad"/></label><label>KONU<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Mesaj konusu"/></label><label>MESAJ<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Kısa mesajını yaz..." required/></label><button type="submit"><Send size={14}/> E-POSTA İSTEMCİSİNİ AÇ</button></form><aside className="contact-channels"><div><span>DOĞRUDAN KANALLAR</span><h2>Onur İnal</h2><p>Finans · Değerleme · Piyasa Araştırması</p></div><a href={`mailto:${email}`}><Mail size={16}/><span><small>E-POSTA</small><b>{email}</b></span><ArrowUpRight size={14}/></a><a className="linkedin-channel" href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={16}/><span><small>LINKEDIN</small><b>Profesyonel profil</b></span><ArrowUpRight size={14}/></a><div className="contact-expectation"><Info size={14}/><span>Mesajın e-posta uygulamasında hazır taslak olarak açılır; böylece kişisel veri bu sitede saklanmaz.</span></div></aside></div></div>;
}

export default function Home() {
  const [activeView, setActiveView] = useState<TerminalView>(() => { const view = new URLSearchParams(window.location.search).get("view"); return view === "PROFILE" ? "PROFILE" : view === "RESEARCH" ? "RESEARCH" : view === "CONTACT" ? "CONTACT" : "DASHBOARD"; });
  const [selectedSymbol, setSelectedSymbol] = useState("THYAO");
  const [interval, setInterval] = useState<(typeof intervals)[number]>("5G");
  const [query, setQuery] = useState("");
  const [watchCategory, setWatchCategory] = useState<WatchCategory>("TÜMÜ");
  const [cvChoice, setCvChoice] = useState("TR_PHOTO");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<PanelId | null>(null);
  const [panelOrder, setPanelOrder] = useState<PanelId[]>(() => { try { const saved = JSON.parse(window.localStorage.getItem("analiz-terminal-order-v4") || "[]"); return Array.isArray(saved) && saved.length === 4 ? saved : defaultPanelOrder; } catch { return defaultPanelOrder; } });
  const [clock, setClock] = useState(() => new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));

  const quoteRequest = trpc.market.quotes.useQuery({ symbols: marketSeeds.map((item) => item.providerSymbol) }, { refetchInterval: 60_000, staleTime: 40_000, retry: 1 });
  const quoteMap = useMemo(() => new Map((quoteRequest.data ?? []).map((quote) => [quote.symbol, quote])), [quoteRequest.data]);
  const markets = useMemo(() => marketSeeds.map((seed) => mergeQuote(seed, quoteMap.get(seed.providerSymbol))), [quoteMap]);
  const row = markets.find((item) => item.symbol === selectedSymbol) ?? markets.find((item) => item.symbol === "THYAO")!;
  const chartRequest = trpc.market.chart.useQuery({ symbol: row.providerSymbol, timeframe: interval }, { refetchInterval: 60_000, staleTime: 40_000, retry: 1 });
  const searchRequest = trpc.market.search.useQuery({ query: query.trim().length >= 2 ? query.trim() : "aa" }, { enabled: query.trim().length >= 2, staleTime: 30_000, retry: 1 });

  useEffect(() => { const timer = window.setInterval(() => setClock(new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { window.localStorage.setItem("analiz-terminal-order-v4", JSON.stringify(panelOrder)); }, [panelOrder]);
  useEffect(() => { if (quoteRequest.dataUpdatedAt) void chartRequest.refetch(); }, [quoteRequest.dataUpdatedAt]);
  const filteredMarkets = markets.filter((item) => (watchCategory === "TÜMÜ" || item.category === watchCategory) && `${item.symbol} ${item.kind} ${item.providerSymbol}`.toLocaleLowerCase("tr-TR").includes(query.toLocaleLowerCase("tr-TR")));
  const changeView = (view: TerminalView) => { setActiveView(view); setMobileMenu(false); };
  const reorder = (target: PanelId) => { if (!draggedPanel || draggedPanel === target) return; setPanelOrder((order) => placePanelBefore(order, draggedPanel, target)); setDraggedPanel(null); toast.message("Panel yerleşimi güncellendi.", { description: "Yeni sıralama bu tarayıcıda kaydedildi." }); };
  const movePanel = (panel: PanelId, direction: -1 | 1) => setPanelOrder((order) => { const next = movePanelOrder(order, panel, direction); if (next !== order) toast.message("Panel sırası değiştirildi.", { description: "Dokunmatik düzen denetimi tarayıcıda saklandı." }); return next; });
  const chooseSymbol = (symbol: string) => { setSelectedSymbol(symbol); toast.message(`${symbol} grafiği açıldı.`, { description: "Gerçek OHLC verisi yükleniyor." }); };
  const panelContent: Record<PanelId, React.ReactNode> = {
    profile: <TerminalPanel key="profile" id="profile" title="ONUR İNAL PROFİLİ" code="ANALYST" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="profile-panel"><ProfilePanel selectedCv={cvChoice} onSelect={setCvChoice}/></TerminalPanel>,
    chart: <TerminalPanel key="chart" id="chart" title="FİYAT GRAFİĞİ" code="CHART" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="chart-panel"><div className="chart-toolbar"><select value={selectedSymbol} onChange={(event) => chooseSymbol(event.target.value)} aria-label="Grafik sembolü seç">{markets.filter((item) => item.kind !== "TAHVİL" || item.symbol === "ABD 10Y").map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol} · {item.kind}</option>)}</select><div className="interval-switcher">{intervals.map((item) => <button key={item} className={interval === item ? "active" : ""} onClick={() => setInterval(item)}>{item}</button>)}</div><span className="chart-toolbar-note"><BarChart3 size={13}/> İMLEÇ: OHLC</span></div><InteractiveChart row={row} points={chartRequest.data?.points ?? []} interval={interval} isLoading={chartRequest.isFetching} onRetry={() => chartRequest.refetch()}/></TerminalPanel>,
    summary: <TerminalPanel key="summary" id="summary" title="PİYASA ÖZETİ" code="MARKET_PULSE" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="summary-panel"><SummaryPanel markets={markets} isRefreshing={quoteRequest.isFetching}/></TerminalPanel>,
    archive: <TerminalPanel key="archive" id="archive" title="EĞİTİM & ARAŞTIRMA" code="RESEARCH_DESK" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="archive-panel"><div className="education-bar"><div><span>EĞİTİM</span><b>Afyon Kocatepe Üniversitesi</b><small>Uluslararası Ticaret ve Finansman & İktisat · Çift Ana Dal</small></div><div><span>YETKİNLİKLER</span><b>Finansal Analiz · Python · Excel</b><small>Pandas · SQL temelleri · IBM Cognos</small></div><a href="https://themoateco.vercel.app" target="_blank" rel="noreferrer"><BookOpen size={15}/> The Moat & Co.<ExternalLink size={12}/></a></div><ArchivePanel onOpenResearch={() => changeView("RESEARCH")}/></TerminalPanel>,
  };
  const moduleContent = activeView === "RESEARCH" ? <TerminalPanel id="archive" title="RAPOR KÜTÜPHANESİ" code="RESEARCH_LIBRARY" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="module-panel"><ResearchLibrary onBack={() => changeView("DASHBOARD")}/></TerminalPanel> : activeView === "CONTACT" ? <TerminalPanel id="archive" title="BAĞLANTI MASASI" code="CONTACT_DESK" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="module-panel"><ContactDesk onBack={() => changeView("DASHBOARD")}/></TerminalPanel> : <div className="workspace-grid">{panelOrder.map((id) => panelContent[id])}</div>;
  const activeLabel = activeView === "PROFILE" ? "PROFİL / 03" : activeView === "RESEARCH" ? "RAPORLAR / 02" : activeView === "CONTACT" ? "BAĞLANTI / 04" : "PANO / 01";

  return <div className="terminal-app"><header className="app-chrome"><div className="app-identity"><span className="signal-grid"><i/><i/><i/><b/></span><b>ANALİZ // PORTFOLIO</b><small>KİŞİSEL ARAŞTIRMA TERMİNALİ // v0.7</small></div><div className="chrome-center"><Activity size={13}/> PİYASA VERİSİ <em>{quoteRequest.isFetching ? "GÜNCELLENİYOR" : "YAHOO FINANCE"}</em><span>TR / UTC+3 · {clock}</span></div><div className="chrome-actions"><button onClick={() => quoteRequest.refetch()} title="Veriyi yenile"><Activity size={15}/></button><button onClick={() => toast.message("Bildirim merkezi temiz.")} title="Bildirimler"><Bell size={15}/></button><span className="connection-state"><i/> BAĞLI</span></div></header><nav className="tool-ribbon"><button className="terminal-menu-toggle" onClick={() => setMobileMenu((state) => !state)}><Menu size={17}/> MODÜLLER</button><div className={mobileMenu ? "tool-menu open" : "tool-menu"}>{(["DASHBOARD", "PROFILE", "RESEARCH", "CONTACT"] as TerminalView[]).map((view) => <button key={view} className={activeView === view ? "tool-button active" : "tool-button"} onClick={() => changeView(view)}>{view === "DASHBOARD" ? <Grid2X2 size={16}/> : view === "PROFILE" ? <UserRound size={16}/> : view === "RESEARCH" ? <BookOpen size={16}/> : <Mail size={16}/>} {view === "DASHBOARD" ? "PANO" : view === "PROFILE" ? "PROFİL" : view === "RESEARCH" ? "RAPORLAR" : "BAĞLANTI"}</button>)}</div></nav><div className="terminal-layout"><aside className="left-dock"><TerminalPanel id="archive" title="İZLEME LİSTESİ" code="YAHOO / LIVE" dragged={null} onDragStart={() => {}} onDrop={() => {}} movable={false} className="watchlist-panel"><div className="watchlist-tools"><Search size={13}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sembol veya şirket ara"/><span>{filteredMarkets.length}</span></div><div className="watchlist-filters">{(["TÜMÜ", "TÜRKİYE", "ABD", "MAKRO"] as WatchCategory[]).map((category) => <button key={category} className={watchCategory === category ? "active" : ""} onClick={() => setWatchCategory(category)}>{category}</button>)}</div><div className="watchlist-list">{filteredMarkets.map((item) => <button className={selectedSymbol === item.symbol ? "watch-row selected" : "watch-row"} onClick={() => chooseSymbol(item.symbol)} key={item.symbol}><span><b>{item.symbol}</b><small>{item.kind} · {item.change}</small></span><strong>{item.value}</strong><em className={item.tone}>{item.pct}</em></button>)}{query.length >= 2 && (searchRequest.data ?? []).slice(0, 4).map((item) => <button key={item.symbol} className="watch-row remote-result" onClick={() => toast.message(`${item.symbol} için serbest arama sonucu bulundu.`, { description: "Bu sembol sabit izleme evrenine eklenmeden önce doğrulama gerekir." })}><span><b>+ {item.symbol}</b><small>{item.name}</small></span><strong>ARA</strong><em className="ice-text">YAHOO</em></button>)}</div></TerminalPanel></aside><main className="terminal-workspace"><div className="workspace-path"><span>ANALİZ // PORTFOLIO</span><ChevronDown size={13}/><b>{activeLabel}</b><div/><span>PAZAR AKIŞI / 60 SN</span></div>{moduleContent}</main><aside className="right-dock"><div className="quick-links"><span>KISA YOLLAR</span><button onClick={() => changeView("PROFILE")}><UserRound size={15}/> ANALİST PROFİLİ <ArrowUpRight size={13}/></button><button onClick={() => changeView("RESEARCH")}><BookOpen size={15}/> RAPOR KÜTÜPHANESİ <ArrowUpRight size={13}/></button><button onClick={() => changeView("CONTACT")}><Mail size={15}/> İLETİŞİM MASASI <ArrowUpRight size={13}/></button></div><FinancialAnalysisPanel row={row} points={chartRequest.data?.points ?? []} onOpenResearch={() => changeView("RESEARCH")}/></aside></div>{activeView === "PROFILE" && <div className="profile-view-hint"><UserRound size={13}/> Profil bilgileri ana çalışma alanında sabit olarak görüntülenir.</div>}</div>;
}
