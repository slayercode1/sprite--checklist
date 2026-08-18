import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { UserCollection } from '../types/sprite'
import { reportError } from '../services/errorManager'
import { clearSyncCredentials, createSyncCredentials, decodeSyncCode, encodeSyncCode, readSyncCredentials, storeSyncCredentials, syncCollection, type SyncCredentials } from '../services/collectionSync'
import { isSupabaseConfigured } from '../services/supabase'

export type SyncStatus = 'disabled' | 'idle' | 'syncing' | 'offline' | 'synced' | 'conflict' | 'error'

export function useCollectionSync(collection: Ref<UserCollection>, replaceCollection: (next: UserCollection) => void) {
  const credentials = ref<SyncCredentials | undefined>(readSyncCredentials())
  const status = ref<SyncStatus>(credentials.value ? 'idle' : 'disabled')
  let debounceTimer: ReturnType<typeof setTimeout> | undefined
  let pollingTimer: ReturnType<typeof setInterval> | undefined
  let applyingRemoteCollection = false
  let hasPendingLocalChanges = false
  let connectionVersion = 0
  let syncInProgress: Promise<void> | undefined
  let syncQueued = false

  async function performSync(): Promise<void> {
    if (!isSupabaseConfigured) { status.value = 'error'; return }
    credentials.value ??= createSyncCredentials()
    storeSyncCredentials(credentials.value)
    if (!navigator.onLine) { status.value = 'offline'; return }
    const requestVersion = connectionVersion
    const localSnapshot = JSON.stringify(collection.value)
    status.value = 'syncing'
    try {
      const result = await syncCollection(collection.value, credentials.value)
      if (requestVersion !== connectionVersion) return
      credentials.value = result.credentials
      storeSyncCredentials(result.credentials)
      const localChangedDuringRequest = JSON.stringify(collection.value) !== localSnapshot
      if (localChangedDuringRequest) {
        syncQueued = true
      } else if (result.conflict && hasPendingLocalChanges) {
        syncQueued = true
      } else if (JSON.stringify(result.collection) !== localSnapshot) {
        applyingRemoteCollection = true
        replaceCollection(result.collection)
        queueMicrotask(() => { applyingRemoteCollection = false })
      }
      if (!syncQueued) hasPendingLocalChanges = false
      status.value = result.conflict ? 'conflict' : 'synced'
    } catch (error) {
      status.value = navigator.onLine ? 'error' : 'offline'
      reportError(error, { category: navigator.onLine ? 'external_service' : 'network', context: { source: 'collection.sync' } })
    }
  }

  function synchronize(): Promise<void> {
    if (syncInProgress) { syncQueued = true; return syncInProgress }
    syncInProgress = performSync().finally(() => {
      syncInProgress = undefined
      if (syncQueued) { syncQueued = false; void synchronize() }
    })
    return syncInProgress
  }

  async function importSyncCode(code: string): Promise<void> {
    try {
      const candidate = decodeSyncCode(code)
      if (!isSupabaseConfigured) throw new Error('Supabase n’est pas configuré')
      const importVersion = ++connectionVersion
      status.value = 'syncing'
      const result = await syncCollection(collection.value, candidate)
      if (importVersion !== connectionVersion) return
      credentials.value = result.credentials
      storeSyncCredentials(result.credentials)
      hasPendingLocalChanges = false
      applyingRemoteCollection = true
      replaceCollection(result.collection)
      queueMicrotask(() => { applyingRemoteCollection = false })
      status.value = 'synced'
    } catch (error) {
      status.value = 'error'
      reportError(error, { category: 'validation', context: { source: 'collection.syncCode' } })
    }
  }

  function removeSyncCode(): void {
    connectionVersion += 1
    syncQueued = false
    credentials.value = undefined
    hasPendingLocalChanges = false
    clearSyncCredentials()
    status.value = 'disabled'
  }

  watch(collection, () => {
    if (!credentials.value || applyingRemoteCollection) return
    hasPendingLocalChanges = true
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => void synchronize(), 800)
  }, { deep: true })

  const handleOnline = () => { if (credentials.value) void synchronize() }
  const handleVisibility = () => { if (document.visibilityState === 'visible' && credentials.value) void synchronize() }
  window.addEventListener('online', handleOnline)
  document.addEventListener('visibilitychange', handleVisibility)
  onMounted(() => {
    if (credentials.value) void synchronize()
    pollingTimer = setInterval(() => { if (credentials.value && document.visibilityState === 'visible') void synchronize() }, 30_000)
  })
  onBeforeUnmount(() => {
    clearTimeout(debounceTimer)
    clearInterval(pollingTimer)
    window.removeEventListener('online', handleOnline)
    document.removeEventListener('visibilitychange', handleVisibility)
  })

  return {
    status,
    isConfigured: isSupabaseConfigured,
    hasSyncCode: () => Boolean(credentials.value),
    getSyncCode: () => credentials.value ? encodeSyncCode(credentials.value) : '',
    synchronize,
    importSyncCode,
    removeSyncCode,
  }
}
