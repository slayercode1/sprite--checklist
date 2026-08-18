import { computed } from 'vue'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Sprite } from '../types/sprite'
import { useSpriteFilters } from './useSpriteFilters'
const sprites = computed(() => [{ id: '1', slug: 'jose', name: 'José', image: '', sourceUrl: '' }, { id: '2', slug: 'batman', name: 'Batman', image: '', sourceUrl: '' }] satisfies Sprite[])
describe('filtres', () => {
  beforeEach(() => localStorage.clear())
  it('recherche sans tenir compte des accents ou de la casse', () => { const filters = useSpriteFilters(sprites, () => false, () => false); filters.query.value = 'JOSE'; expect(filters.filteredSprites.value.map((item: Sprite) => item.id)).toEqual(['1']) })
  it('combine plusieurs états de collection', () => {
    const filters = useSpriteFilters(sprites, (id) => id === '1', (id) => id === '1')
    filters.statuses.value = ['owned', 'mastered']
    expect(filters.filteredSprites.value.map((item: Sprite) => item.id)).toEqual(['1'])
  })
  it('recherche avec le nom français', () => {
    const frenchSprites = computed(() => [{ id: '3', slug: 'ghost', name: 'Ghost', image: '', sourceUrl: '' }] satisfies Sprite[])
    const filters = useSpriteFilters(frenchSprites, () => false, () => false)
    filters.query.value = 'fantome'
    expect(filters.filteredSprites.value[0]?.id).toBe('3')
  })
  it('restaure les filtres après un rechargement', async () => {
    const firstVisit = useSpriteFilters(sprites, () => false, () => false)
    firstVisit.query.value = 'Batman'
    firstVisit.statuses.value = ['unowned']
    firstVisit.sort.value = 'za'
    await Promise.resolve()

    const nextVisit = useSpriteFilters(sprites, () => false, () => false)
    expect(nextVisit.query.value).toBe('Batman')
    expect(nextVisit.statuses.value).toEqual(['unowned'])
    expect(nextVisit.sort.value).toBe('za')
  })
})
