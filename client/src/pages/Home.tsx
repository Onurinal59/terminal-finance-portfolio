/**
 * Piyasa Odası: gerçek Yahoo Finance verisini CV profili ve modüler terminal deneyimiyle birleştiren arayüz.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowUpRight, BarChart3, Bell, BookOpen, BriefcaseBusiness, ChevronDown, Download, ExternalLink, FileText, Grid2X2, Info, Linkedin, Mail, Menu, Minus, MoreHorizontal, Search, TrendingUp, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { getAutoScrollDelta, movePanelOrder, placePanelBefore } from "@/lib/panelOrder";
import { trpc } from "@/lib/trpc";

type TerminalView = "DASHBOARD" | "PROFILE" | "RESEARCH" | "CONTACT";
type WatchCategory = "TÜMÜ" | "TÜRKİYE" | "ABD" | "MAKRO";
type ChartPoint = { time: number; close: number | null; high: number | null; low: number | null; open: number | null; volume: number | null };
type LiveQuote = { symbol: string; shortName: string; exchange: string; currency: string; price: number; previousClose: number | null; change: number | null; changePercent: number | null; marketState: string; marketTime: number | null };
type MarketRow = { symbol: string; providerSymbol: string; category: Exclude<WatchCategory, "TÜMÜ">; kind: string; value: string; change: string; pct: string; tone: "up" | "down" | "flat"; last: number; precision: number; currency: string; sourceName?: string; marketState?: string };
type PanelId = "profile" | "chart" | "summary" | "archive";

const profilePhoto = "/manus-storage/onur-inal-profile_b125dc2a.png";
const linkedInUrl = "https://www.linkedin.com/in/onur%C4%B1nal/";
const email = "onurinal815@gmail.com";
const intervals = ["1G", "5G", "1A", "3A", "1Y"] as const;

const cvChoices = [
  { id: "TR_PHOTO", label: "TÜRKÇE", detail: "FOTOĞRAFLI", href: "/manus-storage/Onur_Inal_CV_Fotografli_61ab782c.pdf" },
  { id: "TR_ATS", label: "TÜRKÇE", detail: "ATS / FOTOĞRAFSIZ", href: "/manus-storage/Onur_Inal_CV_ATS_a639d5c7.pdf" },
  { id: "EN_PHOTO", label: "ENGLISH", detail: "PHOTO CV", href: "/manus-storage/Onur_Inal_CV_EN_Fotografli_90e0f88f.pdf" },
  { id: "EN_ATS", label: "ENGLISH", detail: "ATS / NO PHOTO", href: "/manus-storage/Onur_Inal_CV_EN_ATS_489de46a.pdf" },
] as const;

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
function mergeQuote(seed: MarketRow, quote?: LiveQuote): MarketRow {
  if (!quote) return seed;
  const tone: MarketRow["tone"] = quote.change === null ? "flat" : quote.change >= 0 ? "up" : "down";
  const signed = (value: number | null) => value === null ? "—" : `${value >= 0 ? "+" : ""}${formatPrice(value, seed.precision)}`;
  return { ...seed, value: formatPrice(quote.price, seed.precision), change: signed(quote.change), pct: quote.changePercent === null ? "—" : `${quote.changePercent >= 0 ? "+" : ""}${formatPrice(quote.changePercent, 2)}%`, tone, last: quote.price, currency: quote.currency || seed.currency, sourceName: quote.shortName, marketState: quote.marketState };
}

function TerminalPanel({ id, title, code, children, className = "", dragged, onDragStart, onDrop, onMove = () => {} }: { id: PanelId; title: string; code: string; children: React.ReactNode; className?: string; dragged: PanelId | null; onDragStart: (id: PanelId | null) => void; onDrop: (id: PanelId) => void; onMove?: (id: PanelId, direction: -1 | 1) => void }) {
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const target = dragged !== null && dragged !== id;
  const autoScroll = (event: { preventDefault: () => void; clientY: number }) => { event.preventDefault(); const delta = getAutoScrollDelta(event.clientY, window.innerHeight); if (delta) window.scrollBy(0, delta); };
  return <section className={`terminal-panel workspace-panel ${className} ${dragged === id ? "panel-dragging" : ""} ${target ? "panel-drop-target" : ""}`} draggable onDragStart={(event) => { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("application/x-analiz-panel", id); onDragStart(id); }} onDragOver={autoScroll} onDrop={(event) => { event.preventDefault(); onDrop(id); }} onDragEnd={() => onDragStart(null)}>
    {target && <div className="panel-drop-indicator">BURAYA BIRAK</div>}
    <div className="panel-titlebar"><div className="panel-title"><span className="drag-grip" title="Paneli tutup taşı">⠿</span><span className="panel-led" />{title}<em>{code}</em></div><div className="panel-actions"><div className="touch-reorder"><button onClick={() => onMove(id, -1)} title="Paneli yukarı taşı" aria-label={`${title} panelini yukarı taşı`}>↑</button><button onClick={() => onMove(id, 1)} title="Paneli aşağı taşı" aria-label={`${title} panelini aşağı taşı`}>↓</button></div><button onClick={() => setCollapsed((state) => !state)} title="Paneli aç/kapat" aria-label={`${title} panelini aç/kapat`}><Minus size={12}/></button><button onClick={() => setMenuOpen((state) => !state)} title="Panel seçenekleri" aria-label={`${title} panel seçenekleri`}><MoreHorizontal size={14}/></button>{menuOpen && <div className="panel-options"><button onClick={() => { setMenuOpen(false); toast.message(`${title} açık durumda.`); }}>DURUMU GÖSTER</button><button onClick={() => { setCollapsed(false); setMenuOpen(false); }}>AÇ</button></div>}</div></div>
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
  return <div className="chart-content"><div className="chart-metadata"><div><span>{row.symbol}</span><b>{row.value}</b><strong className={row.tone}>{row.change} <small>({row.pct})</small></strong></div><div className="chart-stats"><span>YÜKSEK <b>{formatPrice(ceiling, row.precision)}</b></span><span>DÜŞÜK <b>{formatPrice(floor, row.precision)}</b></span><span>HACİM <b>{active?.volume ? new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(active.volume) : "—"}</b></span></div></div><div className="chart-canvas"><span className="chart-mode-label">GERÇEK OHLC · İMLEÇLE İNCELE</span>{isLoading && <div className="chart-loading">CANLI OHLC VERİSİ YÜKLENİYOR…</div>}{!isLoading && !valid.length && <div className="chart-loading chart-error"><span>GRAFİK VERİSİ ALINAMADI</span><button onClick={onRetry}>TEKRAR DENE</button></div>}<svg ref={canvasRef} viewBox="0 0 500 170" preserveAspectRatio="none" onMouseMove={move} onMouseLeave={() => setHoverIndex(null)} aria-label={`${row.symbol} interaktif gerçek fiyat grafiği`}><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#78F27B" stopOpacity=".18"/><stop offset="100%" stopColor="#78F27B" stopOpacity="0"/></linearGradient></defs>{[34,67,100,133].map((lineY) => <line key={lineY} x1="0" x2="500" y1={lineY} y2={lineY} stroke="rgba(153,183,172,.16)" strokeDasharray="2 3"/>)}{valid.length > 1 && <><path d={`${path} L500 170 L0 170 Z`} fill="url(#chart-fill)"/><path d={path} fill="none" stroke="#78F27B" strokeWidth="1.7"/>{valid.map((point, index) => { const up = point.close! >= point.open!; return <g key={point.time}><line x1={x(index)} x2={x(index)} y1={y(point.high!)} y2={y(point.low!)} stroke={up ? "#75e779" : "#e97d74"}/><rect x={x(index) - Math.max(2, 110 / Math.max(valid.length, 16))} y={Math.min(y(point.open!), y(point.close!))} width={Math.max(3, 210 / Math.max(valid.length, 18))} height={Math.max(2, Math.abs(y(point.open!) - y(point.close!)))} fill={up ? "#75e779" : "#e97d74"}/></g>; })}</>}{active && <><line x1={x(activeIndex)} x2={x(activeIndex)} y1="0" y2="170" stroke="#8FC9ED" strokeDasharray="3 3"/><circle cx={x(activeIndex)} cy={y(active.close!)} r="3.2" fill="#0c1920" stroke="#8FC9ED" strokeWidth="1.5"/></>}</svg>{active && <div className="ohlc-tooltip" style={{ left: `${Math.min(72, Math.max(2, (x(activeIndex) / 500) * 100))}%` }}><span>{label(active.time)}</span><div><b>A</b>{formatPrice(active.open!, row.precision)} <b>Y</b>{formatPrice(active.high!, row.precision)}</div><div><b>D</b>{formatPrice(active.low!, row.precision)} <b>K</b>{formatPrice(active.close!, row.precision)}</div><small>HACİM {active.volume ? new Intl.NumberFormat("tr-TR", { notation: "compact" }).format(active.volume) : "—"}</small></div>}<div className="chart-x-axis"><span>{valid[0] ? label(valid[0].time) : "—"}</span><span>{active ? label(active.time) : "—"}</span><span>{valid.at(-1) ? label(valid.at(-1)!.time) : "—"}</span></div></div><div className="chart-footer"><span>YAHOO FINANCE / {interval} / {row.marketState ?? "GECİKMELİ"}</span><span><Activity size={12}/> {row.currency} · {row.sourceName ?? row.providerSymbol}</span></div></div>;
}

function ProfilePanel({ selectedCv, onSelect }: { selectedCv: string; onSelect: (id: string) => void }) {
  const cv = cvChoices.find((item) => item.id === selectedCv) ?? cvChoices[0];
  return <div className="profile-terminal"><div className="profile-identity"><img src={profilePhoto} alt="Onur İnal"/><div><span>ANALİST PROFİLİ</span><h1>ONUR İNAL</h1><p>Finans · Değerleme · Piyasa Araştırması</p><a href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={13}/> LINKEDIN PROFİLİ <ExternalLink size={12}/></a></div><div className="profile-mark"><b>3,20</b><small>GPA / 4,00</small></div></div><div className="profile-highlights"><span>ÇİFT ANA DAL<br/><b>ULUSLARARASI TİCARET & FİNANSMAN · İKTİSAT</b></span><span>AKADEMİK DÖNEM<br/><b>2023 — 2027</b></span><span>YETKİNLİK<br/><b>FİNANSAL ANALİZ · PYTHON · EXCEL</b></span></div><div className="cv-selector"><div><span>CV İNDİR</span><p>İstenilen dil ve biçimi seç.</p></div><div className="cv-options">{cvChoices.map((item) => <button key={item.id} className={selectedCv === item.id ? "active" : ""} onClick={() => onSelect(item.id)}><b>{item.label}</b><small>{item.detail}</small></button>)}</div><a className="cv-download" href={cv.href} download><Download size={15}/> {cv.label} · {cv.detail} İNDİR</a></div></div>;
}

function SummaryPanel({ markets, isRefreshing }: { markets: MarketRow[]; isRefreshing: boolean }) {
  const bySymbol = (symbol: string) => markets.find((item) => item.symbol === symbol);
  const items = ["BIST 100", "S&P 500", "USD/TRY", "VIX", "ALTIN", "ABD 10Y"].map((symbol) => bySymbol(symbol)).filter(Boolean) as MarketRow[];
  const pctValue = (item: MarketRow) => Number.parseFloat(item.pct.replace("%", "").replace(",", "."));
  const movers = markets.filter((item) => item.kind === "HİSSE" && item.last > 0 && Number.isFinite(pctValue(item))).sort((a, b) => pctValue(b) - pctValue(a));
  return <div className="summary-terminal"><div className="summary-grid">{items.map((item) => <div className="summary-card" key={item.symbol}><span>{item.symbol}</span><b>{item.value}</b><em className={item.tone}>{item.pct}</em><small>{item.kind} · {item.currency}</small></div>)}</div><div className="summary-bottom"><div><span>GÜNÜN HAREKETLİSİ</span><b className={movers[0]?.tone ?? "flat"}>{movers[0]?.symbol ?? "—"} <small>{movers[0]?.pct ?? "—"}</small></b></div><div><span>EN ZAYIF</span><b className={movers.at(-1)?.tone ?? "flat"}>{movers.at(-1)?.symbol ?? "—"} <small>{movers.at(-1)?.pct ?? "—"}</small></b></div><div><span>VERİ AKIŞI</span><b>{isRefreshing ? "GÜNCELLENİYOR" : "60 SN / BAĞLI"}</b></div></div></div>;
}

function ArchivePanel() { return <div className="report-table"><div className="report-head"><span>ID</span><span>RAPOR</span><span>ETİKET</span><span>TARİH</span><span>DURUM</span></div>{[["R-01", "BIST 30 Şirket Analizi", "EQUITY"], ["R-02", "Türkiye Makro Görünüm", "MACRO"], ["R-03", "Bankacılık Sektör Notu", "SECTOR"]].map(([id, title, tag]) => <button className="report-line" key={id} onClick={() => toast.message(`${title} için PDF yakında bağlanacak.`)}><span className="report-color green"/><b>{id}</b><strong>{title}</strong><em>{tag}</em><span>2026 / Q3</span><small><i/> PDF BEKLİYOR</small></button>)}</div>; }

export default function Home() {
  const [activeView, setActiveView] = useState<TerminalView>(() => new URLSearchParams(window.location.search).get("view") === "PROFILE" ? "PROFILE" : "DASHBOARD");
  const [selectedSymbol, setSelectedSymbol] = useState("THYAO");
  const [interval, setInterval] = useState<(typeof intervals)[number]>("5G");
  const [query, setQuery] = useState("");
  const [watchCategory, setWatchCategory] = useState<WatchCategory>("TÜMÜ");
  const [cvChoice, setCvChoice] = useState("TR_PHOTO");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [draggedPanel, setDraggedPanel] = useState<PanelId | null>(null);
  const [panelOrder, setPanelOrder] = useState<PanelId[]>(() => { try { const saved = JSON.parse(window.localStorage.getItem("analiz-terminal-order-v4") || "[]"); return Array.isArray(saved) && saved.length === 4 ? saved : ["profile", "chart", "summary", "archive"]; } catch { return ["profile", "chart", "summary", "archive"]; } });
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
  const reorder = (target: PanelId) => { if (!draggedPanel || draggedPanel === target) return; setPanelOrder((order) => placePanelBefore(order, draggedPanel, target)); setDraggedPanel(null); toast.message("Panel yerleşimi güncellendi.", { description: "Yeni sıralama bu tarayıcıda kaydedildi." }); };
  const movePanel = (panel: PanelId, direction: -1 | 1) => setPanelOrder((order) => { const next = movePanelOrder(order, panel, direction); if (next !== order) toast.message("Panel sırası değiştirildi.", { description: "Dokunmatik düzen denetimi tarayıcıda saklandı." }); return next; });
  const chooseSymbol = (symbol: string) => { setSelectedSymbol(symbol); toast.message(`${symbol} grafiği açıldı.`, { description: "Gerçek OHLC verisi yükleniyor." }); };
  const panelContent: Record<PanelId, React.ReactNode> = {
    profile: <TerminalPanel id="profile" title="ONUR İNAL PROFİLİ" code="ANALYST" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="profile-panel"><ProfilePanel selectedCv={cvChoice} onSelect={setCvChoice}/></TerminalPanel>,
    chart: <TerminalPanel id="chart" title="FİYAT GRAFİĞİ" code="CHART" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="chart-panel"><div className="chart-toolbar"><select value={selectedSymbol} onChange={(event) => chooseSymbol(event.target.value)} aria-label="Grafik sembolü seç"><>{markets.filter((item) => item.kind !== "TAHVİL" || item.symbol === "ABD 10Y").map((item) => <option key={item.symbol} value={item.symbol}>{item.symbol} · {item.kind}</option>)}</></select><div className="interval-switcher">{intervals.map((item) => <button key={item} className={interval === item ? "active" : ""} onClick={() => setInterval(item)}>{item}</button>)}</div><span className="chart-toolbar-note"><BarChart3 size={13}/> İMLEÇ: OHLC</span></div><InteractiveChart row={row} points={chartRequest.data?.points ?? []} interval={interval} isLoading={chartRequest.isFetching} onRetry={() => chartRequest.refetch()}/></TerminalPanel>,
    summary: <TerminalPanel id="summary" title="PİYASA ÖZETİ" code="MARKET_PULSE" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="summary-panel"><SummaryPanel markets={markets} isRefreshing={quoteRequest.isFetching}/></TerminalPanel>,
    archive: <TerminalPanel id="archive" title="EĞİTİM & YETKİNLİK" code="CV_PROFILE" dragged={draggedPanel} onDragStart={setDraggedPanel} onDrop={reorder} onMove={movePanel} className="archive-panel"><div className="education-bar"><div><span>EĞİTİM</span><b>Afyon Kocatepe Üniversitesi</b><small>Uluslararası Ticaret ve Finansman & İktisat · Çift Ana Dal</small></div><div><span>YETKİNLİKLER</span><b>Finansal Analiz · Python · Excel</b><small>Pandas · SQL temelleri · IBM Cognos</small></div><a href="https://themoateco.vercel.app" target="_blank" rel="noreferrer"><BookOpen size={15}/> The Moat & Co.<ExternalLink size={12}/></a></div><ArchivePanel/></TerminalPanel>,
  };

  return <div className="terminal-app"><header className="app-chrome"><div className="app-identity"><span className="signal-grid"><i/><i/><i/><b/></span><b>ANALİZ // PORTFOLIO</b><small>KİŞİSEL ARAŞTIRMA TERMİNALİ // v0.6</small></div><div className="chrome-center"><Activity size={13}/> PİYASA VERİSİ <em>{quoteRequest.isFetching ? "GÜNCELLENİYOR" : "YAHOO FINANCE"}</em><span>TR / UTC+3 · {clock}</span></div><div className="chrome-actions"><button onClick={() => quoteRequest.refetch()} title="Veriyi yenile"><Activity size={15}/></button><button onClick={() => toast.message("Bildirim merkezi temiz.")} title="Bildirimler"><Bell size={15}/></button><span className="connection-state"><i/> BAĞLI</span></div></header><nav className="tool-ribbon"><button className="terminal-menu-toggle" onClick={() => setMobileMenu((state) => !state)}><Menu size={17}/> MODÜLLER</button><div className={mobileMenu ? "tool-menu open" : "tool-menu"}>{(["DASHBOARD", "PROFILE", "RESEARCH", "CONTACT"] as TerminalView[]).map((view) => <button key={view} className={activeView === view ? "tool-button active" : "tool-button"} onClick={() => { setActiveView(view); setMobileMenu(false); }}>{view === "DASHBOARD" ? <Grid2X2 size={16}/> : view === "PROFILE" ? <UserRound size={16}/> : view === "RESEARCH" ? <BookOpen size={16}/> : <Mail size={16}/>} {view === "DASHBOARD" ? "PANO" : view === "PROFILE" ? "PROFİL" : view === "RESEARCH" ? "RAPORLAR" : "BAĞLANTI"}</button>)}</div></nav><div className="terminal-layout"><aside className="left-dock"><TerminalPanel id="archive" title="İZLEME LİSTESİ" code="YAHOO / LIVE" dragged={null} onDragStart={() => {}} onDrop={() => {}} className="watchlist-panel"><div className="watchlist-tools"><Search size={13}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sembol veya şirket ara"/><span>{filteredMarkets.length}</span></div><div className="watchlist-filters">{(["TÜMÜ", "TÜRKİYE", "ABD", "MAKRO"] as WatchCategory[]).map((category) => <button key={category} className={watchCategory === category ? "active" : ""} onClick={() => setWatchCategory(category)}>{category}</button>)}</div><div className="watchlist-list">{filteredMarkets.map((item) => <button className={selectedSymbol === item.symbol ? "watch-row selected" : "watch-row"} onClick={() => chooseSymbol(item.symbol)} key={item.symbol}><span><b>{item.symbol}</b><small>{item.kind} · {item.change}</small></span><strong>{item.value}</strong><em className={item.tone}>{item.pct}</em></button>)}{query.length >= 2 && (searchRequest.data ?? []).slice(0, 4).map((item) => <button key={item.symbol} className="watch-row remote-result" onClick={() => toast.message(`${item.symbol} için serbest arama sonucu bulundu.`, { description: "Bu sembol sabit izleme evrenine eklenmeden önce doğrulama gerekir." })}><span><b>+ {item.symbol}</b><small>{item.name}</small></span><strong>ARA</strong><em className="ice-text">YAHOO</em></button>)}</div></TerminalPanel></aside><main className="terminal-workspace"><div className="workspace-path"><span>ANALİZ // PORTFOLIO</span><ChevronDown size={13}/><b>{activeView === "PROFILE" ? "PROFİL / 03" : activeView === "RESEARCH" ? "RAPORLAR / 02" : "PANO / 01"}</b><div/><span>PAZAR AKIŞI / 60 SN</span></div><div className="workspace-grid">{panelOrder.map((id) => panelContent[id])}</div></main><aside className="right-dock"><div className="quick-links"><span>KISA YOLLAR</span><button onClick={() => setActiveView("PROFILE")}><UserRound size={15}/> ANALİST PROFİLİ <ArrowUpRight size={13}/></button><button onClick={() => setActiveView("RESEARCH")}><BookOpen size={15}/> RAPOR KÜTÜPHANESİ <ArrowUpRight size={13}/></button><a href={`mailto:${email}?subject=Portfolio%20üzerinden%20iletişim`}><Mail size={15}/> İLETİŞİM MASASI <ArrowUpRight size={13}/></a></div><div className="session-card"><span>ÇALIŞMA DURUMU</span><p><b>OTURUM</b><em>AKTİF</em></p><p><b>VERİ AKIŞI</b><em>YAHOO / GECİKMELİ</em></p><p><b>GRAFİK</b><em>OHLC / HOVER</em></p><small><Info size={13}/> Fiyat ve grafik verileri Yahoo Finance sağlayıcısından gelir; yatırım tavsiyesi değildir.</small></div></aside></div>{activeView === "CONTACT" && <div className="terminal-modal-backdrop"><div className="terminal-modal"><div className="modal-head"><div><span>BAĞLANTI MASASI</span><h2>Onur İnal ile iletişime geç</h2></div><button onClick={() => setActiveView("DASHBOARD")}><X size={17}/></button></div><p>E-posta kanalı veya LinkedIn üzerinden iletişime geçebilirsin.</p><div className="modal-actions"><a href={`mailto:${email}`}><Mail size={14}/> E-POSTA</a><a href={linkedInUrl} target="_blank" rel="noreferrer"><Linkedin size={14}/> LINKEDIN</a></div></div></div>}</div>;
}
