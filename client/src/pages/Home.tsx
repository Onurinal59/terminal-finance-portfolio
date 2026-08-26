/**
 * Piyasa Odası revizyonu: Landing page değil, yoğun panelli finans araştırma terminali.
 * Koyu çelik yüzey, monospace veri ritmi, sabit program kromu ve #78F27B aktif sinyal.
 */
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  FileText,
  Grid2X2,
  Info,
  LayoutDashboard,
  Mail,
  Maximize2,
  Menu,
  Minus,
  MoreHorizontal,
  Search,
  Settings2,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

type TerminalView = "DASHBOARD" | "RESEARCH" | "PROFILE" | "CONTACT";

const marketRows = [
  { symbol: "BIST 100", value: "10.842,17", change: "+0,84", pct: "+0,84%", tone: "up" },
  { symbol: "XBANK", value: "15.506,72", change: "+1,21", pct: "+1,21%", tone: "up" },
  { symbol: "THYAO", value: "304,25", change: "-0,16", pct: "-0,16%", tone: "down" },
  { symbol: "ASELS", value: "170,10", change: "+2,04", pct: "+2,04%", tone: "up" },
  { symbol: "USD/TRY", value: "41,0281", change: "+0,12", pct: "+0,12%", tone: "up" },
  { symbol: "XAU/USD", value: "3.382,40", change: "-0,31", pct: "-0,31%", tone: "down" },
];

const reports = [
  { code: "R-01", type: "EQUITY", title: "BIST 30 Şirket Analizi", state: "PDF PENDING", color: "green" },
  { code: "R-02", type: "MACRO", title: "Türkiye Makro Görünüm", state: "PDF PENDING", color: "blue" },
  { code: "R-03", type: "SECTOR", title: "Bankacılık Sektör Notu", state: "PDF PENDING", color: "red" },
];

const bidRows = [
  ["304,25", "18.420"],
  ["304,00", "12.680"],
  ["303,75", "8.940"],
  ["303,50", "5.210"],
];

const askRows = [
  ["304,50", "9.670"],
  ["304,75", "11.230"],
  ["305,00", "16.840"],
  ["305,25", "7.110"],
];

const viewMeta: Record<TerminalView, { title: string; subtitle: string; module: string }> = {
  DASHBOARD: {
    title: "ANALİST ÇALIŞMA ALANI",
    subtitle: "Piyasa bağlamı, analiz tezi ve kişisel araştırma akışı.",
    module: "DASHBOARD / 01",
  },
  RESEARCH: {
    title: "ARAŞTIRMA KÜTÜPHANESİ",
    subtitle: "Yayınlanmış analizler, varsayımlar ve PDF rapor dosyaları.",
    module: "RESEARCH / 02",
  },
  PROFILE: {
    title: "ANALİST PROFİLİ",
    subtitle: "Finans eğitimi, çalışma yaklaşımı ve özgeçmiş modülü.",
    module: "PROFILE / 03",
  },
  CONTACT: {
    title: "BAĞLANTI MASASI",
    subtitle: "Ortak araştırma, staj ve iş fırsatları için erişim noktası.",
    module: "CONTACT / 04",
  },
};

function Panel({
  title,
  code,
  children,
  className = "",
  actions = true,
}: {
  title: string;
  code?: string;
  children: React.ReactNode;
  className?: string;
  actions?: boolean;
}) {
  return (
    <section className={`terminal-panel ${className}`}>
      <div className="panel-titlebar">
        <div className="panel-title"><span className="panel-led" />{title}{code && <em>{code}</em>}</div>
        {actions && <div className="panel-actions"><Minus size={12} /><Maximize2 size={11} /><MoreHorizontal size={14} /></div>}
      </div>
      <div className="panel-body">{children}</div>
    </section>
  );
}

function PriceChart({ selectedSymbol, interval }: { selectedSymbol: string; interval: string }) {
  const candles: [number, number, number, number, boolean][] = [
    [40, 126, 20, 148, true], [68, 118, 72, 144, true], [96, 112, 76, 124, false], [124, 102, 64, 128, true],
    [152, 96, 58, 115, true], [180, 111, 89, 134, false], [208, 85, 46, 120, true], [236, 79, 51, 105, true],
    [264, 74, 40, 103, true], [292, 91, 68, 111, false], [320, 64, 31, 101, true], [348, 53, 25, 78, true],
    [376, 67, 48, 91, false], [404, 45, 19, 80, true], [432, 51, 26, 72, true], [460, 39, 16, 62, true],
  ];
  return (
    <div className="chart-content">
      <div className="chart-metadata">
        <div><span>{selectedSymbol}</span><b>304,25</b><strong className="positive">+1,85 <small>(+0,61%)</small></strong></div>
        <div className="chart-stats"><span>YÜKSEK <b>305,25</b></span><span>DÜŞÜK <b>299,10</b></span><span>HACİM <b>6,28M</b></span></div>
      </div>
      <div className="chart-canvas">
        <div className="chart-axis top-axis"><span>306.00</span><span>304.00</span><span>302.00</span><span>300.00</span></div>
        <svg viewBox="0 0 500 170" preserveAspectRatio="none" aria-label={`${selectedSymbol} simüle fiyat grafiği`}>
          <defs>
            <linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#78f27b" stopOpacity=".18" /><stop offset="100%" stopColor="#78f27b" stopOpacity="0" /></linearGradient>
          </defs>
          {[34, 67, 100, 133].map((y) => <line key={y} x1="0" x2="500" y1={y} y2={y} stroke="rgba(153,183,172,.16)" strokeDasharray="2 3" />)}
          {[62, 124, 186, 248, 310, 372, 434].map((x) => <line key={x} x1={x} x2={x} y1="0" y2="170" stroke="rgba(153,183,172,.1)" strokeDasharray="2 4" />)}
          <path d="M0 142 C28 137 43 131 65 134 S98 117 125 111 S158 108 180 114 S206 92 235 88 S264 81 290 86 S320 69 348 65 S375 72 402 49 S434 48 466 31 S487 36 500 25 L500 170 L0 170 Z" fill="url(#chart-fill)" />
          <path d="M0 142 C28 137 43 131 65 134 S98 117 125 111 S158 108 180 114 S206 92 235 88 S264 81 290 86 S320 69 348 65 S375 72 402 49 S434 48 466 31 S487 36 500 25" fill="none" stroke="#78f27b" strokeWidth="1.6" />
          {candles.map(([x, open, high, low, isUp], index) => {
            const y = Math.min(open, low);
            const height = Math.max(7, Math.abs(low - open));
            return <g key={index}><line x1={x} x2={x} y1={high} y2={low} stroke={isUp ? "#75e779" : "#e97d74"} strokeWidth="1" /><rect x={x - 2.5} y={y} width="5" height={height} fill={isUp ? "#75e779" : "#e97d74"} /></g>;
          })}
        </svg>
        <div className="last-price-line"><span>304,25</span></div>
        <div className="chart-x-axis"><span>10:00</span><span>11:00</span><span>12:00</span><span>13:00</span><span>14:00</span></div>
      </div>
      <div className="chart-footer"><span>SİMÜLE VERİ / {interval} GRAFİK</span><span><Activity size={12} /> KAPANIŞA 02:17:41</span></div>
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<TerminalView>("DASHBOARD");
  const [selectedSymbol, setSelectedSymbol] = useState("THYAO");
  const [interval, setInterval] = useState("5D");
  const [query, setQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredMarkets = useMemo(
    () => marketRows.filter((row) => row.symbol.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const meta = viewMeta[activeView];

  const selectView = (view: TerminalView) => {
    setActiveView(view);
    setMobileMenu(false);
  };

  const showPending = (name: string) => toast.message(`${name} henüz yayınlanmadı.`, { description: "PDF dosyası eklendiğinde terminalden doğrudan açılacak." });

  return (
    <div className="terminal-app">
      <a className="terminal-skip" href="#terminal-workspace">Ana çalışma alanına geç</a>

      <header className="app-chrome">
        <div className="app-identity"><span className="signal-grid" aria-hidden="true"><i /><i /><i /><b /></span><b>ANALİZ // PORTFOLIO</b><small>KİŞİSEL ARAŞTIRMA TERMİNALİ // v0.3</small></div>
        <div className="chrome-center"><span><Activity size={13} /> PİYASA VERİSİ</span><em>SİMÜLE</em><span className="chrome-clock">TR / UTC+3&nbsp;&nbsp; 14:36:25</span></div>
        <div className="chrome-actions"><button aria-label="Bildirimler"><Bell size={15} /><i /></button><button aria-label="Yardım"><Info size={15} /></button><span className="connection-state"><i /> BAĞLI</span></div>
      </header>

      <nav className="tool-ribbon" aria-label="Terminal araçları">
        <button className="terminal-menu-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-expanded={mobileMenu}><Menu size={17} /> MODÜLLER</button>
        <div className={mobileMenu ? "tool-menu open" : "tool-menu"}>
          <button className={activeView === "DASHBOARD" ? "tool-button active" : "tool-button"} onClick={() => selectView("DASHBOARD")}><LayoutDashboard size={16} /> PANO</button>
          <button className={activeView === "RESEARCH" ? "tool-button active" : "tool-button"} onClick={() => selectView("RESEARCH")}><BookOpen size={16} /> RAPORLAR</button>
          <button className={activeView === "PROFILE" ? "tool-button active" : "tool-button"} onClick={() => selectView("PROFILE")}><UserRound size={16} /> PROFİL</button>
          <button className={activeView === "CONTACT" ? "tool-button active" : "tool-button"} onClick={() => selectView("CONTACT")}><Mail size={16} /> BAĞLANTI</button>
        </div>
        <div className="ribbon-spacer" />
        <button className="ribbon-icon" onClick={() => toast.message("Düzen görünümü hazır.", { description: "Modüller kişisel çalışma düzeni için tasarlandı." })} aria-label="Düzen ayarları"><Grid2X2 size={16} /></button>
        <button className="ribbon-icon" onClick={() => toast.message("Ayarlar modülü yakında eklenecek.")} aria-label="Ayarlar"><Settings2 size={16} /></button>
      </nav>

      <div className="terminal-layout">
        <aside className="left-dock">
          <Panel title="İZLEME LİSTESİ" code="WATCHLIST" actions={false} className="watchlist-panel">
            <div className="watchlist-tools"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Sembol ara" aria-label="Sembol ara" /><span>{filteredMarkets.length}</span></div>
            <div className="watchlist-head"><span>SEMBOL</span><span>SON</span><span>%</span></div>
            <div className="watchlist-list">
              {filteredMarkets.map((row) => <button className={selectedSymbol === row.symbol ? "watch-row selected" : "watch-row"} key={row.symbol} onClick={() => setSelectedSymbol(row.symbol)}>
                <span><b>{row.symbol}</b><small>{row.tone === "up" ? "▲" : "▼"} {row.change}</small></span><strong>{row.value}</strong><em className={row.tone}>{row.pct}</em>
              </button>)}
              {filteredMarkets.length === 0 && <p className="empty-result">Sonuç yok</p>}
            </div>
          </Panel>
          <Panel title="GÜNDEM" code="NEWS" actions={false} className="agenda-panel">
            <button><span className="news-time">14:32</span><p>TCMB beklentisi piyasa fiyatlamasında öne çıktı.</p></button>
            <button><span className="news-time">14:10</span><p>BIST işlem hacmi gün içi ortalamanın üzerinde.</p></button>
          </Panel>
        </aside>

        <main id="terminal-workspace" className="terminal-workspace">
          <div className="workspace-path"><span>ANALİZ // PORTFOLIO</span><ChevronDown size={13} /><b>{meta.module}</b><div /><span>DÜZEN: ARAŞTIRMA_MASASI</span></div>

          <div className="main-grid">
            <Panel title="FİYAT GRAFİĞİ" code="CHART" className="chart-panel">
              <div className="chart-toolbar"><div className="symbol-pill"><span>{selectedSymbol}</span><ChevronDown size={12} /></div><div className="interval-switcher">{["1G", "5G", "1A", "3A", "1Y"].map((item) => <button key={item} className={interval === item ? "active" : ""} onClick={() => setInterval(item)}>{item}</button>)}</div><div className="chart-icons"><BarChart3 size={14} /><TrendingUp size={14} /><MoreHorizontal size={14} /></div></div>
              <PriceChart selectedSymbol={selectedSymbol} interval={interval} />
            </Panel>

            <Panel title="EMİR DERİNLİĞİ" code="DEPTH" className="depth-panel">
              <div className="depth-symbol"><b>{selectedSymbol}</b><span>KADEME 10 / SİMÜLE</span></div>
              <div className="depth-columns"><span>ALIŞ</span><span>LOT</span><span>SATIŞ</span><span>LOT</span></div>
              <div className="depth-book">
                <div>{bidRows.map(([price, lot], index) => <div className="depth-row bid" key={price} style={{ "--depth": `${84 - index * 13}%` } as React.CSSProperties}><b>{price}</b><span>{lot}</span></div>)}</div>
                <div>{askRows.map(([price, lot], index) => <div className="depth-row ask" key={price} style={{ "--depth": `${65 + index * 6}%` } as React.CSSProperties}><b>{price}</b><span>{lot}</span></div>)}</div>
              </div>
              <div className="depth-spread"><span>SPREAD</span><b>0,25</b><span>TOPLAM LOT</span><b>90.100</b></div>
            </Panel>

            <Panel title={meta.title} code="ANALYST" className="context-panel">
              <div className="context-content">
                <div className="context-head"><span className="module-badge">{meta.module}</span><span className="brand-channel">ANALİZ // PORTFOLIO</span><h1>{meta.title}</h1><p>{meta.subtitle}</p></div>
                {activeView === "DASHBOARD" && <div className="context-dashboard"><div className="analyst-card"><div className="profile-signal-art" aria-hidden="true"><span>AP</span><i /><i /><i /></div><div><span>ANALİST PROFİLİ</span><b>ADIN SOYADIN</b><small>Finans · Değerleme · Piyasa Araştırması</small></div></div><div className="thesis-box"><span>AKTİF TEZ</span><p>“Veriyi izlemek değil, savunulabilir bir tez kurmak.”</p><button onClick={() => selectView("RESEARCH")}>ARAŞTIRMA MASASINA GİT <ArrowUpRight size={13} /></button></div></div>}
                {activeView === "RESEARCH" && <div className="quick-grid"><div><span>YAYIN</span><b>03</b><small>RAPOR KUYRUĞU</small></div><div><span>MODEL</span><b>04</b><small>ÇALIŞMA NOTU</small></div><div><span>DURUM</span><b className="green-word">AKTİF</b><small>ARAŞTIRMA MODU</small></div></div>}
                {activeView === "PROFILE" && <div className="profile-spec"><div><span>ODAK</span><b>ŞİRKET ANALİZİ</b></div><div><span>YAKLAŞIM</span><b>VERİ + BAĞLAM</b></div><div><span>CV</span><button onClick={() => showPending("CV dosyası")}><BriefcaseBusiness size={13} /> PDF PENDING</button></div></div>}
                {activeView === "CONTACT" && <div className="contact-terminal"><span>COMMUNICATION CHANNEL / 01</span><a href="mailto:eposta@adresin.com?subject=Portfolio%20üzerinden%20iletişim"><Mail size={17} /> eposta@adresin.com <ArrowUpRight size={14} /></a><small>Gerçek iletişim bilgilerinle güncellenecek.</small></div>}
              </div>
            </Panel>

            <Panel title="PİYASA ÖZETİ" code="SUMMARY" className="summary-panel">
              <div className="summary-tiles"><div><span>BIST 100</span><b>10.842</b><em className="up">+0,84%</em></div><div className="neutral-tile"><span>USD/TRY</span><b>41,028</b><em>+0,12%</em></div><div><span>GRAM ALTIN</span><b>4.457</b><em className="down">-0,31%</em></div></div>
              <div className="sentiment"><span>RİSK İŞTAHI</span><div><i style={{ width: "66%" }} /></div><b>POZİTİF</b></div>
            </Panel>
          </div>

          <Panel title="ARAŞTIRMA ARŞİVİ" code="REPORT_QUEUE" className="research-panel">
            <div className="research-toolbar"><span><FileText size={14} /> ANALİZ // PORTFOLIO / ARŞİV</span><button onClick={() => selectView("RESEARCH")}>TÜM RAPORLAR <ArrowUpRight size={13} /></button></div>
            <div className="report-table"><div className="report-head"><span>ID</span><span>RAPOR</span><span>ETİKET</span><span>TARİH</span><span>DURUM</span><span /></div>{reports.map((report) => <button key={report.code} className="report-line" onClick={() => showPending(report.title)}><span className={`report-color ${report.color}`} /><b>{report.code}</b><strong>{report.title}</strong><em>{report.type}</em><span>2026 / Q3</span><small><i /> {report.state}</small><Download size={14} /></button>)}</div>
          </Panel>
        </main>

        <aside className="right-dock">
          <Panel title="KISA YOLLAR" code="MODULES" actions={false} className="shortcut-panel">
            <button onClick={() => selectView("PROFILE")}><UserRound size={16} /><span>ANALİST<br />PROFİLİ</span><ArrowUpRight size={13} /></button>
            <button onClick={() => selectView("RESEARCH")}><BookOpen size={16} /><span>RAPOR<br />KÜTÜPHANESİ</span><ArrowUpRight size={13} /></button>
            <button onClick={() => selectView("CONTACT")}><Mail size={16} /><span>İLETİŞİM<br />MASASI</span><ArrowUpRight size={13} /></button>
          </Panel>
          <Panel title="ÇALIŞMA DURUMU" code="SESSION" actions={false} className="session-panel"><div className="session-row"><span>OTURUM</span><b><i /> AKTİF</b></div><div className="session-row"><span>VERİ AKIŞI</span><b className="ice-text">SİMÜLE</b></div><div className="session-row"><span>RAPOR KUYRUĞU</span><b>03 BEKLİYOR</b></div><div className="session-note"><Info size={14} /> Bu terminal, kişisel araştırma portfolyosu için tasarlanmış bir arayüzdür.</div></Panel>
        </aside>
      </div>

      <footer className="terminal-statusbar"><span><i /> PİYASA BAĞLANTISI: SİMÜLE</span><span>ANALİZ // PORTFOLIO / ARAŞTIRMA MASASI</span><span><Activity size={11} /> CPU 12% <b>•</b> MEMORY 41%</span></footer>
    </div>
  );
}
