import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Mail,
  Linkedin,
  ExternalLink,
  Copy,
  Check,
  Send,
  FileDown,
  Sparkles,
  Grid2X2,
  Clock,
  ShieldCheck,
  Building2,
  UserRound,
  ArrowUpRight,
  MessageSquareText,
} from "lucide-react";
import { toast } from "sonner";
import { buildContactMailto } from "../lib/contactMailto";
import { gsap, useGSAP } from "../lib/gsap";
import { useI18n, type TranslationKey } from "@/i18n";

interface ContactDeskProps {
  onBack: () => void;
  initialSubject?: string;
}

const EMAIL = "onurinal815@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/onur%C4%B1nal/";
const MEASURE_MOAT_URL = "https://measure-moat.vercel.app/";
const PROFILE_PHOTO = "/media/onur-inal.jpg";

interface QuickTopicDefinition {
  id: string;
  icon: string;
  labelKey: TranslationKey;
  subjectKey: TranslationKey;
  templateKey: TranslationKey;
}

const QUICK_TOPICS: QuickTopicDefinition[] = [
  {
    id: "VALUATION",
    icon: "📊",
    labelKey: "contact.topicValuation",
    subjectKey: "contact.topicValuationSubject",
    templateKey: "contact.topicValuationTemplate",
  },
  {
    id: "EQUITY_REPORT",
    icon: "📑",
    labelKey: "contact.topicEquity",
    subjectKey: "contact.topicEquitySubject",
    templateKey: "contact.topicEquityTemplate",
  },
  {
    id: "CAREER",
    icon: "💼",
    labelKey: "contact.topicCareer",
    subjectKey: "contact.topicCareerSubject",
    templateKey: "contact.topicCareerTemplate",
  },
  {
    id: "GENERAL",
    icon: "🌐",
    labelKey: "contact.topicGeneral",
    subjectKey: "contact.topicGeneralSubject",
    templateKey: "contact.topicGeneralTemplate",
  },
];

export const ContactDesk: React.FC<ContactDeskProps> = ({ onBack, initialSubject }) => {
  const { t, language } = useI18n();
  const [selectedTopicId, setSelectedTopicId] = useState<string>("VALUATION");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState(initialSubject || t(QUICK_TOPICS[0].subjectKey));
  const [message, setMessage] = useState(t(QUICK_TOPICS[0].templateKey));
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Kullanıcı taslağa dokunmadıysa dil değişiminde şablonu yeni dile taşı.
  const appliedTemplate = useRef({
    subject: initialSubject || t(QUICK_TOPICS[0].subjectKey),
    message: t(QUICK_TOPICS[0].templateKey),
  });

  const previousLanguage = useRef(language);

  useEffect(() => {
    if (previousLanguage.current === language) return;
    previousLanguage.current = language;
    const topic = QUICK_TOPICS.find((item) => item.id === selectedTopicId) ?? QUICK_TOPICS[0];
    const nextSubject = t(topic.subjectKey);
    const nextMessage = t(topic.templateKey);
    setSubject((current) => (current === appliedTemplate.current.subject ? nextSubject : current));
    setMessage((current) => (current === appliedTemplate.current.message ? nextMessage : current));
    appliedTemplate.current = { subject: nextSubject, message: nextMessage };
  }, [language, selectedTopicId, t]);

  const handleSelectTopic = (topic: QuickTopicDefinition) => {
    const nextSubject = t(topic.subjectKey);
    const nextMessage = t(topic.templateKey);
    setSelectedTopicId(topic.id);
    setSubject(nextSubject);
    setMessage(nextMessage);
    appliedTemplate.current = { subject: nextSubject, message: nextMessage };
    toast.info(t("contact.toastTemplate", { topic: t(topic.labelKey) }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopiedEmail(true);
    toast.success(t("contact.toastCopied"), {
      description: EMAIL,
    });
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleDownloadCv = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    toast.success(t("toast.cvStarted"), {
      description: filename,
    });
  };

  const mailtoUrl = useMemo(() => {
    const visitor = t("contact.visitor");
    const fullSender = organization.trim()
      ? `${name.trim() || visitor} (${organization.trim()})`
      : name.trim() || visitor;
    const senderNote = senderEmail.trim()
      ? `\n${t("contact.mailContactEmail")}: ${senderEmail.trim()}`
      : "";
    const composedMessage = `${message.trim()}${senderNote}`;
    return buildContactMailto(EMAIL, subject, fullSender, composedMessage, {
      greeting: t("contact.mailGreeting"),
      sender: t("contact.mailSender"),
      fallbackSubject: t("contact.mailFallbackSubject"),
      fallbackSender: t("contact.mailFallbackSender"),
    });
  }, [name, organization, senderEmail, subject, message, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error(t("contact.toastEmptyMessage"));
      return;
    }
    toast.success(t("contact.toastOpening"), {
      description: t("contact.toastOpeningDesc"),
    });
    window.location.href = mailtoUrl;
  };

  const contactContainerRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      if (!contactContainerRef.current) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = gsap.utils.toArray<HTMLElement>(
          ".contact-desk-banner, .contact-sidebar-pane, .contact-composer-pane"
        );
        if (sections.length > 0) {
          gsap.fromTo(
            sections,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              stagger: 0.08,
              ease: "power2.out",
              clearProps: "transform,opacity",
            }
          );
        }
      });

      return () => mm.revert();
    },
    { scope: contactContainerRef }
  );

  return (
    <div ref={contactContainerRef} className="terminal-contact-desk" role="region" aria-label={t("contact.aria")}>
      {/* Top Banner */}
      <div className="contact-desk-banner">
        <div className="contact-banner-meta">
          <div className="contact-banner-kicker">
            <span className="live-dot" />
            <span>{t("contact.kicker")}</span>
            <span className="contact-status-chip">{t("contact.statusChip")}</span>
          </div>
          <h1 className="contact-banner-title">{t("contact.title")}</h1>
          <p className="contact-banner-desc">{t("contact.desc")}</p>
          <div className="contact-meta-strip">
            <div className="meta-strip-item">
              <Clock size={12} className="text-emerald-400" />
              <span>{t("contact.hours")}</span>
            </div>
            <div className="meta-strip-item">
              <Sparkles size={12} className="text-sky-400" />
              <span>{t("contact.responseTime")}</span>
            </div>
          </div>
        </div>

        <div className="contact-banner-actions">
          <button onClick={onBack} className="btn-terminal-secondary">
            <Grid2X2 size={14} /> {t("common.backToDashboard")}
          </button>
          <button onClick={handleCopyEmail} className="btn-terminal-primary">
            {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
            {copiedEmail ? t("contact.copied") : t("contact.copyEmail")}
          </button>
        </div>
      </div>

      {/* Quick Topic Selectors */}
      <div className="contact-topic-selector-card">
        <div className="topic-selector-heading">
          <MessageSquareText size={14} className="text-emerald-400" />
          <span>{t("contact.topicsHeading")}</span>
        </div>
        <div className="topic-chips-row">
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic.id}
              type="button"
              className={`topic-chip ${selectedTopicId === topic.id ? "active" : ""}`}
              onClick={() => handleSelectTopic(topic)}
            >
              <span className="topic-chip-icon">{topic.icon}</span>
              <span className="topic-chip-text">{t(topic.labelKey)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="contact-workspace-grid">
        {/* Left: Interactive Form / Mail Draft Console */}
        <div className="contact-form-card">
          <div className="card-section-header">
            <div className="header-title-group">
              <Mail size={16} className="text-emerald-400" />
              <div>
                <h3>{t("contact.formTitle")}</h3>
                <p>{t("contact.formDesc")}</p>
              </div>
            </div>
            <span className="security-tag">
              <ShieldCheck size={12} />
              {t("contact.privacyTag")}
            </span>
          </div>

          <form className="contact-interactive-form" onSubmit={handleSubmit}>
            <div className="form-fields-row">
              <div className="form-group">
                <label htmlFor="contact-name">
                  <UserRound size={12} /> {t("contact.labelName")}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("contact.placeholderName")}
                  className="contact-text-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-org">
                  <Building2 size={12} /> {t("contact.labelOrg")}
                </label>
                <input
                  id="contact-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder={t("contact.placeholderOrg")}
                  className="contact-text-input"
                />
              </div>
            </div>

            <div className="form-fields-row">
              <div className="form-group">
                <label htmlFor="contact-email">
                  <Mail size={12} /> {t("contact.labelEmail")}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder={t("contact.placeholderEmail")}
                  className="contact-text-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">
                  <Sparkles size={12} /> {t("contact.labelSubject")}
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder={t("contact.placeholderSubject")}
                  className="contact-text-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="textarea-label-row">
                <label htmlFor="contact-message">{t("contact.labelMessage")}</label>
                <span className="char-count">{t("contact.charCount", { count: message.length })}</span>
              </div>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                placeholder={t("contact.placeholderMessage")}
                className="contact-textarea"
              />
            </div>

            <div className="form-action-row">
              <button type="submit" className="btn-submit-mail">
                <Send size={15} />
                {t("contact.submit")}
              </button>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-copy-address"
              >
                {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedEmail ? t("contact.copiedShort") : t("contact.copyAddress")}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Direct Channels & Verified Credentials */}
        <aside className="contact-channels-card">
          {/* Analyst Card */}
          <div className="analyst-badge-card">
            <div className="analyst-avatar-wrapper">
              <img src={PROFILE_PHOTO} alt="Onur İnal" className="analyst-img" />
              <span className="online-indicator" title={t("contact.openTitle")} />
            </div>
            <div className="analyst-info">
              <div className="analyst-title-row">
                <h3>ONUR İNAL</h3>
                <span className="verified-pill">{t("contact.verified")}</span>
              </div>
              <p className="analyst-role">{t("contact.analystRole")}</p>
              <p className="analyst-univ">{t("contact.analystUniversity")}</p>
            </div>
          </div>

          {/* Direct Communication Channels */}
          <div className="direct-channels-list">
            <div className="channel-item-card">
              <div className="channel-icon-box mail-box">
                <Mail size={18} />
              </div>
              <div className="channel-details">
                <span className="channel-label">{t("contact.channelEmail")}</span>
                <b className="channel-value">{EMAIL}</b>
              </div>
              <div className="channel-actions">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="channel-action-btn"
                  title={t("contact.channelEmailCopy")}
                >
                  {copiedEmail ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <a
                  href={`mailto:${EMAIL}`}
                  className="channel-action-btn"
                  title={t("contact.channelEmailSend")}
                >
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className="channel-item-card link-hover"
            >
              <div className="channel-icon-box linkedin-box">
                <Linkedin size={18} />
              </div>
              <div className="channel-details">
                <span className="channel-label">{t("contact.channelLinkedin")}</span>
                <b className="channel-value">linkedin.com/in/onur-inal</b>
              </div>
              <ExternalLink size={14} className="channel-external-icon" />
            </a>

            <a
              href={MEASURE_MOAT_URL}
              target="_blank"
              rel="noreferrer"
              className="channel-item-card link-hover"
            >
              <div className="channel-icon-box moat-box">
                <Sparkles size={18} />
              </div>
              <div className="channel-details">
                <span className="channel-label">{t("contact.channelMoat")}</span>
                <b className="channel-value">measure-moat.vercel.app</b>
              </div>
              <ExternalLink size={14} className="channel-external-icon" />
            </a>
          </div>

          {/* CV Direct Download Hub */}
          <div className="cv-download-hub">
            <div className="cv-hub-title">
              <FileDown size={14} className="text-emerald-400" />
              <span>{t("contact.cvHubTitle")}</span>
            </div>
            <div className="cv-buttons-grid">
              <button
                type="button"
                className="btn-cv-download primary"
                onClick={() =>
                  handleDownloadCv(
                    "/cv/Onur_Inal_CV_TR_Fotografli.pdf",
                    "Onur_Inal_CV_TR_Fotografli.pdf"
                  )
                }
              >
                <FileDown size={13} />
                <span>{t("contact.cvTrPhoto")}</span>
              </button>
              <button
                type="button"
                className="btn-cv-download"
                onClick={() =>
                  handleDownloadCv(
                    "/cv/Onur_Inal_CV_TR_ATS.pdf",
                    "Onur_Inal_CV_TR_ATS.pdf"
                  )
                }
              >
                <FileDown size={13} />
                <span>{t("contact.cvTrAts")}</span>
              </button>
              <button
                type="button"
                className="btn-cv-download"
                onClick={() =>
                  handleDownloadCv(
                    "/cv/Onur_Inal_CV_EN_Fotografli.pdf",
                    "Onur_Inal_CV_EN_Fotografli.pdf"
                  )
                }
              >
                <FileDown size={13} />
                <span>{t("contact.cvEnPhoto")}</span>
              </button>
              <button
                type="button"
                className="btn-cv-download"
                onClick={() =>
                  handleDownloadCv("/cv/Onur_Inal_CV_EN_ATS.pdf", "Onur_Inal_CV_EN_ATS.pdf")
                }
              >
                <FileDown size={13} />
                <span>{t("contact.cvEnAts")}</span>
              </button>
            </div>
          </div>

          {/* Terminal Guarantee Notice */}
          <div className="terminal-guarantee-strip">
            <ShieldCheck size={16} className="text-sky-400 shrink-0" />
            <p>
              <strong>{t("contact.guaranteeTitle")}</strong> {t("contact.guaranteeText")}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
