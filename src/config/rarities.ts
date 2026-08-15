export const rarityConfig: Record<string, { color: string; background: string; rank: number }> = {
  common: { color: '#575b63', background: '#f0f1f3', rank: 1 }, uncommon: { color: '#28733b', background: '#eaf6ed', rank: 2 },
  rare: { color: '#2069a8', background: '#e8f3fc', rank: 3 }, epic: { color: '#75429b', background: '#f2eafa', rank: 4 },
  legendary: { color: '#96551c', background: '#fbefe2', rank: 5 }, mythic: { color: '#79620b', background: '#faf4d9', rank: 6 },
  special: { color: '#256b67', background: '#e5f5f3', rank: 7 },
}
export function rarityStyle(rarity?: string) {
  const item = rarityConfig[rarity?.toLowerCase() ?? ''] ?? rarityConfig.common
  return { color: item.color, backgroundColor: item.background }
}
