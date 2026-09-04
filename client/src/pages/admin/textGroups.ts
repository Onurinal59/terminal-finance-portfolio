/**
 * Sözlük anahtarlarının panel haritası.
 *
 * Sitedeki her yazı bir sözlük anahtarı; bu dosya o anahtarları sayfa/bölüm
 * bazında gruplayıp Türkçe adlar verir. Kapsam elle takip edilmiyor: bir
 * anahtar grubu burada tanımlı değilse `textGroups.test.ts` başarısız olur,
 * yani sitede düzenlenemeyen bir metin kalması mümkün değil.
 */
import { tr } from "@/i18n/tr";

export type TextGroup = {
  /** Sözlük anahtarının ilk parçası, örn. "contact". */
  prefix: string;
  title: string;
  description?: string;
};

export type TextArea = {
  id: string;
  title: string;
  description: string;
  groups: TextGroup[];
};

export const TEXT_AREAS: TextArea[] = [
  {
    id: "profile",
    title: "Profil",
    description: "Pano profil kartı, tam profil sayfası ve CV indirme akışı.",
    groups: [
      { prefix: "profile", title: "Pano profil kartı" },
      { prefix: "profileView", title: "Tam profil sayfası" },
      { prefix: "cv", title: "CV indirme akışı", description: "Dosyaları CV bölümünden yüklüyorsun; buradakiler yazılar." },
      { prefix: "archive", title: "Eğitim & araştırma paneli", description: "Panodaki EĞİTİM & ARAŞTIRMA kutusu." },
    ],
  },
  {
    id: "research",
    title: "Raporlar",
    description: "Araştırma kütüphanesi ve dosya okuma ekranı.",
    groups: [{ prefix: "research", title: "Rapor kütüphanesi" }],
  },
  {
    id: "contact",
    title: "İletişim",
    description: "İletişim masası, hızlı konu şablonları ve form yazıları.",
    groups: [{ prefix: "contact", title: "İletişim sayfası" }],
  },
  {
    id: "dashboard",
    title: "Pano",
    description: "Terminal panosundaki tüm modüller ve panel başlıkları.",
    groups: [
      { prefix: "panels", title: "Panel başlıkları" },
      { prefix: "panel", title: "Panel kontrolleri" },
      { prefix: "summary", title: "Piyasa özeti" },
      { prefix: "analysis", title: "Finansal analiz paneli" },
      { prefix: "valuation", title: "Değerleme masası" },
      { prefix: "macro", title: "Makro göstergeler", description: "Değerleri Makro bölümünden yönetiliyor; buradakiler sabit yazılar." },
      { prefix: "hours", title: "Piyasa seansları" },
      { prefix: "watch", title: "İzleme listesi" },
      { prefix: "discovery", title: "Piyasa keşfi" },
      { prefix: "quick", title: "Kısa yollar" },
      { prefix: "workspace", title: "Çalışma alanı çubuğu" },
      { prefix: "modules", title: "Mobil modül listesi" },
      { prefix: "mobileFilter", title: "Mobil filtre sekmeleri" },
      { prefix: "bottomNav", title: "Mobil alt menü" },
    ],
  },
  {
    id: "chart",
    title: "Grafik ve mali tablolar",
    description: "Fiyat grafiği, gelir tablosu, bilanço ve nakit akımı görünümleri.",
    groups: [
      { prefix: "chart", title: "Grafik araç çubuğu" },
      { prefix: "statement", title: "Mali tablo başlıkları" },
      { prefix: "fin", title: "Mali tablo satır adları" },
      { prefix: "category", title: "Varlık kategorileri" },
      { prefix: "kind", title: "Varlık türleri" },
      { prefix: "symbol", title: "Sembol adları" },
    ],
  },
  {
    id: "chrome",
    title: "Üst bar ve arama",
    description: "Sayfanın üstündeki bar, global arama ve bildirimler.",
    groups: [
      { prefix: "chrome", title: "Üst bar" },
      { prefix: "nav", title: "Ana menü" },
      { prefix: "path", title: "Konum çubuğu" },
      { prefix: "search", title: "Global arama" },
      { prefix: "assetType", title: "Arama · varlık türleri" },
      { prefix: "assetFilter", title: "Arama · filtreler" },
      { prefix: "ticker", title: "Kayan şerit" },
      { prefix: "notif", title: "Bildirimler" },
    ],
  },
  {
    id: "site",
    title: "Site geneli",
    description: "Alt bilgi, ortak butonlar, bildirim mesajları ve sayfa başlığı.",
    groups: [
      { prefix: "footer", title: "Alt bilgi" },
      { prefix: "common", title: "Ortak butonlar" },
      { prefix: "toast", title: "Bildirim mesajları" },
      { prefix: "meta", title: "Sayfa başlığı ve açıklaması", description: "Arama motorlarında ve tarayıcı sekmesinde görünür." },
      { prefix: "notFound", title: "404 sayfası" },
    ],
  },
];

/** Panelde tanımlı tüm önekler. */
export const DECLARED_PREFIXES = new Set(TEXT_AREAS.flatMap((area) => area.groups.map((group) => group.prefix)));

/** Sözlükte olup panelde bir gruba düşmeyen önekler. Boş olmalı. */
export function undeclaredPrefixes(): string[] {
  const seen = new Set<string>();
  for (const key of Object.keys(tr)) {
    const prefix = key.split(".")[0];
    if (!DECLARED_PREFIXES.has(prefix)) seen.add(prefix);
  }
  return Array.from(seen).sort();
}

/** Bir öneke ait, sözlükteki sıraya sadık anahtar listesi. */
export function keysForPrefix(prefix: string): string[] {
  return Object.keys(tr).filter((key) => key.split(".")[0] === prefix);
}
