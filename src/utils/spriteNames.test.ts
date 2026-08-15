import { describe, expect, it } from 'vitest'
import { localizeSpriteName } from './spriteNames'

describe('noms français des sprites', () => {
  it('traduit un nom simple', () => expect(localizeSpriteName('Ghost')).toBe('Fantôme'))
  it('place la variante traduite après le nom', () => expect(localizeSpriteName('Gold Water')).toBe('Eau doré'))
  it('conserve les noms propres', () => expect(localizeSpriteName('Batman')).toBe('Batman'))
})
