import { describe, expect, it, vi } from 'vitest'
import { logImportError, sanitizeImportLog } from './errorLogger'

describe('logs de l’import', () => {
  it('masque les secrets par clé et dans les messages', () => {
    expect(sanitizeImportLog({ apiKey: 'private', message: 'Bearer hidden-token' })).toEqual({ apiKey: '[REDACTED]', message: 'Bearer [REDACTED]' })
  })

  it('émet un log JSON structuré avec un identifiant', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const errorId = logImportError(new Error('timeout'), { step: 'detail' })
    const report = JSON.parse(String(consoleError.mock.calls[0]?.[0])) as Record<string, unknown>
    expect(report.errorId).toBe(errorId)
    expect(report.errorCode).toBe('SPRITE_IMPORT_ERROR')
    consoleError.mockRestore()
  })
})
