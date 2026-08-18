import { describe, expect, it } from 'vitest'
import { localizeSpriteName, localizeSpriteType, localizeSpriteVariant } from './spriteNames'

describe('noms français des sprites', () => {
  it('traduit un nom simple', () => expect(localizeSpriteName('Ghost')).toBe('Esprit fantôme'))
  it('place la variante traduite après le nom', () => expect(localizeSpriteName('Gold Water')).toBe('Esprit d’eau doré'))
  it('conserve les noms propres', () => expect(localizeSpriteName('Batman')).toBe('Batman'))
  it('traduit les types de filtre', () => expect(localizeSpriteType('Zero Point')).toBe('Esprit du Point zéro'))
  it('traduit les variantes de filtre', () => expect(localizeSpriteVariant('gold')).toBe('Doré'))
  it('conserve le nom Fortnite Holofoil', () => {
    expect(localizeSpriteVariant('holofoil')).toBe('Holofoil')
    expect(localizeSpriteName('Holofoil Water')).toBe('Esprit d’eau Holofoil')
  })
})
