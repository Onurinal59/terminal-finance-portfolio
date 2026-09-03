export interface ContactMailtoLabels {
  /** Mesajın başındaki selamlama satırı. */
  greeting: string;
  /** Gönderen satırının etiketi. */
  sender: string;
  /** Konu boş bırakıldığında kullanılan başlık. */
  fallbackSubject: string;
  /** Ad girilmediğinde kullanılan gönderen adı. */
  fallbackSender: string;
}

const DEFAULT_LABELS: ContactMailtoLabels = {
  greeting: "Merhaba Onur,",
  sender: "Gönderen",
  fallbackSubject: "Portfolio üzerinden iletişim",
  fallbackSender: "İsimsiz ziyaretçi",
};

export function buildContactMailto(
  recipient: string,
  subject: string,
  senderName: string,
  message: string,
  labels: ContactMailtoLabels = DEFAULT_LABELS
) {
  const normalizedSubject = subject.trim() || labels.fallbackSubject;
  const normalizedSender = senderName.trim() || labels.fallbackSender;
  const body = `${labels.greeting}\n\n${message.trim()}\n\n${labels.sender}: ${normalizedSender}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(normalizedSubject)}&body=${encodeURIComponent(body)}`;
}
