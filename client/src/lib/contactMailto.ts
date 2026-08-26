export function buildContactMailto(recipient: string, subject: string, senderName: string, message: string) {
  const normalizedSubject = subject.trim() || "Portfolio üzerinden iletişim";
  const normalizedSender = senderName.trim() || "İsimsiz ziyaretçi";
  const body = `Merhaba Onur,\n\n${message.trim()}\n\nGönderen: ${normalizedSender}`;
  return `mailto:${recipient}?subject=${encodeURIComponent(normalizedSubject)}&body=${encodeURIComponent(body)}`;
}
