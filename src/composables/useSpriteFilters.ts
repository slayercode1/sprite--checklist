import { computed, ref, type Ref } from 'vue'
import type { Sprite } from '../types/sprite'
import { rarityConfig } from '../config/rarities'
import { normalizeText } from '../utils/text'
import { localizeSpriteName } from '../utils/spriteNames'
export type StatusFilter = 'owned' | 'unowned' | 'mastered' | 'unmastered'
export type SortMode = 'az' | 'za' | 'rarity' | 'owned' | 'unowned' | 'mastered'
export function useSpriteFilters(sprites: Ref<Sprite[]>, isOwned: (id: string) => boolean, isMastered: (id: string) => boolean) {
  const query = ref(''), statuses = ref<StatusFilter[]>([]), rarity = ref('all'), variant = ref('all'), spriteType = ref('all'), sort = ref<SortMode>('az')
  const values = (key: 'rarity' | 'variant' | 'spriteType') => computed(() => [...new Set(sprites.value.map((sprite) => sprite[key]).filter(Boolean) as string[])].sort())
  const rarities = values('rarity'), variants = values('variant'), spriteTypes = values('spriteType')
  const matchesStatuses = (sprite: Sprite) => statuses.value.every((status) => {
    if (status === 'owned') return isOwned(sprite.id)
    if (status === 'unowned') return !isOwned(sprite.id)
    if (status === 'mastered') return isMastered(sprite.id)
    return !isMastered(sprite.id)
  })
  const filteredSprites = computed(() => [...sprites.value.filter((sprite) => {
    const searchableName = `${sprite.name} ${localizeSpriteName(sprite.name)}`
    return normalizeText(searchableName).includes(normalizeText(query.value)) && matchesStatuses(sprite) && (rarity.value === 'all' || sprite.rarity === rarity.value) && (variant.value === 'all' || sprite.variant === variant.value) && (spriteType.value === 'all' || sprite.spriteType === spriteType.value)
  })].sort((a, b) => {
    const localizedA = localizeSpriteName(a.name), localizedB = localizeSpriteName(b.name)
    if (sort.value === 'za') return localizedB.localeCompare(localizedA, 'fr')
    if (sort.value === 'rarity') return (rarityConfig[b.rarity ?? '']?.rank ?? 0) - (rarityConfig[a.rarity ?? '']?.rank ?? 0) || localizedA.localeCompare(localizedB, 'fr')
    if (sort.value === 'owned') return Number(isOwned(b.id)) - Number(isOwned(a.id)) || localizedA.localeCompare(localizedB, 'fr')
    if (sort.value === 'unowned') return Number(isOwned(a.id)) - Number(isOwned(b.id)) || localizedA.localeCompare(localizedB, 'fr')
    if (sort.value === 'mastered') return Number(isMastered(b.id)) - Number(isMastered(a.id)) || localizedA.localeCompare(localizedB, 'fr')
    return localizedA.localeCompare(localizedB, 'fr')
  }))
  const reset = () => { query.value = ''; statuses.value = []; rarity.value = 'all'; variant.value = 'all'; spriteType.value = 'all'; sort.value = 'az' }
  return { query, statuses, rarity, variant, spriteType, sort, rarities, variants, spriteTypes, filteredSprites, reset }
}
