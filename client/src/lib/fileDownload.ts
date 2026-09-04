/**
 * Dosya indirme yardımcısı.
 *
 * Sorun: `<a download>` niteliği yalnızca **aynı kaynaktan** gelen dosyalarda
 * çalışır. CV'ler panelden yüklendiğinde Vercel Blob'a (başka bir alan adı)
 * gider; tarayıcı o durumda `download` niteliğini yok sayar ve PDF'i indirmek
 * yerine sekmede açar veya hiçbir şey yapmaz. Kullanıcı bunu "admin panelden
 * değiştirdiğim CV inmiyor" olarak görüyordu.
 *
 * Çözüm sırası:
 *  1. Aynı kaynak → doğrudan `<a download>` (en hızlısı, ağdan tekrar okumaz).
 *  2. Farklı kaynak → dosyayı `fetch` ile alıp `blob:` adresine çevir; bu adres
 *     aynı kaynak sayıldığı için `download` çalışır ve dosya adı bizim
 *     verdiğimiz temiz ad olur.
 *  3. `fetch` engellenirse (CORS, ağ) → Blob'un `?download=1` parametresiyle
 *     yeni sekmede aç; sunucu `content-disposition: attachment` döndürür.
 *  4. O da olmazsa → adrese git. Hiçbir koşulda sessizce başarısız olmaz.
 */

export type DownloadOutcome = "downloaded" | "opened";

/** Bellek sızmasın diye üretilen `blob:` adresleri kısa süre sonra bırakılır. */
const OBJECT_URL_TTL_MS = 60_000;

/** Aynı kaynaktan mı geliyor? Göreli adresler ("/cv/x.pdf") her zaman aynı kaynaktır. */
export function isSameOrigin(url: string, origin: string): boolean {
  try {
    return new URL(url, origin).origin === new URL(origin).origin;
  } catch {
    return false;
  }
}

/**
 * Vercel Blob adreslerinde `?download=1`, sunucunun dosyayı ek olarak
 * göndermesini sağlar. Zaten varsa tekrar eklenmez.
 */
export function withDownloadParam(url: string): string {
  try {
    const parsed = new URL(url, "http://localhost");
    if (parsed.searchParams.has("download")) return url;
    parsed.searchParams.set("download", "1");
    // Göreli adres verildiyse yalnızca yol + sorgu kısmını geri döndür.
    return /^https?:\/\//i.test(url) ? parsed.toString() : `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

/** Gizli bir bağlantıya tıklar. Firefox kopuk düğümde tıklamayı yok saydığı için DOM'a eklenir. */
function clickAnchor(href: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export async function downloadFile(url: string, fileName: string): Promise<DownloadOutcome> {
  if (!url) throw new Error("empty-url");

  const origin = window.location.origin;

  if (isSameOrigin(url, origin)) {
    clickAnchor(url, fileName);
    return "downloaded";
  }

  try {
    const response = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!response.ok) throw new Error(`http-${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    clickAnchor(objectUrl, fileName);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), OBJECT_URL_TTL_MS);
    return "downloaded";
  } catch {
    // CORS kapalıysa ya da ağ koptuysa: dosyayı yine de kullanıcıya ulaştır.
    const fallback = withDownloadParam(url);
    const opened = window.open(fallback, "_blank", "noopener");
    if (!opened) window.location.href = fallback;
    return "opened";
  }
}
