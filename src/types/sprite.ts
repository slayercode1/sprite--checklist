export interface DropChance { source: string; chance: number | string }
export interface Sprite {
  id: string; slug: string; name: string; image: string; rarity?: string; percentage?: number
  spriteType?: string; variant?: string; description?: string; location?: string; summonCost?: number
  dropChances?: DropChance[]; sourceUrl: string; releaseStatus?: SpriteReleaseStatus
}
export type SpriteReleaseStatus = 'new' | 'available' | 'archived'
export interface SpriteUserState { owned: boolean; mastered: boolean }
export type UserCollection = Record<string, SpriteUserState>
export type ViewMode = 'grid' | 'list'
