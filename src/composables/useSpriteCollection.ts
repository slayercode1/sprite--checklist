import { computed } from 'vue'
import type { SpriteUserState, UserCollection } from '../types/sprite'
import { useLocalStorage } from './useLocalStorage'
export const COLLECTION_STORAGE_KEY = 'sprite-checklist:v1'
const collection = useLocalStorage<UserCollection>(COLLECTION_STORAGE_KEY, {})
const stateFor = (id: string): SpriteUserState => collection.value[id] ?? { owned: false, mastered: false }
export function useSpriteCollection() {
  const isOwned = (id: string) => stateFor(id).owned
  const isMastered = (id: string) => stateFor(id).mastered
  const toggleOwned = (id: string) => { collection.value[id] = { ...stateFor(id), owned: !isOwned(id) } }
  const toggleMastered = (id: string) => { collection.value[id] = { ...stateFor(id), mastered: !isMastered(id) } }
  const replaceCollection = (next: UserCollection) => { collection.value = next }
  const resetCollection = () => { collection.value = {} }
  const ownedCount = computed(() => Object.values(collection.value).filter((item) => item.owned).length)
  const masteredCount = computed(() => Object.values(collection.value).filter((item) => item.mastered).length)
  return { collection, isOwned, isMastered, toggleOwned, toggleMastered, replaceCollection, resetCollection, ownedCount, masteredCount }
}
export function isUserCollection(value: unknown): value is UserCollection {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.entries(value).every(([id, state]) => /^\d+$/.test(id) && !!state && typeof state === 'object' && typeof (state as SpriteUserState).owned === 'boolean' && typeof (state as SpriteUserState).mastered === 'boolean')
}
