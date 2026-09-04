import React from "react";
import {
  ExternalLink,
  Linkedin,
  Mail,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useContent } from "@/content/ContentContext";

interface TerminalFooterProps {
  onNavigate: (view: "DASHBOARD" | "PROFILE" | "RESEARCH" | "CONTACT") => void;
}

export const TerminalFooter: React.FC<TerminalFooterProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const { links } = useContent();

  return (
    <footer className="terminal-master-footer" role="contentinfo" aria-label={t("footer.aria")}>
      <div className="footer-inner-container">
        {/* Compliance & Yahoo Finance Data Disclaimer Strip */}
        <div className="footer-disclaimer-card">
          <div className="disclaimer-header">
            <div className="disclaimer-title-wrap">
              <ShieldAlert size={15} className="text-amber-400 flex-shrink-0" />
              <b className="disclaimer-title">{t("footer.disclaimerTitle")}</b>
            </div>
            <span className="disclaimer-badge">{t("footer.disclaimerBadge")}</span>
          </div>
          {/* Metin içinde yalnızca sözlükten gelen <strong> vurguları bulunur. */}
          <p
            className="disclaimer-text"
            dangerouslySetInnerHTML={{ __html: t("footer.disclaimerText") }}
          />
        </div>

        {/* 4-Column Terminal Navigation & Identity Grid */}
        <div className="footer-bottom-grid">
          {/* Col 1: Identity */}
          <div className="footer-brand-col">
            <div className="footer-brand-title">
              <Terminal size={16} className="text-emerald-400 flex-shrink-0" />
              <span>ONUR İNAL</span>
            </div>
            <p className="footer-brand-tagline">{t("footer.tagline")}</p>
            <small className="footer-brand-sub">{t("footer.brandSub")}</small>
          </div>

          {/* Col 2: Internal Navigation */}
          <div className="footer-nav-col">
            <span className="footer-nav-heading">{t("footer.navHeading")}</span>
            <div className="footer-nav-links">
              <button onClick={() => onNavigate("DASHBOARD")} className="footer-link-btn">
                {t("footer.navDashboard")}
              </button>
              <button onClick={() => onNavigate("RESEARCH")} className="footer-link-btn">
                {t("footer.navResearch")}
              </button>
              <button onClick={() => onNavigate("PROFILE")} className="footer-link-btn">
                {t("footer.navProfile")}
              </button>
              <button onClick={() => onNavigate("CONTACT")} className="footer-link-btn">
                {t("footer.navContact")}
              </button>
            </div>
          </div>

          {/* Col 3: External Projects & Network */}
          <div className="footer-external-col">
            <span className="footer-nav-heading">{t("footer.externalHeading")}</span>
            <div className="footer-external-links">
              <a
                href={links.measureMoat}
                target="_blank"
                rel="noreferrer"
                className="footer-ext-link"
              >
                <ExternalLink size={13} />
                <span>{t("footer.externalMoat")}</span>
              </a>
              <a
                href={links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="footer-ext-link"
              >
                <Linkedin size={13} />
                <span>{t("footer.externalLinkedin")}</span>
              </a>
              <a
                href={`mailto:${links.email}`}
                className="footer-ext-link"
              >
                <Mail size={13} />
                <span>{links.email}</span>
              </a>
            </div>
          </div>

          {/* Col 4: System & Status */}
          <div className="footer-system-col">
            <span className="footer-nav-heading">{t("footer.systemHeading")}</span>
            <div className="system-status-list">
              <div className="system-row">
                <span className="dot online" />
                <span>{t("footer.systemApi")}</span>
              </div>
              <div className="system-row">
                <span className="dot online" />
                <span>{t("footer.systemFeed")}</span>
              </div>
              <div className="system-row">
                <span className="system-ver-badge">{t("footer.systemVersion")}</span>
                <span className="text-slate-400 font-mono text-xs">{t("footer.copyrightShort")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution bar */}
        <div className="footer-copyright-strip">
          <span>{t("footer.copyright")}</span>
          <span className="footer-dot-divider">·</span>
          <span>{t("footer.scope")}</span>
          <span className="footer-dot-divider">·</span>
          <span>{t("footer.purpose")}</span>
        </div>
      </div>
    </footer>
  );
};
