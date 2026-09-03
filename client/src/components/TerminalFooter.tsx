import React from "react";
import {
  ExternalLink,
  Info,
  Linkedin,
  Mail,
  ShieldAlert,
  Terminal,
} from "lucide-react";

interface TerminalFooterProps {
  onNavigate: (view: "DASHBOARD" | "PROFILE" | "RESEARCH" | "CONTACT") => void;
}

export const TerminalFooter: React.FC<TerminalFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="terminal-master-footer" role="contentinfo" aria-label="Site Bilgileri ve Yasal Uyarı">
      <div className="footer-inner-container">
        {/* Compliance & Yahoo Finance Data Disclaimer Strip */}
        <div className="footer-disclaimer-card">
          <div className="disclaimer-header">
            <div className="disclaimer-title-wrap">
              <ShieldAlert size={15} className="text-amber-400 flex-shrink-0" />
              <b className="disclaimer-title">YASAL UYARI & YAHOO FINANCE VERİ FERAGATNAMESİ</b>
            </div>
            <span className="disclaimer-badge">PORTFOLYO DEMO · TİCARİ AMAÇLI DEĞİLDİR</span>
          </div>
          <p className="disclaimer-text">
            Bu web sitesi <strong>Onur İnal</strong>’ın kişisel finansal analiz, hisse senedi değerleme, finansal modelleme
            ve terminal arayüz tasarım portfolyosudur. Sitede yer alan anlık hisse fiyatları, mum grafikleri, bilanço rasyoları
            ve piyasa göstergeleri <strong>Yahoo Finance</strong> açık veri servisleri üzerinden yalnızca görselleştirme,
            eğitim ve arayüz prototipleme amacıyla çekilmektedir. Bu platformdaki veriler ticari bir faaliyet için kullanılamaz;
            Sermaye Piyasası Kurulu (SPK) mevzuatı kapsamında <strong>yatırım danışmanlığı, portföy yönetimi veya alım-satım tavsiyesi
            (Yatırım Tavsiyesi Değildir - YTD)</strong> niteliği taşımaz.
          </p>
        </div>

        {/* 4-Column Terminal Navigation & Identity Grid */}
        <div className="footer-bottom-grid">
          {/* Col 1: Identity */}
          <div className="footer-brand-col">
            <div className="footer-brand-title">
              <Terminal size={16} className="text-emerald-400 flex-shrink-0" />
              <span>ONUR İNAL</span>
            </div>
            <p className="footer-brand-tagline">
              Finansal Analist · Sermaye Piyasaları & Hisse Senedi Araştırma Masası
            </p>
            <small className="footer-brand-sub">
              Afyon Kocatepe Üniversitesi · Uluslararası Ticaret ve Finansman & İktisat (Çift Ana Dal)
            </small>
          </div>

          {/* Col 2: Internal Navigation */}
          <div className="footer-nav-col">
            <span className="footer-nav-heading">TERMİNAL MODÜLLERİ</span>
            <div className="footer-nav-links">
              <button onClick={() => onNavigate("DASHBOARD")} className="footer-link-btn">
                Canlı Terminal Panosu
              </button>
              <button onClick={() => onNavigate("RESEARCH")} className="footer-link-btn">
                Araştırma Raporları Kütüphanesi
              </button>
              <button onClick={() => onNavigate("PROFILE")} className="footer-link-btn">
                Analist Profili & Yetkinlikler
              </button>
              <button onClick={() => onNavigate("CONTACT")} className="footer-link-btn">
                İletişim & Finansal Model Talebi
              </button>
            </div>
          </div>

          {/* Col 3: External Projects & Network */}
          <div className="footer-external-col">
            <span className="footer-nav-heading">PROJELER & AĞ</span>
            <div className="footer-external-links">
              <a
                href="https://measure-moat.vercel.app/#roadmap"
                target="_blank"
                rel="noreferrer"
                className="footer-ext-link"
              >
                <ExternalLink size={13} />
                <span>Measure Moat Platformu</span>
              </a>
              <a
                href="https://www.linkedin.com/in/onur-inal-5b72182b8/"
                target="_blank"
                rel="noreferrer"
                className="footer-ext-link"
              >
                <Linkedin size={13} />
                <span>LinkedIn / Onur İnal</span>
              </a>
              <a
                href="mailto:onurinal815@gmail.com"
                className="footer-ext-link"
              >
                <Mail size={13} />
                <span>onurinal815@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Col 4: System & Status */}
          <div className="footer-system-col">
            <span className="footer-nav-heading">SİSTEM & DURUM</span>
            <div className="system-status-list">
              <div className="system-row">
                <span className="dot online" />
                <span>Yahoo Finance API: Aktif</span>
              </div>
              <div className="system-row">
                <span className="dot online" />
                <span>Veri Akışı: Canlı / Gecikmeli Demo</span>
              </div>
              <div className="system-row">
                <span className="system-ver-badge">v1.0.4 PROD</span>
                <span className="text-slate-400 font-mono text-xs">© 2025 Onur İnal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution bar */}
        <div className="footer-copyright-strip">
          <span>© 2025 Onur İnal. Tüm hakları saklıdır.</span>
          <span className="footer-dot-divider">·</span>
          <span>BIST & Küresel Finansal Terminal & Araştırma Portfolyosu</span>
          <span className="footer-dot-divider">·</span>
          <span>Tasarım ve Modelleme Amaçlıdır (Ticari Değildir)</span>
        </div>
      </div>
    </footer>
  );
};
