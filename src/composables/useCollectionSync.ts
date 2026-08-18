import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import type { UserCollection } from '../types/sprite'
import { reportError } from '../services/errorManager'
import { createSyncCredentials, decodeSyncCode, encodeSyncCode, readSyncCredentials, storeSyncCredentials, syncCollection, type SyncCredentials } from '../services/collectionSync'
import { isSupabaseConfigured } from '../services/supabase'

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'offline' | 'synced' | 'conflict' | 'error'

export function useCollectionSync(collection: Ref<UserCollection>, replaceCollection: (next: UserCollection) => void) {
  const credentials = ref<SyncCredentials | undefined>(readSyncCredentials())
  const status = ref<SyncStatus>(credentials.value ? 'idle' : 'disabled')
  let timer: ReturnType<typeof setTimeout> | undefined
  let applyingRemoteCollection = false

  async function synchronize(): Promise<void> {
    if (!isSupabaseConfigured) { status.value = 'error'; return }
    credentials.value ??= createSyncCredentials()
    storeSyncCredentials(credentials.value)
    if (!navigator.onLine) { status.value = 'offline'; return }
    status.value = 'syncing'
    try {
      const result = await syncCollection(collection.value, credentials.value)
      credentials.value = result.credentials
      if (JSON.stringify(result.collection) !== JSON.stringify(collection.value)) {
        applyingRemoteCollection = true
        replaceCollection(result.collection)
        queueMicrotask(() => { applyingRemoteCollection = false })
      }
      status.value = result.conflict ? 'conflict' : 'synced'
    } catch (error) {
      status.value = navigator.onLine ? 'error' : 'offline'
      reportError(error, { category: navigator.onLine ? 'external_service' : 'network', context: { source: 'collection.sync' } })
    }
  }

  async function importSyncCode(code: string): Promise<void> {
    try {
      credentials.value = decodeSyncCode(code)
      storeSyncCredentials(credentials.value)
      await synchronize()
    } catch (error) {
      status.value = 'error'
      reportError(error, { category: 'validation', context: { source: 'collection.syncCode' } })
    }
  }

  watch(collection, () => {
    if (!credentials.value || applyingRemoteCollection) return
    clearTimeout(timer)
    timer = setTimeout(() => void synchronize(), 800)
  }, { deep: true })

  const handleOnline = () => { if (credentials.value) void synchronize() }
  window.addEventListener('online', handleOnline)
  onBeforeUnmount(() => { clearTimeout(timer); window.removeEventListener('online', handleOnline) })

  return {
    status,
    isConfigured: isSupabaseConfigured,
    hasSyncCode: () => Boolean(credentials.value),
    getSyncCode: () => credentials.value ? encodeSyncCode(credentials.value) : '',
    synchronize,
    importSyncCode,
  }
}
