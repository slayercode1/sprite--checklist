import { inject, provide, type InjectionKey } from 'vue'
import type { useCollectionSync } from './useCollectionSync'

export type CollectionSyncControls = ReturnType<typeof useCollectionSync>

const collectionSyncKey: InjectionKey<CollectionSyncControls> = Symbol('collection-sync')

export function provideCollectionSync(sync: CollectionSyncControls): void {
  provide(collectionSyncKey, sync)
}

export function useProvidedCollectionSync(): CollectionSyncControls {
  const sync = inject(collectionSyncKey)
  if (!sync) throw new Error('Le service de synchronisation n’est pas disponible')
  return sync
}
