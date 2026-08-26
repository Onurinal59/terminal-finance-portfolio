import { useMemo, useState } from "react";
import { Activity, Search, SlidersHorizontal, X } from "lucide-react";

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

export function GlobalMarketSearch({ query, onQuery, results, isLoading, isError, onSelect }: { query: string; onQuery: (value: string) => void; results: YahooSearchItem[]; isLoading: boolean; isError: boolean; onSelect: (item: YahooSearchItem) => void }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const isOpen = query.trim().length >= 1;
  const visibleResults = useMemo(() => {
    const filter = assetFilters.find((item) => item.id === activeFilter) ?? assetFilters[0];
    return filter.types.length ? results.filter((item) => filter.types.includes((item.type ?? "OTHER") as never)) : results;
  }, [activeFilter, results]);
  const typeLabel = (type?: string) => ({ EQUITY: "HİSSE", ETF: "ETF", MUTUALFUND: "FON", INDEX: "ENDEKS", BOND: "TAHVİL / EUROBOND", CURRENCY: "DÖVİZ", CRYPTOCURRENCY: "KRİPTO", FUTURE: "VADELİ", OPTION: "OPSİYON", WARRANT: "VARANT", MONEYMARKET: "PARA PİYASASI", ECNQUOTE: "ECN" }[type ?? ""] ?? type ?? "DİĞER");
  return <div className="global-market-search">
    <label className="global-search-input"><Search size={14}/><input value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Yahoo sembol, şirket veya varlık ara" aria-label="Yahoo Finance varlık ara"/><kbd>ARA</kbd>{query && <button type="button" onClick={() => onQuery("")} aria-label="Aramayı temizle"><X size={12}/></button>}</label>
    {isOpen && <section className="global-search-popover" aria-label="Yahoo Finance arama sonuçları"><div className="global-search-head"><span><SlidersHorizontal size={12}/> VARLIK SINIFI</span><small>{isLoading ? "ARANIYOR…" : `${visibleResults.length} SONUÇ`}</small></div><div className="global-search-filters">{assetFilters.map((filter) => <button key={filter.id} className={activeFilter === filter.id ? "active" : ""} onClick={() => setActiveFilter(filter.id)}>{filter.label}</button>)}</div><div className="global-search-results">{isLoading && <p><Activity size={13}/> Yahoo Finance taranıyor…</p>}{isError && <p className="error">Arama sağlayıcısı şu an yanıt vermiyor. Lütfen tekrar dene.</p>}{!isLoading && !isError && !visibleResults.length && <p>Bu kriterlerle eşleşen varlık bulunamadı.</p>}{!isLoading && !isError && visibleResults.slice(0, 10).map((item) => <button key={`${item.symbol}-${item.exchange ?? ""}`} onClick={() => onSelect(item)}><span><b>{item.symbol}</b><small>{item.name}</small></span><em>{typeLabel(item.type)}</em><strong>{item.exchange || "YAHOO"}</strong></button>)}</div><footer>Yahoo Finance · Sonuç seçildiğinde yalnızca analiz grafiği açılır.</footer></section>}
  </div>;
}
