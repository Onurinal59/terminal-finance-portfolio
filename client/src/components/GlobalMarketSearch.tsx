import { useMemo, useState, useEffect } from "react";
import { Activity, Search, SlidersHorizontal, X, ArrowUpRight } from "lucide-react";
import { useI18n, type TranslationKey } from "@/i18n";

export type YahooSearchItem = { symbol: string; name: string; exchange?: string; type?: string };

const assetFilters = [
  { id: "ALL", types: [] },
  { id: "EQUITY", types: ["EQUITY"] },
  { id: "FUND", types: ["ETF", "MUTUALFUND"] },
  { id: "INDEX", types: ["INDEX"] },
  { id: "BOND", types: ["BOND"] },
  { id: "CURRENCY", types: ["CURRENCY"] },
  { id: "CRYPTO", types: ["CRYPTOCURRENCY"] },
  { id: "OTHER", types: ["FUTURE", "OPTION", "WARRANT", "MONEYMARKET", "ECNQUOTE", "OTHER"] },
] as const;

const assetTypeKeys = [
  "EQUITY",
  "ETF",
  "MUTUALFUND",
  "INDEX",
  "BOND",
  "CURRENCY",
  "CRYPTOCURRENCY",
  "FUTURE",
  "OPTION",
  "WARRANT",
  "MONEYMARKET",
  "ECNQUOTE",
] as const;

export function GlobalMarketSearch({
  query,
  onQuery,
  results,
  isLoading,
  isError,
  onSelect,
}: {
  query: string;
  onQuery: (value: string) => void;
  results: YahooSearchItem[];
  isLoading: boolean;
  isError: boolean;
  onSelect: (item: YahooSearchItem) => void;
}) {
  const { t } = useI18n();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const isOpen = query.trim().length >= 1;

  // Keyboard shortcut: ESC to clear/close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onQuery]);

  const visibleResults = useMemo(() => {
    const filter = assetFilters.find((item) => item.id === activeFilter) ?? assetFilters[0];
    return filter.types.length
      ? results.filter((item) => (filter.types as readonly string[]).includes(item.type ?? "OTHER"))
      : results;
  }, [activeFilter, results]);

  const typeLabel = (type?: string) => {
    const known = assetTypeKeys.find((item) => item === type);
    if (known) return t(`assetType.${known}` as TranslationKey);
    return type ?? t("assetType.fallback");
  };

  const typeColorClass = (type?: string) => {
    switch (type) {
      case "EQUITY":
        return "badge-equity";
      case "ETF":
      case "MUTUALFUND":
        return "badge-fund";
      case "INDEX":
        return "badge-index";
      case "CURRENCY":
        return "badge-currency";
      case "CRYPTOCURRENCY":
        return "badge-crypto";
      case "BOND":
        return "badge-bond";
      default:
        return "badge-default";
    }
  };

  return (
    <div className="global-market-search">
      <label className="global-search-input">
        <Search size={15} className="search-icon" />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={t("search.placeholder")}
          aria-label={t("search.aria")}
        />
        <kbd className="search-kbd">ESC</kbd>
        {query && (
          <button type="button" onClick={() => onQuery("")} aria-label={t("search.clear")} className="search-clear-btn">
            <X size={13} />
          </button>
        )}
      </label>

      {isOpen && (
        <section className="global-search-popover" aria-label={t("search.resultsAria")}>
          <div className="global-search-head">
            <span>
              <SlidersHorizontal size={13} /> {t("search.filterLabel")}
            </span>
            <small>
              {isLoading ? t("search.searching") : t("search.resultCount", { count: visibleResults.length })}
            </small>
          </div>

          <div className="global-search-filters">
            {assetFilters.map((filter) => (
              <button
                key={filter.id}
                className={activeFilter === filter.id ? "active" : ""}
                onClick={() => setActiveFilter(filter.id)}
              >
                {t(`assetFilter.${filter.id}` as TranslationKey)}
              </button>
            ))}
          </div>

          <div className="global-search-results">
            {isLoading && (
              <p className="search-status-text">
                <Activity size={14} className="spin-slow" /> {t("search.scanning")}
              </p>
            )}
            {isError && <p className="search-status-text error">{t("search.error")}</p>}
            {!isLoading && !isError && !visibleResults.length && (
              <p className="search-status-text empty">{t("search.empty")}</p>
            )}
            {!isLoading &&
              !isError &&
              visibleResults.slice(0, 10).map((item) => (
                <button
                  key={`${item.symbol}-${item.exchange ?? ""}`}
                  className="search-result-item"
                  onClick={() => onSelect(item)}
                >
                  <span className="result-main">
                    <b>{item.symbol}</b>
                    <small>{item.name}</small>
                  </span>
                  <em className={`result-badge ${typeColorClass(item.type)}`}>{typeLabel(item.type)}</em>
                  <strong className="result-exchange">{item.exchange || "YAHOO"}</strong>
                  <ArrowUpRight size={13} className="result-arrow" />
                </button>
              ))}
          </div>

          <footer className="global-search-footer">
            <span>{t("search.footer")}</span>
          </footer>
        </section>
      )}
    </div>
  );
}
