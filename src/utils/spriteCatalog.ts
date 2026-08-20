import type { Sprite, SpriteReleaseStatus } from '../types/sprite'

const statusRank: Record<SpriteReleaseStatus, number> = { new: 0, available: 1, archived: 2 }

export function spriteReleaseStatus(sprite: Sprite): SpriteReleaseStatus {
  return sprite.releaseStatus ?? 'available'
}

export function compareSpriteReleaseStatus(a: Sprite, b: Sprite) {
  return statusRank[spriteReleaseStatus(a)] - statusRank[spriteReleaseStatus(b)]
}

export function mergeSpriteCatalog(previous: Sprite[], imported: Sprite[]): Sprite[] {
  const importedIds = new Set(imported.map((sprite) => sprite.id))
  const previousById = new Map(previous.map((sprite) => [sprite.id, sprite]))
  const addedIds = new Set(imported.filter((sprite) => !previousById.has(sprite.id)).map((sprite) => sprite.id))
  const hasNewWave = addedIds.size > 0

  const current = imported.map((sprite) => {
    const previousSprite = previousById.get(sprite.id)
    const releaseStatus = addedIds.has(sprite.id)
      ? 'new'
      : hasNewWave
        ? 'archived'
        : spriteReleaseStatus(previousSprite ?? sprite)
    return { ...sprite, releaseStatus } satisfies Sprite
  })
  const archived = previous
    .filter((sprite) => !importedIds.has(sprite.id))
    .map((sprite) => ({ ...sprite, releaseStatus: 'archived' as const }))

  return [...current, ...archived]
}
