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
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import { useI18n, type TranslationKey } from "@/i18n";

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

/** Kategori kimlikleri dilden bağımsızdır; etiketleri sözlükten gelir. */
type ModuleCategory = "MARKET" | "FUNDAMENTALS" | "RESEARCH";

const CATEGORY_ORDER: ModuleCategory[] = ["MARKET", "FUNDAMENTALS", "RESEARCH"];

const CATEGORY_LABEL_KEYS: Record<ModuleCategory, TranslationKey> = {
  MARKET: "modules.catMarket",
  FUNDAMENTALS: "modules.catFundamentals",
  RESEARCH: "modules.catResearch",
};

interface ModuleDefinition {
  id: MobileModuleId;
  category: ModuleCategory;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  badgeKey: TranslationKey;
  hintKey: TranslationKey;
  badgeTone: "green" | "cyan" | "amber" | "purple";
  icon: React.ReactNode;
}

const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: "CHART",
    category: "MARKET",
    titleKey: "modules.chartTitle",
    descriptionKey: "modules.chartDesc",
    badgeKey: "modules.chartBadge",
    hintKey: "modules.chartHint",
    badgeTone: "green",
    icon: <LineChart size={20} />,
  },
  {
    id: "WATCH",
    category: "MARKET",
    titleKey: "modules.watchTitle",
    descriptionKey: "modules.watchDesc",
    badgeKey: "modules.watchBadge",
    hintKey: "modules.watchHint",
    badgeTone: "green",
    icon: <TrendingUp size={20} />,
  },
  {
    id: "SUMMARY",
    category: "MARKET",
    titleKey: "modules.summaryTitle",
    descriptionKey: "modules.summaryDesc",
    badgeKey: "modules.summaryBadge",
    hintKey: "modules.summaryHint",
    badgeTone: "cyan",
    icon: <Grid2X2 size={20} />,
  },
  {
    id: "FINANCIALS",
    category: "FUNDAMENTALS",
    titleKey: "modules.financialsTitle",
    descriptionKey: "modules.financialsDesc",
    badgeKey: "modules.financialsBadge",
    hintKey: "modules.financialsHint",
    badgeTone: "cyan",
    icon: <PieChart size={20} />,
  },
  {
    id: "MACRO",
    category: "FUNDAMENTALS",
    titleKey: "modules.macroTitle",
    descriptionKey: "modules.macroDesc",
    badgeKey: "modules.macroBadge",
    hintKey: "modules.macroHint",
    badgeTone: "amber",
    icon: <Globe size={20} />,
  },
  {
    id: "HOURS",
    category: "FUNDAMENTALS",
    titleKey: "modules.hoursTitle",
    descriptionKey: "modules.hoursDesc",
    badgeKey: "modules.hoursBadge",
    hintKey: "modules.hoursHint",
    badgeTone: "amber",
    icon: <Clock size={20} />,
  },
  {
    id: "RESEARCH",
    category: "RESEARCH",
    titleKey: "modules.researchTitle",
    descriptionKey: "modules.researchDesc",
    badgeKey: "modules.researchBadge",
    hintKey: "modules.researchHint",
    badgeTone: "purple",
    icon: <BookOpen size={20} />,
  },
  {
    id: "PROFILE",
    category: "RESEARCH",
    titleKey: "modules.profileTitle",
    descriptionKey: "modules.profileDesc",
    badgeKey: "modules.profileBadge",
    hintKey: "modules.profileHint",
    badgeTone: "purple",
    icon: <UserRound size={20} />,
  },
  {
    id: "CONTACT",
    category: "RESEARCH",
    titleKey: "modules.contactTitle",
    descriptionKey: "modules.contactDesc",
    badgeKey: "modules.contactBadge",
    hintKey: "modules.contactHint",
    badgeTone: "purple",
    icon: <Mail size={20} />,
  },
];

export const MobileModulesSheet: React.FC<MobileModulesSheetProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  activeView,
  activeFilter,
}) => {
  const { t } = useI18n();
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

  const modules = MODULE_DEFINITIONS.map((definition) => ({
    ...definition,
    title: t(definition.titleKey),
    description: t(definition.descriptionKey),
    badge: t(definition.badgeKey),
    tabletHint: t(definition.hintKey),
    categoryLabel: t(CATEGORY_LABEL_KEYS[definition.category]),
  }));

  const filtered = modules.filter((m) => {
    const matchCategory = selectedCategory === "ALL" || m.category === selectedCategory;
    const query = searchQuery.trim().toLocaleLowerCase();
    const matchQuery =
      query === "" ||
      m.title.toLocaleLowerCase().includes(query) ||
      m.description.toLocaleLowerCase().includes(query) ||
      m.categoryLabel.toLocaleLowerCase().includes(query) ||
      m.badge.toLocaleLowerCase().includes(query);
    return matchCategory && matchQuery;
  });

  const categories: ModuleCategory[] =
    selectedCategory === "ALL" ? CATEGORY_ORDER : [selectedCategory];

  const categoryCount = (category: ModuleCategory) =>
    MODULE_DEFINITIONS.filter((item) => item.category === category).length;

  return (
    <div className="modules-modal-overlay" onClick={onClose}>
      <div
        className="modules-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={t("modules.dialogAria")}
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
                <span className="sheet-main-title">{t("modules.title")}</span>
                <span className="sheet-platform-badge">{t("modules.badge")}</span>
              </div>
              <p className="sheet-subtitle">{t("modules.subtitle")}</p>
            </div>
          </div>
          <button
            className="sheet-close-btn"
            onClick={onClose}
            aria-label={t("modules.close")}
            title={t("modules.closeTitle")}
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
            placeholder={t("modules.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={false}
          />
          {searchQuery && (
            <button
              className="sheet-search-clear"
              onClick={() => setSearchQuery("")}
              aria-label={t("modules.clearSearch")}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills (Tabs) */}
        <div className="sheet-cat-pills-bar" aria-label={t("modules.categoryTabsAria")}>
          <button
            className={`sheet-cat-pill ${selectedCategory === "ALL" ? "active" : ""}`}
            onClick={() => setSelectedCategory("ALL")}
          >
            <span>{t("modules.tabAll")}</span>
            <small>({MODULE_DEFINITIONS.length})</small>
          </button>
          <button
            className={`sheet-cat-pill ${selectedCategory === "MARKET" ? "active" : ""}`}
            onClick={() => setSelectedCategory("MARKET")}
          >
            <span>{t("modules.tabMarket")}</span>
            <small>({categoryCount("MARKET")})</small>
          </button>
          <button
            className={`sheet-cat-pill ${selectedCategory === "FUNDAMENTALS" ? "active" : ""}`}
            onClick={() => setSelectedCategory("FUNDAMENTALS")}
          >
            <span>{t("modules.tabFundamentals")}</span>
            <small>({categoryCount("FUNDAMENTALS")})</small>
          </button>
          <button
            className={`sheet-cat-pill ${selectedCategory === "RESEARCH" ? "active" : ""}`}
            onClick={() => setSelectedCategory("RESEARCH")}
          >
            <span>{t("modules.tabResearch")}</span>
            <small>({categoryCount("RESEARCH")})</small>
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
                  <span className={`cat-dot dot-${cat.toLowerCase()}`} />
                  <span className="cat-heading">{t(CATEGORY_LABEL_KEYS[cat])}</span>
                  <span className="cat-count-badge">{t("modules.deskCount", { count: catModules.length })}</span>
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
                              {isSelected ? t("modules.active") : mod.badge}
                            </span>
                          </div>

                          <p className="module-card-desc">{mod.description}</p>

                          <div className="module-card-foot">
                            <span className="module-tablet-hint">{mod.tabletHint}</span>
                            <span className="module-action-cta">
                              {t("modules.enter")} <ChevronRight size={13} />
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
              <p>{t("modules.emptySearch", { query: searchQuery })}</p>
              <button
                className="sheet-empty-reset-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
              >
                {t("modules.resetFilters")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
