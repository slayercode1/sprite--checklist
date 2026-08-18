import { defineComponent, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { UserCollection } from '../types/sprite'

const syncMocks = vi.hoisted(() => ({
  clear: vi.fn(),
  read: vi.fn(),
  store: vi.fn(),
  sync: vi.fn(),
}))

vi.mock('../services/supabase', () => ({ isSupabaseConfigured: true }))
vi.mock('../services/collectionSync', () => ({
  clearSyncCredentials: syncMocks.clear,
  createSyncCredentials: () => ({ id: 'new-id', secret: 'new-secret' }),
  decodeSyncCode: () => ({ id: 'imported-id', secret: 'imported-secret' }),
  encodeSyncCode: ({ id, secret }: { id: string; secret: string }) => `${id}.${secret}`,
  readSyncCredentials: syncMocks.read,
  storeSyncCredentials: syncMocks.store,
  syncCollection: syncMocks.sync,
}))

import { useCollectionSync } from './useCollectionSync'

describe('synchronisation automatique', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    syncMocks.read.mockReturnValue({ id: 'saved-id', secret: 'saved-secret', updatedAt: '2026-08-18T12:00:00Z' })
    syncMocks.sync.mockResolvedValue({
      collection: { '138': { owned: true, mastered: false } },
      credentials: { id: 'saved-id', secret: 'saved-secret', updatedAt: '2026-08-18T12:01:00Z' },
      conflict: true,
    })
  })

  it('récupère les données au démarrage lorsqu’un code est déjà relié', async () => {
    const collection = ref<UserCollection>({})
    const replaceCollection = vi.fn((next: UserCollection) => { collection.value = next })
    const component = defineComponent({ setup: () => useCollectionSync(collection, replaceCollection), template: '<div />' })

    const wrapper = mount(component)
    await flushPromises()

    expect(syncMocks.sync).toHaveBeenCalledOnce()
    expect(replaceCollection).toHaveBeenCalledWith({ '138': { owned: true, mastered: false } })
    wrapper.unmount()
  })

  it('retire uniquement la liaison locale', async () => {
    const collection = ref<UserCollection>({})
    let controls: ReturnType<typeof useCollectionSync> | undefined
    const component = defineComponent({ setup: () => { controls = useCollectionSync(collection, vi.fn()); return controls }, template: '<div />' })
    const wrapper = mount(component)
    await flushPromises()

    controls?.removeSyncCode()

    expect(syncMocks.clear).toHaveBeenCalledOnce()
    expect(controls?.status.value).toBe('disabled')
    expect(collection.value).toEqual({})
    wrapper.unmount()
  })
})
