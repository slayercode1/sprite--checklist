import type { UserCollection } from '../types/sprite'
import { isUserCollection } from '../composables/useSpriteCollection'
import { supabase } from './supabase'

export const SYNC_CREDENTIALS_STORAGE_KEY = 'sprite-checklist:sync:v1'

export interface SyncCredentials { id: string; secret: string; updatedAt?: string }
export interface SyncResult { collection: UserCollection; credentials: SyncCredentials; conflict: boolean }

interface SyncRow { collection: unknown; updated_at: string; conflict: boolean }

export function createSyncCredentials(): SyncCredentials {
  const secretBytes = crypto.getRandomValues(new Uint8Array(32))
  const secret = btoa(String.fromCharCode(...secretBytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
  return { id: crypto.randomUUID(), secret }
}

export function encodeSyncCode(credentials: SyncCredentials): string {
  return `${credentials.id}.${credentials.secret}`
}

export function decodeSyncCode(code: string): SyncCredentials {
  const [id, secret, extra] = code.trim().split('.')
  if (extra || !id || !secret || !/^[0-9a-f-]{36}$/i.test(id) || !/^[A-Za-z0-9_-]{43}$/.test(secret)) {
    throw new Error('Code de synchronisation invalide')
  }
  return { id, secret }
}

export function readSyncCredentials(): SyncCredentials | undefined {
  const raw = localStorage.getItem(SYNC_CREDENTIALS_STORAGE_KEY)
  if (!raw) return undefined
  try {
    const value = JSON.parse(raw) as Partial<SyncCredentials>
    if (typeof value.id !== 'string' || typeof value.secret !== 'string') return undefined
    return { id: value.id, secret: value.secret, updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined }
  } catch {
    return undefined
  }
}

export function storeSyncCredentials(credentials: SyncCredentials): void {
  localStorage.setItem(SYNC_CREDENTIALS_STORAGE_KEY, JSON.stringify(credentials))
}

export function clearSyncCredentials(): void {
  localStorage.removeItem(SYNC_CREDENTIALS_STORAGE_KEY)
}

export async function syncCollection(collection: UserCollection, credentials: SyncCredentials): Promise<SyncResult> {
  if (!supabase) throw new Error('Supabase n’est pas configuré')
  const { data, error } = await supabase.rpc('sync_sprite_collection', {
    p_sync_id: credentials.id,
    p_sync_secret: credentials.secret,
    p_collection: collection,
    p_base_updated_at: credentials.updatedAt ?? null,
  })
  if (error) throw error
  const row = (Array.isArray(data) ? data[0] : data) as SyncRow | undefined
  if (!row || !isUserCollection(row.collection) || typeof row.updated_at !== 'string') {
    throw new Error('Réponse de synchronisation invalide')
  }
  const nextCredentials = { ...credentials, updatedAt: row.updated_at }
  return { collection: row.collection, credentials: nextCredentials, conflict: Boolean(row.conflict) }
}
