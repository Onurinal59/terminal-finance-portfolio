import React, { useState, useMemo } from "react";
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

interface ContactDeskProps {
  onBack: () => void;
  initialSubject?: string;
}

const EMAIL = "onurinal815@gmail.com";
const LINKEDIN_URL = "https://www.linkedin.com/in/onur%C4%B1nal/";
const MEASURE_MOAT_URL = "https://measure-moat.vercel.app/";
const PROFILE_PHOTO = "/media/onur-inal.jpg";

const QUICK_TOPICS = [
  {
    id: "VALUATION",
    label: "Şirket Değerleme & DCF",
    icon: "📊",
    subject: "Şirket Değerleme & Finansal Modelleme Talebi",
    template: "Merhaba Onur,\n\nŞirket değerleme analizi (DCF / Çarpan Analizi / ROIC) ve finansal modelleme çalışması hakkında bilgi almak istiyorum:\n\n- Şirket / Sektör: \n- İlgili Metrikler: \n- Zaman Planı: \n\nİyi çalışmalar.",
  },
  {
    id: "EQUITY_REPORT",
    label: "Özsermaye Raporu",
    icon: "📑",
    subject: "Özsermaye Araştırma Raporu Talebi",
    template: "Merhaba Onur,\n\nAraştırma kütüphanendeki raporlar ve sektör incelemeleri hakkında detaylı bilgi almak istiyorum:\n\n- Odak Şirket / Ticker: \n- İnceleme Konusu: \n\nTeşekkürler.",
  },
  {
    id: "CAREER",
    label: "Kariyer & İş Birliği",
    icon: "💼",
    subject: "Kurumsal Finans & Kariyer İş Birliği",
    template: "Merhaba Onur,\n\nFinans / Değerleme analistliği ve kurumsal finans projeleri kapsamında seninle iletişime geçmek istedim:\n\n- Kurum / Şirket: \n- Pozisyon / İş Birliği Kapsamı: \n\nGörüşmek üzere.",
  },
  {
    id: "GENERAL",
    label: "Piyasa Fikir Alışverişi",
    icon: "🌐",
    subject: "BIST & Makroekonomi Fikir Alışverişi",
    template: "Merhaba Onur,\n\nSermaye piyasaları ve terminaldeki makro göstergeler hakkında görüşlerini merak ettiğim bir konu var:\n\n- Konu: \n\nİyi çalışmalar dilerim.",
  },
];

export const ContactDesk: React.FC<ContactDeskProps> = ({ onBack, initialSubject }) => {
  const [selectedTopicId, setSelectedTopicId] = useState<string>("VALUATION");
  const [name, setName] = useState("");
  const [organization, setOrganization] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [subject, setSubject] = useState(
    initialSubject || QUICK_TOPICS[0].subject
  );
  const [message, setMessage] = useState(QUICK_TOPICS[0].template);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleSelectTopic = (topic: typeof QUICK_TOPICS[number]) => {
    setSelectedTopicId(topic.id);
    setSubject(topic.subject);
    setMessage(topic.template);
    toast.info(`"${topic.label}" şablonu yüklendi.`);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(EMAIL);
    setCopiedEmail(true);
    toast.success("E-posta adresi panoya kopyalandı!", {
      description: EMAIL,
    });
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleDownloadCv = (href: string, filename: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    toast.success("CV indirmesi başlatıldı.", {
      description: filename,
    });
  };

  const mailtoUrl = useMemo(() => {
    const fullSender = organization.trim()
      ? `${name.trim() || "Ziyaretçi"} (${organization.trim()})`
      : name.trim() || "Ziyaretçi";
    const senderNote = senderEmail.trim() ? `\nİletişim E-postası: ${senderEmail.trim()}` : "";
    const composedMessage = `${message.trim()}${senderNote}`;
    return buildContactMailto(EMAIL, subject, fullSender, composedMessage);
  }, [name, organization, senderEmail, subject, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Lütfen mesaj alanını doldurunuz.");
      return;
    }
    toast.success("E-posta istemciniz açılıyor...", {
      description: "Taslak doğrudan e-posta uygulamanıza aktarıldı.",
    });
    window.location.href = mailtoUrl;
  };

  return (
    <div className="terminal-contact-desk" role="region" aria-label="İletişim Masası">
      {/* Top Banner */}
      <div className="contact-desk-banner">
        <div className="contact-banner-meta">
          <div className="contact-banner-kicker">
            <span className="live-dot" />
            <span>ONUR İNAL // SERMAYE PİYASALARI & ARAŞTIRMA MASASI</span>
            <span className="contact-status-chip">DOĞRUDAN BAĞLANTI</span>
          </div>
          <h1 className="contact-banner-title">
            Finansal Analiz, Değerleme & İş Birliği Bağlantı Masası
          </h1>
          <p className="contact-banner-desc">
            Hisse senedi değerleme modelleri (DCF), ekonomik hendek analizleri (Moat),
            kurumsal finans projeleri veya araştırma ortaklıkları için doğrudan iletişime geçin.
          </p>
          <div className="contact-meta-strip">
            <div className="meta-strip-item">
              <Clock size={12} className="text-emerald-400" />
              <span>Çalışma Saatleri: 09:00 — 18:30 TSİ (UTC+3 İstanbul)</span>
            </div>
            <div className="meta-strip-item">
              <Sparkles size={12} className="text-sky-400" />
              <span>Ortalama Yanıt Süresi: &lt; 24 Saat</span>
            </div>
          </div>
        </div>

        <div className="contact-banner-actions">
          <button onClick={onBack} className="btn-terminal-secondary">
            <Grid2X2 size={14} /> PANOYA DÖN
          </button>
          <button onClick={handleCopyEmail} className="btn-terminal-primary">
            {copiedEmail ? <Check size={14} /> : <Copy size={14} />}
            {copiedEmail ? "KOPYALANDI!" : "E-POSTAYI KOPYALA"}
          </button>
        </div>
      </div>

      {/* Quick Topic Selectors */}
      <div className="contact-topic-selector-card">
        <div className="topic-selector-heading">
          <MessageSquareText size={14} className="text-emerald-400" />
          <span>HIZLI İLETİŞİM KONULARI (ŞABLON SEÇİN)</span>
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
              <span className="topic-chip-text">{topic.label}</span>
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
                <h3>MESAJ TASLAK KONSOLU</h3>
                <p>Formu doldurup butona bastığınızda e-posta uygulamanızda hazır taslak açılır.</p>
              </div>
            </div>
            <span className="security-tag">
              <ShieldCheck size={12} />
              GİZLİLİK GÜVENLİ
            </span>
          </div>

          <form className="contact-interactive-form" onSubmit={handleSubmit}>
            <div className="form-fields-row">
              <div className="form-group">
                <label htmlFor="contact-name">
                  <UserRound size={12} /> AD SOYAD
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Mehmet Yılmaz"
                  className="contact-text-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-org">
                  <Building2 size={12} /> KURUM / FİRMA (İSTEĞE BAĞLI)
                </label>
                <input
                  id="contact-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Örn: Yatırım Ortaklığı / Üniversite"
                  className="contact-text-input"
                />
              </div>
            </div>

            <div className="form-fields-row">
              <div className="form-group">
                <label htmlFor="contact-email">
                  <Mail size={12} /> E-POSTA ADRESİNİZ (GERİ DÖNÜŞ İÇİN)
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="Örn: mehmet@sirket.com"
                  className="contact-text-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact-subject">
                  <Sparkles size={12} /> KONU
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="Mesaj konusu"
                  className="contact-text-input"
                />
              </div>
            </div>

            <div className="form-group">
              <div className="textarea-label-row">
                <label htmlFor="contact-message">MESAJ METNİ</label>
                <span className="char-count">{message.length} karakter</span>
              </div>
              <textarea
                id="contact-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                required
                placeholder="Mesajınızı detaylı şekilde yazabilirsiniz..."
                className="contact-textarea"
              />
            </div>

            <div className="form-action-row">
              <button type="submit" className="btn-submit-mail">
                <Send size={15} />
                E-POSTA İSTEMCİSİNİ AÇ (TASLAK OLUŞTUR)
              </button>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-copy-address"
              >
                {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copiedEmail ? "Kopyalandı" : "E-postayı Kopyala"}
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
              <span className="online-indicator" title="İletişime Açık" />
            </div>
            <div className="analyst-info">
              <div className="analyst-title-row">
                <h3>ONUR İNAL</h3>
                <span className="verified-pill">DOĞRULANMIŞ PROFİL</span>
              </div>
              <p className="analyst-role">Finans · Değerleme · Piyasa Araştırmacısı</p>
              <p className="analyst-univ">
                Afyon Kocatepe Üniversitesi · Uluslararası Ticaret ve Finansman & İktisat (Çift Ana Dal)
              </p>
            </div>
          </div>

          {/* Direct Communication Channels */}
          <div className="direct-channels-list">
            <div className="channel-item-card">
              <div className="channel-icon-box mail-box">
                <Mail size={18} />
              </div>
              <div className="channel-details">
                <span className="channel-label">RESMİ E-POSTA</span>
                <b className="channel-value">{EMAIL}</b>
              </div>
              <div className="channel-actions">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="channel-action-btn"
                  title="E-postayı Kopyala"
                >
                  {copiedEmail ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <a
                  href={`mailto:${EMAIL}`}
                  className="channel-action-btn"
                  title="Doğrudan E-posta Gönder"
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
                <span className="channel-label">LINKEDIN PROFİLİ</span>
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
                <span className="channel-label">MEASURE MOAT MODELLEMESİ</span>
                <b className="channel-value">measure-moat.vercel.app</b>
              </div>
              <ExternalLink size={14} className="channel-external-icon" />
            </a>
          </div>

          {/* CV Direct Download Hub */}
          <div className="cv-download-hub">
            <div className="cv-hub-title">
              <FileDown size={14} className="text-emerald-400" />
              <span>GÜNCEL ÖZGEÇMİŞ & CV (DOĞRUDAN İNDİR)</span>
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
                <span>Türkçe CV (Fotoğraflı)</span>
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
                <span>Türkçe CV (ATS / Sade)</span>
              </button>
            </div>
          </div>

          {/* Terminal Guarantee Notice */}
          <div className="terminal-guarantee-strip">
            <ShieldCheck size={16} className="text-sky-400 shrink-0" />
            <p>
              <strong>Veri Güvenliği:</strong> Form verileriniz sunucumuzda kaydedilmez.
              "E-Posta İstemcisini Aç" butonu yerel e-posta yazılımınızda şifreli ve doğrudan bir
              taslak oluşturur.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
