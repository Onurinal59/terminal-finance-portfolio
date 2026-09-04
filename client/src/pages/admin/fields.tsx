/** Panelin tekrar eden form parçaları. Hepsi kontrollü bileşen. */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import type { LocalizedText } from "@shared/siteContent";

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="adm-field">
      <span className="adm-field-label">{label}</span>
      {children}
      {hint && <small className="adm-field-hint">{hint}</small>}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      className="adm-input"
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      className="adm-input adm-textarea"
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

/** İki dili yan yana düzenleten alan; sitedeki her metin çift olarak tutulur. */
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  hint,
}: {
  label: string;
  value: LocalizedText;
  onChange: (next: LocalizedText) => void;
  multiline?: boolean;
  rows?: number;
  hint?: string;
}) {
  const Input = multiline ? TextArea : TextInput;
  return (
    <div className="adm-field">
      <span className="adm-field-label">{label}</span>
      <div className="adm-bilingual">
        <div>
          <span className="adm-lang-tag">TR</span>
          <Input value={value.tr} rows={rows} onChange={(next: string) => onChange({ ...value, tr: next })} />
        </div>
        <div>
          <span className="adm-lang-tag">EN</span>
          <Input value={value.en} rows={rows} onChange={(next: string) => onChange({ ...value, en: next })} />
        </div>
      </div>
      {hint && <small className="adm-field-hint">{hint}</small>}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className={`adm-toggle ${checked ? "is-on" : ""}`}>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="adm-toggle-track">
        <span className="adm-toggle-thumb" />
      </span>
      <span className="adm-toggle-copy">
        <b>{label}</b>
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}

/** Madde listesi (katalizörler, riskler, sürücüler) için ekle/sil düzenleyici. */
export function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
  addLabel,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  addLabel: string;
}) {
  return (
    <div className="adm-field">
      <span className="adm-field-label">{label}</span>
      <div className="adm-list">
        {items.map((item, index) => (
          <div key={index} className="adm-list-row">
            <textarea
              className="adm-input adm-textarea"
              rows={2}
              value={item}
              placeholder={placeholder}
              onChange={(event) => {
                const next = [...items];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <button
              type="button"
              className="adm-icon-btn danger"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              aria-label="Sil"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="adm-btn ghost small" onClick={() => onChange([...items, ""])}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

export function Section({
  title,
  description,
  children,
  actions,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="adm-section">
      <header className="adm-section-head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {actions}
      </header>
      <div className="adm-section-body">{children}</div>
    </section>
  );
}
