import { beforeEach, describe, expect, it } from 'vitest'

describe('collection utilisateur', () => {
  beforeEach(() => { localStorage.clear(); sessionStorage.clear(); vi.resetModules() })
  it('bascule les états indépendamment et les persiste', async () => {
    const { useSpriteCollection } = await import('./useSpriteCollection')
    const collection = useSpriteCollection()
    collection.toggleOwned('138'); collection.toggleMastered('138')
    await Promise.resolve()
    expect(collection.isOwned('138')).toBe(true)
    expect(collection.isMastered('138')).toBe(true)
    expect(JSON.parse(localStorage.getItem('sprite-checklist:v1') ?? '{}')['138']).toEqual({ owned: true, mastered: true })
  })
})
