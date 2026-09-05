/**
 * Üç yönlü birleştirme.
 *
 * Panel tek bir JSON belgesini bütün olarak kaydeder ve `revision` sayacı iki
 * kaydetmenin birbirini ezmesini engeller. Ama sayaç, "başka bir yerden
 * güncellenmiş" hatasını gereksiz yere de veriyordu: telefondan bir kayıt
 * yapıp bilgisayarda açık kalan sekmeden kaydetmek, ya da yanıtı kaybolmuş
 * (aslında başarılı) bir kaydetmeden sonra tekrar denemek yetiyordu. Kullanıcı
 * hiçbir şey kaybetmemiş olsa bile sayfayı yenilemek zorunda kalıyordu.
 *
 * Burada üç sürüm karşılaştırılıyor:
 *   base   — panelin açılışta yüklediği belge
 *   mine   — kullanıcının şu anki taslağı
 *   theirs — depoda o an duran belge
 *
 * Bir bölümü yalnızca bir taraf değiştirdiyse çakışma yoktur; o tarafın hâli
 * alınır. Sadece ikisi de aynı bölümü farklı şekilde değiştirdiyse gerçek bir
 * çakışma vardır ve kullanıcıya sorulur.
 */
import type { LocalizedText } from "@shared/siteContent";
import type { WorkingDraft } from "./useDraft";

/** Çakışma mesajlarında kullanılacak Türkçe bölüm adları. */
const SECTION_LABELS: Record<keyof WorkingDraft, string> = {
  translations: "Site metinleri",
  hiddenBlocks: "Görünürlük",
  reports: "Raporlar",
  reportCategories: "Kategoriler",
  macro: "Makro göstergeler",
  sessions: "Piyasa seansları",
  watchlist: "İzleme listesi",
  cv: "CV dosyaları",
  media: "Görseller",
  links: "Bağlantılar",
  notices: "Uyarılar",
  seo: "Sayfa başlığı",
};

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export type MergeResult = {
  merged: WorkingDraft;
  /** Çakışan bölümlerin Türkçe adları. Boşsa birleştirme temiz. */
  conflicts: string[];
  /** Depodan alınıp taslağa eklenen bölümlerin adları; kullanıcıya bilgi olarak. */
  adopted: string[];
};

/**
 * Metin sözlüğü anahtar bazında birleşir: aynı anahtarı iki taraf da farklı
 * yazmadıkça çakışma olmaz. Böylece "profil metnini telefondan, rapor metnini
 * bilgisayardan değiştirdim" durumu sorunsuz birleşir.
 */
function mergeTranslations(
  base: Record<string, LocalizedText>,
  mine: Record<string, LocalizedText>,
  theirs: Record<string, LocalizedText>
): { merged: Record<string, LocalizedText>; conflict: boolean; adopted: boolean } {
  const keys = Array.from(new Set([...Object.keys(base), ...Object.keys(mine), ...Object.keys(theirs)]));
  const merged: Record<string, LocalizedText> = {};
  let conflict = false;
  let adopted = false;

  for (const key of keys) {
    const b = base[key];
    const m = mine[key];
    const t = theirs[key];

    if (same(m, t)) {
      // İki taraf da aynı sonuca varmış (ya da ikisi de dokunmamış).
      if (m !== undefined) merged[key] = m;
      continue;
    }
    if (same(m, b)) {
      // Ben dokunmadım; depodaki hâli al.
      if (t !== undefined) merged[key] = t;
      adopted = true;
      continue;
    }
    if (same(t, b)) {
      // Depo dokunmamış; benim hâlim geçerli.
      if (m !== undefined) merged[key] = m;
      continue;
    }
    // İkisi de değiştirmiş ve farklılar: benimkini tutup çakışmayı bildiriyoruz.
    if (m !== undefined) merged[key] = m;
    conflict = true;
  }

  return { merged, conflict, adopted };
}

export function mergeDrafts(base: WorkingDraft, mine: WorkingDraft, theirs: WorkingDraft): MergeResult {
  const merged = { ...mine } as WorkingDraft;
  const conflicts: string[] = [];
  const adopted: string[] = [];

  for (const key of Object.keys(SECTION_LABELS) as Array<keyof WorkingDraft>) {
    if (key === "translations") {
      const result = mergeTranslations(base.translations, mine.translations, theirs.translations);
      merged.translations = result.merged;
      if (result.conflict) conflicts.push(SECTION_LABELS.translations);
      else if (result.adopted) adopted.push(SECTION_LABELS.translations);
      continue;
    }

    const b = base[key];
    const m = mine[key];
    const t = theirs[key];

    if (same(m, t)) continue;
    if (same(m, b)) {
      // Bu bölüme ben dokunmadım; depodaki yeni hâli alıyorum.
      (merged[key] as unknown) = t;
      adopted.push(SECTION_LABELS[key]);
      continue;
    }
    if (same(t, b)) continue; // Yalnızca ben değiştirdim; benimki kalır.
    conflicts.push(SECTION_LABELS[key]);
  }

  return { merged, conflicts, adopted };
}
