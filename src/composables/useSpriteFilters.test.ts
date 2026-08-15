import { computed } from 'vue'
import { describe, expect, it } from 'vitest'
import type { Sprite } from '../types/sprite'
import { useSpriteFilters } from './useSpriteFilters'
const sprites = computed(() => [{ id: '1', slug: 'jose', name: 'José', image: '', sourceUrl: '' }, { id: '2', slug: 'batman', name: 'Batman', image: '', sourceUrl: '' }] satisfies Sprite[])
describe('filtres', () => {
  it('recherche sans tenir compte des accents ou de la casse', () => { const filters = useSpriteFilters(sprites, () => false, () => false); filters.query.value = 'JOSE'; expect(filters.filteredSprites.value.map((item: Sprite) => item.id)).toEqual(['1']) })
  it('filtre les états possédé et maîtrisé', () => { const filters = useSpriteFilters(sprites, (id) => id === '1', (id) => id === '2'); filters.status.value = 'owned'; expect(filters.filteredSprites.value[0]?.id).toBe('1'); filters.status.value = 'mastered'; expect(filters.filteredSprites.value[0]?.id).toBe('2') })
})
