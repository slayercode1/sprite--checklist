import { beforeEach, describe, expect, it } from 'vitest'
import { clearSyncCredentials, createSyncCredentials, decodeSyncCode, encodeSyncCode, readSyncCredentials, storeSyncCredentials } from './collectionSync'

describe('code de synchronisation', () => {
  beforeEach(() => localStorage.clear())

  it('génère un code secret importable', () => {
    const credentials = createSyncCredentials()
    const code = encodeSyncCode(credentials)

    expect(credentials.secret).toMatch(/^[A-Za-z0-9_-]{43}$/)
    expect(decodeSyncCode(code)).toEqual(credentials)
  })

  it('refuse les codes incomplets', () => {
    expect(() => decodeSyncCode('pas-un-code')).toThrow('Code de synchronisation invalide')
  })

  it('persiste la date de dernière synchronisation', () => {
    const credentials = { ...createSyncCredentials(), updatedAt: '2026-08-18T12:00:00.000Z' }
    storeSyncCredentials(credentials)

    expect(readSyncCredentials()).toEqual(credentials)
  })

  it('retire le code de cet appareil', () => {
    storeSyncCredentials(createSyncCredentials())
    clearSyncCredentials()

    expect(readSyncCredentials()).toBeUndefined()
  })
})
