export type DiscoveryRow = { kind: string };

export function normalizeDiscoverySymbol(providerSymbol: string) {
  return providerSymbol.trim().replace(/\.IS$/i, "");
}

export function excludeTransientDiscovery<T extends DiscoveryRow>(rows: T[]) {
  return rows.filter((row) => row.kind !== "KEŞİF");
}
