/** Panelden açılabilen site geneli duyuru bandı. Kapalıyken hiç render edilmez. */
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Info, X } from "lucide-react";
import { useContent } from "@/content/ContentContext";
import { useI18n } from "@/i18n";

const TONE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
} as const;

export function SiteBanner() {
  const { banner } = useContent();
  const { language, t } = useI18n();
  const [dismissed, setDismissed] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  const message = banner && !dismissed ? banner.text[language]?.trim() : "";
  const visible = Boolean(message);

  /**
   * Bant sabit konumlu olduğu için altındaki sabit barların ne kadar aşağı
   * kayacağını bilmesi gerekiyor. Yüksekliği ölçüp kök değişkene yazıyoruz;
   * metin sarınca (dar ekranda iki satır) ölçü kendiliğinden güncelleniyor.
   */
  useEffect(() => {
    const root = document.documentElement;
    const element = bannerRef.current;
    if (!visible || !element) {
      root.style.removeProperty("--banner-height");
      return;
    }
    const apply = () => root.style.setProperty("--banner-height", `${element.offsetHeight}px`);
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty("--banner-height");
    };
  }, [visible, message]);

  if (!banner || !visible) return null;

  const Icon = TONE_ICONS[banner.tone];
  const linkLabel = banner.linkLabel?.[language]?.trim();

  return (
    <div ref={bannerRef} className={`site-banner tone-${banner.tone}`} role="status">
      <Icon size={15} className="site-banner-icon" />
      <p>{message}</p>
      {banner.linkUrl && linkLabel && (
        <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="site-banner-link">
          {linkLabel} <ArrowUpRight size={13} />
        </a>
      )}
      <button
        type="button"
        className="site-banner-close"
        onClick={() => setDismissed(true)}
        aria-label={t("common.close")}
      >
        <X size={14} />
      </button>
    </div>
  );
}
