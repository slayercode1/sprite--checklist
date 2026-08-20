import { computed, type Ref } from 'vue'
import type { Sprite } from '../types/sprite'
import { rarityConfig } from '../config/rarities'
import { normalizeText } from '../utils/text'
import { localizeSpriteName } from '../utils/spriteNames'
import { compareSpriteReleaseStatus, spriteReleaseStatus } from '../utils/spriteCatalog'
import { useLocalStorage } from './useLocalStorage'
export type StatusFilter = 'new' | 'archived' | 'owned' | 'unowned' | 'mastered' | 'unmastered'
export type SortMode = 'az' | 'za' | 'rarity' | 'owned' | 'unowned' | 'mastered'
interface SpriteFiltersState { query: string; statuses: StatusFilter[]; rarity: string; variant: string; spriteType: string; sort: SortMode }
export const FILTERS_STORAGE_KEY = 'sprite-checklist:filters:v1'
const defaultFilters = (): SpriteFiltersState => ({ query: '', statuses: [], rarity: 'all', variant: 'all', spriteType: 'all', sort: 'az' })
export function useSpriteFilters(sprites: Ref<Sprite[]>, isOwned: (id: string) => boolean, isMastered: (id: string) => boolean) {
  const persisted = useLocalStorage<SpriteFiltersState>(FILTERS_STORAGE_KEY, defaultFilters())
  const field = <Key extends keyof SpriteFiltersState>(key: Key) => computed({ get: () => persisted.value[key], set: (value: SpriteFiltersState[Key]) => { persisted.value[key] = value } })
  const query = field('query'), statuses = field('statuses'), rarity = field('rarity'), variant = field('variant'), spriteType = field('spriteType'), sort = field('sort')
  const values = (key: 'rarity' | 'variant' | 'spriteType') => computed(() => [...new Set(sprites.value.map((sprite) => sprite[key]).filter(Boolean) as string[])].sort())
  const rarities = values('rarity'), variants = values('variant'), spriteTypes = values('spriteType')
  const matchesStatuses = (sprite: Sprite) => statuses.value.every((status) => {
    if (status === 'new') return spriteReleaseStatus(sprite) === 'new'
    if (status === 'archived') return spriteReleaseStatus(sprite) === 'archived'
    if (status === 'owned') return isOwned(sprite.id)
    if (status === 'unowned') return !isOwned(sprite.id)
    if (status === 'mastered') return isMastered(sprite.id)
    return !isMastered(sprite.id)
  })
  const filteredSprites = computed(() => [...sprites.value.filter((sprite) => {
    const searchableName = `${sprite.name} ${localizeSpriteName(sprite.name)}`
    return normalizeText(searchableName).includes(normalizeText(query.value)) && matchesStatuses(sprite) && (rarity.value === 'all' || sprite.rarity === rarity.value) && (variant.value === 'all' || sprite.variant === variant.value) && (spriteType.value === 'all' || sprite.spriteType === spriteType.value)
  })].sort((a, b) => {
    const releaseOrder = compareSpriteReleaseStatus(a, b)
    if (releaseOrder) return releaseOrder
    const localizedA = localizeSpriteName(a.name), localizedB = localizeSpriteName(b.name)
    if (sort.value === 'za') return localizedB.localeCompare(localizedA, 'fr')
    if (sort.value === 'rarity') return (rarityConfig[b.rarity ?? '']?.rank ?? 0) - (rarityConfig[a.rarity ?? '']?.rank ?? 0) || localizedA.localeCompare(localizedB, 'fr')
    if (sort.value === 'owned') return Number(isOwned(b.id)) - Number(isOwned(a.id)) || localizedA.localeCompare(localizedB, 'fr')
    if (sort.value === 'unowned') return Number(isOwned(a.id)) - Number(isOwned(b.id)) || localizedA.localeCompare(localizedB, 'fr')
    if (sort.value === 'mastered') return Number(isMastered(b.id)) - Number(isMastered(a.id)) || localizedA.localeCompare(localizedB, 'fr')
    return localizedA.localeCompare(localizedB, 'fr')
  }))
  const reset = () => { persisted.value = defaultFilters() }
  return { query, statuses, rarity, variant, spriteType, sort, rarities, variants, spriteTypes, filteredSprites, reset }
}
