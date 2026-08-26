/**
 * Piyasa Odası: Koyu terminal yüzeyi, asimetrik bilgi hiyerarşisi,
 * Space Grotesk + Manrope + IBM Plex Mono ve #78F27B sinyal vurgusu.
 */
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Download,
  FileText,
  Linkedin,
  Mail,
  Menu,
  MoveUpRight,
  PanelTopClose,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

const marketTape = [
  { code: "BIST 100", value: "10.842,17", change: "+0,84%", positive: true },
  { code: "USD/TRY", value: "41,0281", change: "+0,12%", positive: true },
  { code: "XAU/USD", value: "3.382,40", change: "-0,31%", positive: false },
  { code: "EUR/TRY", value: "44,9520", change: "+0,08%", positive: true },
  { code: "BRENT", value: "68,13", change: "-0,42%", positive: false },
];

const reports = [
  {
    id: "R-01",
    type: "EQUITY RESEARCH",
    title: "BIST 30 Şirket Analizi",
    detail: "Çarpan analizi · finansal performans · değerleme yaklaşımı",
    date: "Rapor eklenecek",
    accent: "positive",
  },
  {
    id: "R-02",
    type: "MACRO NOTE",
    title: "Türkiye Makro Görünüm",
    detail: "Enflasyon · faiz patikası · büyüme varsayımları",
    date: "Rapor eklenecek",
    accent: "neutral",
  },
  {
    id: "R-03",
    type: "SECTOR NOTE",
    title: "Bankacılık Sektör Notu",
    detail: "Aktif kalitesi · marj dinamikleri · risk görünümü",
    date: "Rapor eklenecek",
    accent: "risk",
  },
];

const sections = [
  { id: "home", label: "BAŞLANGIÇ" },
  { id: "about", label: "HAKKIMDA" },
  { id: "reports", label: "RAPORLAR" },
  { id: "cv", label: "CV" },
  { id: "contact", label: "İLETİŞİM" },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const current = entries.find((entry) => entry.isIntersecting);
        if (current?.target.id) setActiveSection(current.target.id);
      },
      { rootMargin: "-38% 0px -48% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const target = document.getElementById(id);
      if (target) observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  const chooseNavigation = (id: string) => {
    setMenuOpen(false);
    scrollToSection(id);
  };

  const showMissingDocument = (documentName: string) => {
    toast.message(`${documentName} henüz yayına alınmadı.`, {
      description: "PDF dosyası eklendiğinde buradan doğrudan açılacak.",
    });
  };

  return (
    <div className="terminal-shell">
      <a className="skip-link" href="#content">Ana içeriğe atla</a>

      <div className="market-tape" aria-label="Örnek piyasa bandı">
        <div className="tape-prefix">
          <span className="tape-dot" />
          <span>MARKET FEED</span>
          <span className="tape-status">SIMULATED</span>
        </div>
        <div className="tape-window">
          <div className="tape-track">
            {[...marketTape, ...marketTape].map((item, index) => (
              <div className="ticker-item" key={`${item.code}-${index}`}>
                <span className="ticker-code">{item.code}</span>
                <span className="ticker-value">{item.value}</span>
                <span className={item.positive ? "ticker-change up" : "ticker-change down"}>
                  {item.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
        <span className="tape-time">TR / UTC+3</span>
      </div>

      <header className="site-header">
        <button className="brand-lockup" onClick={() => chooseNavigation("home")} aria-label="Sayfanın başına dön">
          <img src="/manus-storage/signal-mark_223452c1.png" alt="" className="brand-mark-source" />
          <span className="signal-mark-shape" aria-hidden="true"><i /><i /><i /><b /></span>
          <span className="brand-copy">
            <b>ANALİZ</b>
            <i>// PORTFOLIO</i>
          </span>
        </button>

        <nav className="desktop-nav" aria-label="Ana navigasyon">
          {sections.slice(1).map((section) => (
            <button
              type="button"
              className={activeSection === section.id ? "nav-link is-active" : "nav-link"}
              onClick={() => chooseNavigation(section.id)}
              key={section.id}
            >
              {section.label}
            </button>
          ))}
        </nav>

        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-nav">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
          <span>MENÜ</span>
        </button>

        <div id="mobile-nav" className={menuOpen ? "mobile-nav open" : "mobile-nav"}>
          {sections.map((section, index) => (
            <button onClick={() => chooseNavigation(section.id)} key={section.id}>
              <span>0{index + 1}</span>{section.label}
            </button>
          ))}
        </div>
      </header>

      <aside className="section-rail" aria-label="Bölüm indisi">
        <span className="rail-orientation">INDEX / 2026</span>
        <div className="rail-line" />
        {sections.map((section, index) => (
          <button
            key={section.id}
            className={activeSection === section.id ? "rail-node is-active" : "rail-node"}
            onClick={() => chooseNavigation(section.id)}
            aria-label={section.label}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <i />
          </button>
        ))}
      </aside>

      <main id="content">
        <section id="home" className="hero-section section-anchor">
          <div className="hero-image" />
          <div className="hero-grid" />
          <div className="hero-left-corner">TERMINAL / 01</div>
          <div className="hero-content">
            <div className="eyebrow live-eyebrow"><span className="pulse-dot" /> ARAŞTIRMA ARAYÜZÜ / AKTİF</div>
            <p className="hero-kicker">FİNANS ÖĞRENCİSİ <span>—</span> BAĞIMSIZ ANALİST</p>
            <h1>Veriyi izlemek değil,<br /><em>tez kurmak.</em></h1>
            <p className="hero-description">
              Şirket hikâyelerini, makro değişkenleri ve piyasa sinyallerini; daha şeffaf, daha sorgulanabilir finansal analizlere dönüştürüyorum.
            </p>
            <div className="hero-actions">
              <button className="signal-button" onClick={() => chooseNavigation("reports")}>
                <FileText size={16} /> RAPOR ARŞİVİNİ AÇ <ArrowDownRight size={16} />
              </button>
              <button className="text-button" onClick={() => chooseNavigation("about")}>
                YAKLAŞIMIMI İNCELE <MoveUpRight size={15} />
              </button>
            </div>
          </div>
          <div className="hero-terminal-panel">
            <div className="panel-heading"><span>ANALYST SNAPSHOT</span><PanelTopClose size={14} /></div>
            <div className="snapshot-name">ADIN SOYADIN</div>
            <p>Finans · Değerleme · Piyasa Araştırması</p>
            <div className="snapshot-divider" />
            <div className="snapshot-grid">
              <span>FOCUS</span><b>TR MARKETS</b>
              <span>STATUS</span><b className="positive-text">OPEN TO WORK</b>
              <span>LAST NOTE</span><b>2026 / Q3</b>
            </div>
          </div>
          <button className="scroll-cue" onClick={() => chooseNavigation("about")} aria-label="Hakkımda bölümüne in">
            <span>SCROLL TO EXPLORE</span><ArrowDownRight size={16} />
          </button>
        </section>

        <section id="about" className="about-section section-anchor">
          <div className="section-index"><span>02</span><i /> HAKKIMDA / RESEARCH DESK</div>
          <div className="about-layout">
            <div className="about-copy">
              <p className="eyebrow">KİŞİSEL PROFİL</p>
              <h2>Kararların arkasındaki<br /><em>varsayımları</em> arıyorum.</h2>
              <p className="lead-copy">
                Finans eğitimimi; bilanço okuma, sektör dinamiklerini çözümleme ve her sonucu net bir yatırım teziyle ilişkilendirme disipliniyle tamamlıyorum.
              </p>
              <p className="body-copy">
                Bu alanı kendi deneyimin, okulun, stajların ve uzmanlaşmak istediğin yön ile güncelle. Amaç, yalnızca ne yaptığını değil; finansal problemleri nasıl düşündüğünü görünür kılmak.
              </p>
              <div className="method-list">
                <div><span>01</span><b>Şirket Analizi</b><small>Temel performans, çarpanlar, katalizörler</small></div>
                <div><span>02</span><b>Makro Okuma</b><small>Politika, akışlar, piyasa fiyatlaması</small></div>
                <div><span>03</span><b>Tez Tasarımı</b><small>Senaryo, risk, değerleme disiplini</small></div>
              </div>
            </div>
            <div className="about-visual">
              <img src="/manus-storage/research-analysis-art_821b7255.png" alt="Soyut finans araştırması masa kompozisyonu" />
              <div className="visual-caption"><span>FIELD NOTE / 26</span><b>FROM INPUT TO INSIGHT</b></div>
              <div className="visual-marker marker-one">β</div>
              <div className="visual-marker marker-two">Δ</div>
            </div>
          </div>
          <div className="metrics-row" aria-label="Profil göstergeleri">
            <div><span>ODAK ALANI</span><b>Finansal<br />Analiz</b></div>
            <div><span>ÇALIŞMA ŞEKLİ</span><b>Veri +<br />Bağlam</b></div>
            <div><span>YAYIN FORMATI</span><b>PDF<br />Raporlar</b></div>
            <div className="metric-quote"><Sparkles size={18} /><p>“İyi bir model, iyi bir sorudan başlar.”</p></div>
          </div>
        </section>

        <section id="reports" className="reports-section section-anchor">
          <div className="reports-heading">
            <div>
              <div className="section-index"><span>03</span><i /> YAYIN MERKEZİ / ARCHIVE</div>
              <h2>Analiz <em>arşivi.</em></h2>
            </div>
            <p>Burada yayınlayacağın finansal analiz raporlarını PDF formatında sergileyebilir; her rapor için kısa yatırım tezi, tarih ve kapsam bilgisini ekleyebilirsin.</p>
          </div>
          <div className="reports-stage">
            <div className="report-art">
              <img src="/manus-storage/report-library-art_09482083.png" alt="Koyu yüzeyde finansal araştırma dosyaları" />
              <div className="report-art-overlay"><span>DATABASE</span><b>RESEARCH<br />LIBRARY</b></div>
            </div>
            <div className="report-list">
              {reports.map((report) => (
                <article className="report-row" key={report.id}>
                  <div className={`report-signal ${report.accent}`} />
                  <div className="report-id"><span>{report.id}</span><small>{report.type}</small></div>
                  <div className="report-title"><h3>{report.title}</h3><p>{report.detail}</p></div>
                  <div className="report-meta"><span>{report.date}</span><button type="button" onClick={() => showMissingDocument(report.title)} aria-label={`${report.title} için PDF durumu`}><Download size={16} /><i>PDF</i></button></div>
                </article>
              ))}
              <div className="archive-note"><FileText size={16} /> ARCHIVE STATE: QUEUED — PDF bağlantısı eklendiğinde rapor, ayrı sekmede açılacak.</div>
            </div>
          </div>
        </section>

        <section id="cv" className="cv-section section-anchor">
          <div className="cv-grid-pattern" />
          <div className="cv-content">
            <div className="section-index"><span>04</span><i /> PROFİL DOSYASI / CV</div>
            <h2>Özgeçmişin,<br /><em>tek dosyada.</em></h2>
            <p>MODULE 04 / Eğitim, staj, teknik yetkinlik ve proje deneyimlerini içeren güncel CV PDF’i bu noktadan sunulacak.</p>
            <div className="cv-actions">
              <button type="button" className="cv-download" onClick={() => showMissingDocument("CV dosyası")}><BriefcaseBusiness size={17} /> STATE: CV FILE / PENDING <Download size={17} /></button>
              <span>FILE ACCESS: PDF yüklendiğinde doğrudan indirilebilir.</span>
            </div>
          </div>
          <div className="cv-file-card">
            <div className="file-top"><span>CURRICULUM_VITAE.PDF</span><span>MODULE_04</span></div>
            <div className="file-body"><FileText size={44} strokeWidth={1.2} /><b>PROFILE<br />DOCUMENT</b></div>
            <div className="file-bottom"><span>STATE</span><b>AWAITING FILE</b></div>
          </div>
        </section>

        <section id="contact" className="contact-section section-anchor">
          <div className="contact-terminal-line"><span>05 /</span> BAĞLANTI NOKTASI <i /></div>
          <div className="contact-layout">
            <div>
              <p className="eyebrow">İLETİŞİM</p>
              <h2>Yeni bir fikri<br /><em>masaya yatıralım.</em></h2>
            </div>
            <div className="contact-card">
              <p>Raporlar, staj/iş fırsatları veya ortak bir araştırma fikri için e-posta ile ulaşabilirsin.</p>
              <a className="mail-link" href="mailto:eposta@adresin.com?subject=Portfolio%20üzerinden%20iletişim">
                <Mail size={19} /> eposta@adresin.com <Send size={17} />
              </a>
              <span className="placeholder-hint">Bu adres, senin gerçek e-posta adresin ile güncellenecek.</span>
              <a className="linkedin-link" href="https://www.linkedin.com" target="_blank" rel="noreferrer"><Linkedin size={15} /> LINKEDIN PROFİLİ <MoveUpRight size={14} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand"><img src="/manus-storage/signal-mark_223452c1.png" alt="" className="brand-mark-source" /><span className="signal-mark-shape" aria-hidden="true"><i /><i /><i /><b /></span><span>ANALİZ // PORTFOLIO</span></div>
        <p>BU PORTFOLIO, KİŞİSEL FİNANS ARAŞTIRMALARINI YAYINLAMAK İÇİN TASARLANDI.</p>
        <span>© 2026 / ALL SIGNALS RESERVED</span>
      </footer>
    </div>
  );
}
