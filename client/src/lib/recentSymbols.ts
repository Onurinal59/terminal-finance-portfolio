export function rememberRecentSymbol(existing: readonly string[], symbol: string, limit = 5): string[] {
  const normalized = symbol.trim();
  if (!normalized) return [...existing];
  return [normalized, ...existing.filter((item) => item !== normalized)].slice(0, limit);
}
