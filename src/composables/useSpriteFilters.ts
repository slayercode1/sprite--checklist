import { computed, ref, type Ref } from 'vue'
import type { Sprite } from '../types/sprite'
import { rarityConfig } from '../config/rarities'
import { normalizeText } from '../utils/text'
export type StatusFilter = 'all' | 'owned' | 'unowned' | 'mastered' | 'unmastered'
export type SortMode = 'az' | 'za' | 'rarity' | 'owned' | 'unowned' | 'mastered'
export function useSpriteFilters(sprites: Ref<Sprite[]>, isOwned: (id: string) => boolean, isMastered: (id: string) => boolean) {
  const query = ref(''), status = ref<StatusFilter>('all'), rarity = ref('all'), variant = ref('all'), spriteType = ref('all'), sort = ref<SortMode>('az')
  const values = (key: 'rarity' | 'variant' | 'spriteType') => computed(() => [...new Set(sprites.value.map((sprite) => sprite[key]).filter(Boolean) as string[])].sort())
  const rarities = values('rarity'), variants = values('variant'), spriteTypes = values('spriteType')
  const filteredSprites = computed(() => [...sprites.value.filter((sprite) => {
    const matchesStatus = status.value === 'all' || (status.value === 'owned' && isOwned(sprite.id)) || (status.value === 'unowned' && !isOwned(sprite.id)) || (status.value === 'mastered' && isMastered(sprite.id)) || (status.value === 'unmastered' && !isMastered(sprite.id))
    return normalizeText(sprite.name).includes(normalizeText(query.value)) && matchesStatus && (rarity.value === 'all' || sprite.rarity === rarity.value) && (variant.value === 'all' || sprite.variant === variant.value) && (spriteType.value === 'all' || sprite.spriteType === spriteType.value)
  })].sort((a, b) => {
    if (sort.value === 'za') return b.name.localeCompare(a.name)
    if (sort.value === 'rarity') return (rarityConfig[b.rarity ?? '']?.rank ?? 0) - (rarityConfig[a.rarity ?? '']?.rank ?? 0) || a.name.localeCompare(b.name)
    if (sort.value === 'owned') return Number(isOwned(b.id)) - Number(isOwned(a.id)) || a.name.localeCompare(b.name)
    if (sort.value === 'unowned') return Number(isOwned(a.id)) - Number(isOwned(b.id)) || a.name.localeCompare(b.name)
    if (sort.value === 'mastered') return Number(isMastered(b.id)) - Number(isMastered(a.id)) || a.name.localeCompare(b.name)
    return a.name.localeCompare(b.name)
  }))
  const reset = () => { query.value = ''; status.value = 'all'; rarity.value = 'all'; variant.value = 'all'; spriteType.value = 'all'; sort.value = 'az' }
  return { query, status, rarity, variant, spriteType, sort, rarities, variants, spriteTypes, filteredSprites, reset }
}
