import { describe, expect, it } from 'vitest'
import type { Sprite } from '../types/sprite'
import { mergeSpriteCatalog } from './spriteCatalog'

const sprite = (id: string, releaseStatus?: Sprite['releaseStatus']): Sprite => ({ id, slug: id, name: id, image: '', sourceUrl: '', releaseStatus })

describe('catalogue des esprits', () => {
  it('marque les ajouts comme nouveaux et conserve les absents comme archivés', () => {
    expect(mergeSpriteCatalog([sprite('old')], [sprite('new')])).toEqual([
      sprite('new', 'new'), sprite('old', 'archived'),
    ])
  })

  it('conserve les nouveaux lors d’un import identique', () => {
    expect(mergeSpriteCatalog([sprite('new', 'new')], [sprite('new')])).toEqual([sprite('new', 'new')])
  })

  it('archive l’ancienne vague quand une nouvelle arrive', () => {
    expect(mergeSpriteCatalog([sprite('first', 'new')], [sprite('first'), sprite('second')])).toEqual([
      sprite('first', 'archived'), sprite('second', 'new'),
    ])
  })
})
