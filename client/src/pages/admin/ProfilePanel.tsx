/**
 * Profil düzenleyici.
 *
 * Profil sayfasındaki her yazı zaten sözlük anahtarı olarak "Site metinleri"nde
 * bulunabiliyor; ama orada ~500 anahtarın arasında aramak gerekiyor. Burada aynı
 * anahtarlar sayfadaki sırasına göre gruplanıp Türkçe etiketlerle sunuluyor.
 * Yazma yolu aynı: değişiklikler yine translations katmanına gidiyor.
 */
import type { LocalizedText } from "@shared/siteContent";
import { en } from "@/i18n/en";
import { tr } from "@/i18n/tr";
import type { TranslationKey } from "@/i18n";
import { BilingualField, Section } from "./fields";

type FieldSpec = {
  key: TranslationKey;
  label: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
};

type GroupSpec = {
  title: string;
  description: string;
  fields: FieldSpec[];
};

/** Sayfadaki görünme sırasına göre gruplandı. */
const GROUPS: GroupSpec[] = [
  {
    title: "Kimlik",
    description: "Pano kartının ve tam profil sayfasının üst bölümü.",
    fields: [
      { key: "profile.name", label: "Ad soyad" },
      { key: "profile.role", label: "Pano kartındaki unvan" },
      { key: "profileView.role", label: "Tam profildeki unvan" },
      { key: "profileView.kicker", label: "Sayfa üstü etiket" },
      { key: "profileView.education", label: "Sayfa üstü eğitim satırı" },
      { key: "profile.badgeTitle", label: "Fotoğraftaki yeşil noktanın açıklaması" },
    ],
  },
  {
    title: "Akademik ortalama",
    description: "İki yerde görünür. Tamamen gizlemek için Görünürlük bölümünü kullanın.",
    fields: [
      { key: "profile.gpaValue", label: "Pano kartındaki not" },
      { key: "profile.gpaLabel", label: "Pano kartındaki alt yazı" },
      { key: "profileView.gpaLabel", label: "Tam profil · rozet başlığı" },
      { key: "profileView.gpaValue", label: "Tam profil · not" },
      { key: "profileView.gpaScale", label: "Tam profil · ölçek" },
    ],
  },
  {
    title: "Öne çıkanlar",
    description: "Pano profil kartındaki iki bilgi hapı.",
    fields: [
      { key: "profile.researchLabel", label: "Araştırma girişimi · etiket" },
      { key: "profile.researchValue", label: "Araştırma girişimi · değer" },
      { key: "profile.techLabel", label: "Teknik yetkinlik · etiket" },
      { key: "profile.techValue", label: "Teknik yetkinlik · değer" },
    ],
  },
  {
    title: "Özet ve yaklaşım",
    description: "Pano kartındaki serbest metin ve tam profildeki vizyon paragrafları.",
    fields: [
      { key: "profile.summaryLabel", label: "Özet başlığı" },
      { key: "profile.summaryText", label: "Özet metni", multiline: true, rows: 5 },
      { key: "profileView.visionTitle", label: "Vizyon başlığı" },
      { key: "profileView.visionP1", label: "Vizyon · birinci paragraf", multiline: true, rows: 4 },
      { key: "profileView.visionP2", label: "Vizyon · ikinci paragraf", multiline: true, rows: 4 },
    ],
  },
  {
    title: "Künye bilgileri",
    description: "Tam profil sayfasının sol sütunundaki bilgi satırları.",
    fields: [
      { key: "profileView.factUniversity", label: "Üniversite · etiket" },
      { key: "profileView.factUniversityValue", label: "Üniversite · değer" },
      { key: "profileView.factMajor", label: "Ana dal · etiket" },
      { key: "profileView.factMajorValue", label: "Ana dal · değer" },
      { key: "profileView.factDoubleMajor", label: "Çift ana dal · etiket" },
      { key: "profileView.factDoubleMajorValue", label: "Çift ana dal · değer" },
      { key: "profileView.factTerm", label: "Dönem · etiket" },
      { key: "profileView.factTermValue", label: "Dönem · değer" },
      { key: "profileView.factAward", label: "Ödül · etiket" },
      { key: "profileView.factAwardValue", label: "Ödül · değer" },
      { key: "profileView.factLanguages", label: "Diller · etiket" },
      { key: "profileView.factLanguagesValue", label: "Diller · değer" },
      { key: "profileView.factLocation", label: "Konum · etiket" },
      { key: "profileView.factLocationValue", label: "Konum · değer" },
    ],
  },
  {
    title: "Eğitim geçmişi",
    description: "Akademik bölüm ve ödül kutusu.",
    fields: [
      { key: "profileView.academicTitle", label: "Bölüm başlığı" },
      { key: "profileView.academicSchool", label: "Okul adı" },
      { key: "profileView.academicPeriod", label: "Dönem" },
      { key: "profileView.academicDetail", label: "Açıklama", multiline: true, rows: 3 },
      { key: "profileView.academicGpa", label: "Not ortalaması" },
      { key: "profileView.awardTitle", label: "Ödül başlığı" },
      { key: "profileView.awardDesc", label: "Ödül açıklaması", multiline: true, rows: 2 },
    ],
  },
  {
    title: "Dersler",
    description: "Eğitim bölümünün altındaki ders etiketleri. Boş bıraktığın etiket sitede görünmez.",
    fields: [
      { key: "profileView.courseworkLabel", label: "Bölüm etiketi" },
      { key: "profileView.course1", label: "1. ders" },
      { key: "profileView.course2", label: "2. ders" },
      { key: "profileView.course3", label: "3. ders" },
      { key: "profileView.course4", label: "4. ders" },
      { key: "profileView.course5", label: "5. ders" },
      { key: "profileView.course6", label: "6. ders" },
      { key: "profileView.course7", label: "7. ders" },
    ],
  },
  {
    title: "Yetkinlik matrisi",
    description: "Dört sütunlu yetkinlik tablosu. Her sütunun başlığı ve dört maddesi var.",
    fields: [
      { key: "profileView.matrixTitle", label: "Matris başlığı" },
      { key: "profileView.matrix1Title", label: "1. sütun · başlık" },
      { key: "profileView.matrix1Item1", label: "1. sütun · 1. madde" },
      { key: "profileView.matrix1Item2", label: "1. sütun · 2. madde" },
      { key: "profileView.matrix1Item3", label: "1. sütun · 3. madde" },
      { key: "profileView.matrix1Item4", label: "1. sütun · 4. madde" },
      { key: "profileView.matrix2Title", label: "2. sütun · başlık" },
      { key: "profileView.matrix2Item1", label: "2. sütun · 1. madde" },
      { key: "profileView.matrix2Item2", label: "2. sütun · 2. madde" },
      { key: "profileView.matrix2Item3", label: "2. sütun · 3. madde" },
      { key: "profileView.matrix2Item4", label: "2. sütun · 4. madde" },
      { key: "profileView.matrix3Title", label: "3. sütun · başlık" },
      { key: "profileView.matrix3Item1", label: "3. sütun · 1. madde" },
      { key: "profileView.matrix3Item2", label: "3. sütun · 2. madde" },
      { key: "profileView.matrix3Item3", label: "3. sütun · 3. madde" },
      { key: "profileView.matrix3Item4", label: "3. sütun · 4. madde" },
      { key: "profileView.matrix4Title", label: "4. sütun · başlık" },
      { key: "profileView.matrix4Item1", label: "4. sütun · 1. madde" },
      { key: "profileView.matrix4Item2", label: "4. sütun · 2. madde" },
      { key: "profileView.matrix4Item3", label: "4. sütun · 3. madde" },
      { key: "profileView.matrix4Item4", label: "4. sütun · 4. madde" },
    ],
  },
  {
    title: "Araştırma girişimi bölümü",
    description: "Tam profilin altındaki Measure Moat kutusu. Adresi Bağlantılar bölümünden değiştirin.",
    fields: [
      { key: "profileView.moatTitle", label: "Başlık" },
      { key: "profileView.moatDesc", label: "Açıklama", multiline: true, rows: 3 },
      { key: "profileView.moatCta", label: "Buton yazısı" },
      { key: "profileView.moatContact", label: "İkincil buton yazısı" },
      { key: "profileView.moatLink", label: "Bağlantı yazısı" },
      { key: "profileView.linkedinLink", label: "LinkedIn bağlantı yazısı" },
    ],
  },
  {
    title: "CV indirme bölümü",
    description: "Dosyaların kendisini CV dosyaları bölümünden yüklüyorsun; buradakiler yalnızca yazılar.",
    fields: [
      { key: "profileView.cvCenter", label: "Bölüm başlığı" },
      { key: "profileView.cvTrPhoto", label: "TR fotoğraflı · başlık" },
      { key: "profileView.cvTrPhotoNote", label: "TR fotoğraflı · açıklama" },
      { key: "profileView.cvTrAts", label: "TR ATS · başlık" },
      { key: "profileView.cvTrAtsNote", label: "TR ATS · açıklama" },
      { key: "profileView.cvEnPhoto", label: "EN fotoğraflı · başlık" },
      { key: "profileView.cvEnPhotoNote", label: "EN fotoğraflı · açıklama" },
      { key: "profileView.cvEnAts", label: "EN ATS · başlık" },
      { key: "profileView.cvEnAtsNote", label: "EN ATS · açıklama" },
    ],
  },
];

export function ProfilePanel({
  overrides,
  onChange,
}: {
  overrides: Record<string, LocalizedText>;
  onChange: (next: Record<string, LocalizedText>) => void;
}) {
  const valueOf = (key: TranslationKey): LocalizedText => overrides[key] ?? { tr: tr[key], en: en[key] };

  const setValue = (key: TranslationKey, next: LocalizedText) => onChange({ ...overrides, [key]: next });

  const changedCount = GROUPS.flatMap((group) => group.fields).filter((field) => {
    const value = overrides[field.key];
    return value && (value.tr !== tr[field.key] || value.en !== en[field.key]);
  }).length;

  return (
    <>
      <Section
        title="Profil sayfası"
        description="Profil sayfasındaki bütün yazılar burada, sayfadaki sırasıyla. Değiştirmediklerin koddaki hâliyle kalır."
      >
        <p className="adm-count">
          {GROUPS.reduce((total, group) => total + group.fields.length, 0)} alan · {changedCount} tanesi
          değiştirilmiş. Fotoğraf için <b>Görseller</b>, CV dosyaları için <b>CV dosyaları</b>, LinkedIn ve
          Measure Moat adresleri için <b>Bağlantılar</b> bölümüne bakın.
        </p>
      </Section>

      {GROUPS.map((group) => (
        <Section key={group.title} title={group.title} description={group.description}>
          {group.fields.map((field) => (
            <BilingualField
              key={field.key}
              label={field.label}
              value={valueOf(field.key)}
              multiline={field.multiline}
              rows={field.rows}
              hint={field.hint}
              onChange={(next) => setValue(field.key, next)}
            />
          ))}
        </Section>
      ))}
    </>
  );
}
