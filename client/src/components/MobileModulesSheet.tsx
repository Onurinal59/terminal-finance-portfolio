import React, { useState, useEffect } from "react";
import {
  BookOpen,
  ChevronRight,
  Clock,
  Globe,
  Grid2X2,
  Layers,
  LineChart,
  Mail,
  PieChart,
  Search,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

export type MobileModuleId =
  | "CHART"
  | "WATCH"
  | "SUMMARY"
  | "FINANCIALS"
  | "MACRO"
  | "HOURS"
  | "RESEARCH"
  | "PROFILE"
  | "CONTACT";

interface MobileModulesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: MobileModuleId) => void;
  activeView: string;
  activeFilter: string;
}

type ModuleCategory = "PİYASA & GRAFİK" | "TEMEL ANALİZ & EKONOMİ" | "ARAŞTIRMA & ANALİST";

interface ModuleItem {
  id: MobileModuleId;
  title: string;
  category: ModuleCategory;
  description: string;
  badge: string;
  badgeTone: "green" | "cyan" | "amber" | "purple";
  icon: React.ReactNode;
  tabletHint: string;
}

export const MobileModulesSheet: React.FC<MobileModulesSheetProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  activeView,
  activeFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | ModuleCategory>("ALL");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modules: ModuleItem[] = [
    {
      id: "CHART",
      title: "Grafik & Finansal Tablolar",
      category: "PİYASA & GRAFİK",
      description: "1G–1Y interaktif mum grafiği, Gelir Tablosu, Bilanço ve Nakit Akışı görselleştiricisi",
      badge: "İNTERAKTİF",
      badgeTone: "green",
      icon: <LineChart size={20} />,
      tabletHint: "Tam Ekran Görünüm",
    },
    {
      id: "WATCH",
      title: "BIST İzleme Listesi & Keşif",
      category: "PİYASA & GRAFİK",
      description: "BIST 30, BIST 100, Banka, Sanayi canlı kotasyonları, günlük fark ve hacim liderleri",
      badge: "CANLI FİYAT",
      badgeTone: "green",
      icon: <TrendingUp size={20} />,
      tabletHint: "Piyasa Evreni",
    },
    {
      id: "SUMMARY",
      title: "Piyasa Nabzı & Sıcak Gelişmeler",
      category: "PİYASA & GRAFİK",
      description: "BIST endeks değişimleri, en çok artan/düşen hisseler ve işlem akışı",
      badge: "GÜNCEL",
      badgeTone: "cyan",
      icon: <Grid2X2 size={20} />,
      tabletHint: "Günün Özeti",
    },
    {
      id: "FINANCIALS",
      title: "Yıllık Finansmanlar & Rasyolar",
      category: "TEMEL ANALİZ & EKONOMİ",
      description: "Son 4 yılın bilanço kalemleri, net kâr marjı, borçluluk ve büyüme metrikleri",
      badge: "4 YILLIK",
      badgeTone: "cyan",
      icon: <PieChart size={20} />,
      tabletHint: "Temel Veriler",
    },
    {
      id: "MACRO",
      title: "Makro Göstergeler & Faizler",
      category: "TEMEL ANALİZ & EKONOMİ",
      description: "TCMB politika faizi, TÜFE enflasyon, 10Y tahvil getirisi ve döviz kurları",
      badge: "EKONOMİ",
      badgeTone: "amber",
      icon: <Globe size={20} />,
      tabletHint: "Merkez Bankası & Veriler",
    },
    {
      id: "HOURS",
      title: "Küresel Seans Döngüsü",
      category: "TEMEL ANALİZ & EKONOMİ",
      description: "Borsa İstanbul, Wall Street, Londra ve Tokyo piyasalarının anlık açık/kapalı durumu",
      badge: "SEANS",
      badgeTone: "amber",
      icon: <Clock size={20} />,
      tabletHint: "Dünya Saatleri",
    },
    {
      id: "RESEARCH",
      title: "Rapor Kütüphanesi",
      category: "ARAŞTIRMA & ANALİST",
      description: "Özsermaye değerleme modelleri, çeyreklik şirket analizleri ve indirilebilir PDF'ler",
      badge: "RAPORLAR",
      badgeTone: "purple",
      icon: <BookOpen size={20} />,
      tabletHint: "PDF & Makaleler",
    },
    {
      id: "PROFILE",
      title: "Analist Profili & Özgeçmiş",
      category: "ARAŞTIRMA & ANALİST",
      description: "Onur İnal kariyer biyografisi, sertifikalar, yetkinlikler ve doğrudan CV indirme",
      badge: "ÖZGEÇMİŞ",
      badgeTone: "purple",
      icon: <UserRound size={20} />,
      tabletHint: "Kariyer & CV",
    },
    {
      id: "CONTACT",
      title: "İletişim & Randevu Masası",
      category: "ARAŞTIRMA & ANALİST",
      description: "Analistle doğrudan iletişim, resmi LinkedIn profili ve profesyonel e-posta bağlantısı",
      badge: "BAĞLANTI",
      badgeTone: "purple",
      icon: <Mail size={20} />,
      tabletHint: "Doğrudan İletişim",
    },
  ];

  const filtered = modules.filter((m) => {
    const matchCategory = selectedCategory === "ALL" || m.category === selectedCategory;
    const matchQuery =
      searchQuery.trim() === "" ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const categories: ModuleCategory[] =
    selectedCategory === "ALL"
      ? ["PİYASA & GRAFİK", "TEMEL ANALİZ & EKONOMİ", "ARAŞTIRMA & ANALİST"]
      : [selectedCategory];

  return (
    <div className="modules-modal-overlay" onClick={onClose}>
      <div
        className="modules-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Terminal Modülleri ve Masaları"
      >
        {/* Mobile Swipe / Pull Handle */}
        <div className="sheet-handle-bar">
          <div className="sheet-handle" />
        </div>

        {/* Modal / Sheet Header */}
        <header className="modules-modal-header">
          <div className="sheet-header-title-group">
            <div className="sheet-title-icon-box">
              <Layers size={18} />
            </div>
            <div className="sheet-title-texts">
              <div className="sheet-title-row">
                <span className="sheet-main-title">TERMİNAL MODÜL MERKEZİ</span>
                <span className="sheet-platform-badge">APP MODU</span>
              </div>
              <p className="sheet-subtitle">
                Analiz masaları, interaktif araçlar ve piyasa görünümleri
              </p>
            </div>
          </div>
          <button
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Kapat"
            title="Kapat (ESC)"
          >
            <X size={17} />
          </button>
        </header>

        {/* Search Box */}
        <div className="sheet-search-wrap">
          <Search size={15} className="sheet-search-icon" />
          <input
            type="text"
            className="sheet-search-input"
            placeholder="Modül veya masa ara... (Örn: Bilanço, Makro, Rapor)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={false}
          />
          {searchQuery && (
            <button
              className="sheet-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label="Aramayı Temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills (Tabs) */}
        <div className="sheet-cat-pills-bar" aria-label="Kategori Sekmeleri">
          <button
            className={`sheet-cat-pill ${selectedCategory === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            <span>TÜMÜ</span>
            <small>({modules.length})</small>
          </button>
          <button
            className={`sheet-cat-pill ${selectedCategory === "PİYASA & GRAFİK" ? "active" : ""}`}
            onClick={() => setSelectedCategory("PİYASA & GRAFİK")}
          >
            <span>PİYASA & GRAFİK</span>
            <small>(3)</small>
          </button>
          <button
            className={`sheet-cat-pill ${selectedCategory === "TEMEL ANALİZ & EKONOMİ" ? "active" : ""}`}
            onClick={() => setSelectedCategory("TEMEL ANALİZ & EKONOMİ")}
          >
            <span>TEMEL ANALİZ</span>
            <small>(3)</small>
          </button>
          <button
            className={`sheet-cat-pill ${selectedCategory === "ARAŞTIRMA & ANALİST" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ARAŞTIRMA & ANALİST")}
          >
            <span>ANALİST MASASI</span>
            <small>(3)</small>
          </button>
        </div>

        {/* Scrollable Module Cards */}
        <div className="modules-sheet-scroll">
          {categories.map((cat) => {
            const catModules = filtered.filter((m) => m.category === cat);
            if (catModules.length === 0) return null;

            return (
              <section key={cat} className="sheet-category-section">
                <div className="sheet-category-header">
                  <span className={`cat-dot dot-${cat.split(" ")[0].toLowerCase()}`} />
                  <span className="cat-heading">{cat}</span>
                  <span className="cat-count-badge">{catModules.length} MASA</span>
                </div>

                <div className="sheet-module-grid">
                  {catModules.map((mod) => {
                    const isSelected =
                      (mod.id === "PROFILE" && activeView === "PROFILE") ||
                      (mod.id === "RESEARCH" && activeView === "RESEARCH") ||
                      (mod.id === "CONTACT" && activeView === "CONTACT") ||
                      (activeView === "DASHBOARD" &&
                        mod.id.toLowerCase() === activeFilter.toLowerCase());

                    return (
                      <button
                        key={mod.id}
                        className={`module-app-card tone-${mod.badgeTone} ${
                          isSelected ? "active-card" : ""
                        }`}
                        onClick={() => {
                          onSelectModule(mod.id);
                          onClose();
                        }}
                      >
                        <div className={`module-card-icon-wrap tone-${mod.badgeTone}`}>
                          {mod.icon}
                        </div>

                        <div className="module-card-body">
                          <div className="module-card-head">
                            <span className="module-card-title">{mod.title}</span>
                            <span
                              className={`module-card-badge tone-${mod.badgeTone} ${
                                isSelected ? "badge-selected" : ""
                              }`}
                            >
                              {isSelected ? "AKTİF" : mod.badge}
                            </span>
                          </div>

                          <p className="module-card-desc">{mod.description}</p>

                          <div className="module-card-foot">
                            <span className="module-tablet-hint">{mod.tabletHint}</span>
                            <span className="module-action-cta">
                              Giriş Yap <ChevronRight size={13} />
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {filtered.length === 0 && (
            <div className="sheet-empty-search-state">
              <Search size={28} />
              <p>"{searchQuery}" aramasıyla eşleşen modül veya masa bulunamadı.</p>
              <button
                className="sheet-empty-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
