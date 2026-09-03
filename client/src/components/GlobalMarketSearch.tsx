import { useMemo, useState, useEffect } from "react";
import { Activity, Search, SlidersHorizontal, X, ArrowUpRight } from "lucide-react";

export type YahooSearchItem = { symbol: string; name: string; exchange?: string; type?: string };
const assetFilters = [
  { id: "ALL", label: "TÜMÜ", types: [] },
  { id: "EQUITY", label: "HİSSE", types: ["EQUITY"] },
  { id: "FUND", label: "ETF / FON", types: ["ETF", "MUTUALFUND"] },
  { id: "INDEX", label: "ENDEKS", types: ["INDEX"] },
  { id: "BOND", label: "TAHVİL / EUROBOND", types: ["BOND"] },
  { id: "CURRENCY", label: "DÖVİZ", types: ["CURRENCY"] },
  { id: "CRYPTO", label: "KRİPTO", types: ["CRYPTOCURRENCY"] },
  { id: "OTHER", label: "DİĞER", types: ["FUTURE", "OPTION", "WARRANT", "MONEYMARKET", "ECNQUOTE", "OTHER"] },
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
  const [activeFilter, setActiveFilter] = useState("ALL");
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
      ? results.filter((item) => filter.types.includes((item.type ?? "OTHER") as never))
      : results;
  }, [activeFilter, results]);

  const typeLabel = (type?: string) =>
    ({
      EQUITY: "HİSSE",
      ETF: "ETF",
      MUTUALFUND: "FON",
      INDEX: "ENDEKS",
      BOND: "TAHVİL",
      CURRENCY: "DÖVİZ",
      CRYPTOCURRENCY: "KRİPTO",
      FUTURE: "VADELİ",
      OPTION: "OPSİYON",
      WARRANT: "VARANT",
      MONEYMARKET: "PARA PİYASASI",
      ECNQUOTE: "ECN",
    }[type ?? ""] ?? type ?? "VARLIK");

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
          placeholder="Yahoo sembol, şirket veya piyasa varlığı ara... (Örn: THYAO, AAPL, BTC)"
          aria-label="Yahoo Finance varlık ara"
        />
        <kbd className="search-kbd">ESC</kbd>
        {query && (
          <button type="button" onClick={() => onQuery("")} aria-label="Aramayı temizle" className="search-clear-btn">
            <X size={13} />
          </button>
        )}
      </label>

      {isOpen && (
        <section className="global-search-popover" aria-label="Yahoo Finance arama sonuçları">
          <div className="global-search-head">
            <span>
              <SlidersHorizontal size={13} /> VARLIK SINIFI FİLTRESİ
            </span>
            <small>{isLoading ? "ARANIYOR…" : `${visibleResults.length} SONUÇ BULUNDU`}</small>
          </div>

          <div className="global-search-filters">
            {assetFilters.map((filter) => (
              <button
                key={filter.id}
                className={activeFilter === filter.id ? "active" : ""}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="global-search-results">
            {isLoading && (
              <p className="search-status-text">
                <Activity size={14} className="spin-slow" /> Yahoo Finance taranıyor…
              </p>
            )}
            {isError && (
              <p className="search-status-text error">Arama sağlayıcısı şu an yanıt vermiyor. Lütfen tekrar dene.</p>
            )}
            {!isLoading && !isError && !visibleResults.length && (
              <p className="search-status-text empty">Bu filtreye uygun bir varlık bulunamadı.</p>
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
            <span>Yahoo Finance canlı entegrasyonu · Seçilen sembol anlık grafik ve mali tablolarda açılır.</span>
          </footer>
        </section>
      )}
    </div>
  );
}
