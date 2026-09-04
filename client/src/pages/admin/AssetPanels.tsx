/** Görseller, CV dosyaları, bağlantılar ve projeler için düzenleyiciler. */
import { useRef } from "react";
import { ExternalLink, FileUp, ImageUp, Plus, RotateCcw, Trash2 } from "lucide-react";
import { CV_SLOTS, type CvSlot, type ProjectLinkContent } from "@shared/siteContent";
import { DEFAULT_CV_FILES, DEFAULT_PROFILE_PHOTO, DEFAULT_SHARE_IMAGE } from "@/content/defaults";
import { BilingualField, Field, Section, TextInput, Toggle } from "./fields";
import { uploadAccept, useUpload, type UploadFolder } from "./useUpload";
import type { WorkingDraft } from "./useDraft";

type TabProps = {
  draft: WorkingDraft;
  update: (patch: Partial<WorkingDraft> | ((current: WorkingDraft) => WorkingDraft)) => void;
};

const CV_SLOT_LABELS: Record<CvSlot, string> = {
  trPhoto: "Türkçe · Fotoğraflı",
  trPlain: "Türkçe · ATS uyumlu",
  enPhoto: "İngilizce · Fotoğraflı",
  enPlain: "İngilizce · ATS uyumlu",
};

/** Tek bir dosya yuvası: mevcut dosyayı gösterir, yenisini yükletir, sıfırlar. */
function FileSlot({
  title,
  description,
  currentUrl,
  currentName,
  folder,
  nameHint,
  preview,
  onUploaded,
  onReset,
  isDefault,
}: {
  title: string;
  description?: string;
  currentUrl: string;
  currentName?: string;
  folder: UploadFolder;
  nameHint?: string;
  preview?: boolean;
  onUploaded: (file: { url: string; fileName: string }) => void;
  onReset: () => void;
  isDefault: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { start, busy } = useUpload(folder);

  return (
    <div className="adm-slot">
      {preview && (
        <div className="adm-slot-preview">
          <img src={currentUrl} alt={title} />
        </div>
      )}
      <div className="adm-slot-body">
        <b>{title}</b>
        {description && <small>{description}</small>}
        <a href={currentUrl} target="_blank" rel="noreferrer" className="adm-slot-link">
          {currentName || currentUrl.split("/").pop()} <ExternalLink size={11} />
        </a>
        <span className={`adm-slot-state ${isDefault ? "off" : "on"}`}>
          {isDefault ? "Kod içindeki dosya" : "Panelden yüklendi"}
        </span>
      </div>
      <div className="adm-slot-actions">
        <input
          ref={inputRef}
          type="file"
          accept={uploadAccept(folder)}
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const result = await start(file, nameHint);
            if (result) onUploaded(result);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />
        <button type="button" className="adm-btn small" disabled={busy} onClick={() => inputRef.current?.click()}>
          {folder === "media" ? <ImageUp size={13} /> : <FileUp size={13} />}
          {busy ? "Yükleniyor…" : "Değiştir"}
        </button>
        {!isDefault && (
          <button type="button" className="adm-btn ghost small" onClick={onReset}>
            <RotateCcw size={13} /> Varsayılana dön
          </button>
        )}
      </div>
    </div>
  );
}

export function MediaTab({ draft, update }: TabProps) {
  const profilePhoto = draft.media.profilePhoto || DEFAULT_PROFILE_PHOTO;
  const shareImage = draft.media.shareImage || DEFAULT_SHARE_IMAGE;

  return (
    <Section
      title="Görseller"
      description="Profil fotoğrafı sitenin her yerinde kullanılır. Paylaşım görseli, linki WhatsApp veya LinkedIn'e attığında çıkan kapaktır."
    >
      <FileSlot
        title="Profil fotoğrafı"
        description="Pano kartında, tam profilde ve iletişim sayfasında görünür. Kare veya dikey bir görsel iyi durur."
        currentUrl={profilePhoto}
        folder="media"
        nameHint="profil"
        preview
        isDefault={profilePhoto === DEFAULT_PROFILE_PHOTO}
        onUploaded={(file) => update({ media: { ...draft.media, profilePhoto: file.url } })}
        onReset={() => update({ media: { ...draft.media, profilePhoto: DEFAULT_PROFILE_PHOTO } })}
      />
      <FileSlot
        title="Paylaşım görseli (og:image)"
        description="1200×630 piksel olmalı. Bağlantı önizlemelerinde bu görsel çıkar."
        currentUrl={shareImage}
        folder="media"
        nameHint="paylasim"
        preview
        isDefault={shareImage === DEFAULT_SHARE_IMAGE}
        onUploaded={(file) => update({ media: { ...draft.media, shareImage: file.url } })}
        onReset={() => update({ media: { ...draft.media, shareImage: DEFAULT_SHARE_IMAGE } })}
      />
    </Section>
  );
}

export function CvTab({ draft, update }: TabProps) {
  return (
    <Section
      title="CV dosyaları"
      description="Dört yuva da profil kartındaki indirme akışını besler. Yüklemediğin yuva depoyla gelen dosyayı gösterir."
    >
      {CV_SLOTS.map((slot) => {
        const stored = draft.cv[slot];
        const current = stored ?? DEFAULT_CV_FILES[slot];
        return (
          <FileSlot
            key={slot}
            title={CV_SLOT_LABELS[slot]}
            currentUrl={current.url}
            currentName={current.fileName}
            folder="cv"
            nameHint={slot}
            isDefault={!stored}
            onUploaded={(file) =>
              update({
                cv: { ...draft.cv, [slot]: { ...file, uploadedAt: new Date().toISOString() } },
              })
            }
            onReset={() => {
              const next = { ...draft.cv };
              delete next[slot];
              update({ cv: next });
            }}
          />
        );
      })}
    </Section>
  );
}

export function LinksTab({ draft, update }: TabProps) {
  const { links } = draft;
  const projects = links.projects;

  const patchLinks = (patch: Partial<typeof links>) => update({ links: { ...links, ...patch } });

  const patchProject = (index: number, patch: Partial<ProjectLinkContent>) =>
    patchLinks({ projects: projects.map((project, i) => (i === index ? { ...project, ...patch } : project)) });

  return (
    <>
      <Section title="Bağlantılar ve iletişim" description="Sitedeki bütün LinkedIn, e-posta ve Measure Moat bağlantıları buradan gelir.">
        <Field label="LinkedIn adresi" hint="Profil kartı, tam profil, iletişim sayfası ve alt bilgi bu adresi kullanır.">
          <TextInput value={links.linkedin} onChange={(linkedin) => patchLinks({ linkedin })} />
        </Field>
        <Field label="E-posta" hint="İletişim formunun gönderdiği adres ve alt bilgideki mailto bağlantısı.">
          <TextInput value={links.email} onChange={(email) => patchLinks({ email })} />
        </Field>
        <Field label="Measure Moat adresi" hint="Araştırma girişimi bağlantısı: profil, arşiv paneli ve alt bilgi.">
          <TextInput value={links.measureMoat} onChange={(measureMoat) => patchLinks({ measureMoat })} />
        </Field>
      </Section>

      <Section
        title="Projeler"
        description="Tam profil sayfasında listelenen kişisel siteler. Yeni bir proje yayımladığında buraya ekle."
        actions={
          <button
            type="button"
            className="adm-btn"
            onClick={() =>
              patchLinks({
                projects: [
                  ...projects,
                  {
                    id: `proje-${projects.length + 1}`,
                    label: { tr: "", en: "" },
                    description: { tr: "", en: "" },
                    url: "",
                    enabled: true,
                  },
                ],
              })
            }
          >
            <Plus size={14} /> Proje ekle
          </button>
        }
      >
        {projects.length === 0 && <p className="adm-empty">Henüz proje eklenmemiş.</p>}

        <div className="adm-card-list">
          {projects.map((project, index) => (
            <div key={project.id} className="adm-card">
              <div className="adm-card-head">
                <b>{project.label.tr || project.id}</b>
                <button
                  type="button"
                  className="adm-icon-btn danger"
                  onClick={() => patchLinks({ projects: projects.filter((_, i) => i !== index) })}
                  aria-label="Sil"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <Toggle
                checked={project.enabled}
                onChange={(enabled) => patchProject(index, { enabled })}
                label="Sitede göster"
              />
              <BilingualField label="Ad" value={project.label} onChange={(label) => patchProject(index, { label })} />
              <BilingualField
                label="Açıklama"
                value={project.description}
                multiline
                rows={2}
                onChange={(description) => patchProject(index, { description })}
              />
              <Field label="Adres">
                <TextInput
                  value={project.url}
                  placeholder="https://…"
                  onChange={(url) => patchProject(index, { url })}
                />
              </Field>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

export function CategoriesTab({ draft, update }: TabProps) {
  const categories = draft.reportCategories;
  const usage = new Map<string, number>();
  for (const report of draft.reports) {
    usage.set(report.category, (usage.get(report.category) ?? 0) + 1);
  }

  const patch = (index: number, value: Partial<(typeof categories)[number]>) =>
    update({ reportCategories: categories.map((item, i) => (i === index ? { ...item, ...value } : item)) });

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= categories.length) return;
    const next = [...categories];
    [next[index], next[target]] = [next[target], next[index]];
    update({ reportCategories: next });
  };

  return (
    <Section
      title="Rapor kategorileri"
      description="Kütüphanenin üstündeki filtre sekmeleri. Sıralamayı değiştirebilir, yeni kategori ekleyebilirsin."
      actions={
        <button
          type="button"
          className="adm-btn"
          onClick={() =>
            update({
              reportCategories: [
                ...categories,
                { id: `KATEGORI-${categories.length + 1}`, label: { tr: "", en: "" } },
              ],
            })
          }
        >
          <Plus size={14} /> Kategori ekle
        </button>
      }
    >
      <div className="adm-card-list">
        {categories.map((category, index) => {
          const count = usage.get(category.id) ?? 0;
          return (
            <div key={category.id} className="adm-card">
              <div className="adm-card-head">
                <b>{category.label.tr || category.id}</b>
                <div className="adm-row-actions">
                  <button type="button" className="adm-icon-btn" onClick={() => move(index, -1)} aria-label="Yukarı">
                    ↑
                  </button>
                  <button type="button" className="adm-icon-btn" onClick={() => move(index, 1)} aria-label="Aşağı">
                    ↓
                  </button>
                  <button
                    type="button"
                    className="adm-icon-btn danger"
                    disabled={count > 0}
                    title={count > 0 ? `${count} rapor bu kategoride, önce onları taşıyın` : "Sil"}
                    onClick={() => update({ reportCategories: categories.filter((_, i) => i !== index) })}
                    aria-label="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <BilingualField label="Görünen ad" value={category.label} onChange={(label) => patch(index, { label })} />
              <Field
                label="Kimlik"
                hint={
                  count > 0
                    ? `${count} rapor bu kategoriye bağlı — kimliği değiştirirsen o raporlar filtre dışında kalır.`
                    : "Raporlarda bu kimlikle eşleşir."
                }
              >
                <TextInput value={category.id} onChange={(id) => patch(index, { id })} />
              </Field>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
