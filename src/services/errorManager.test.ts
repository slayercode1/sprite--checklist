import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearErrorDeduplication, definitionForStatus, errorDefinitions, reportError, sanitizeForLog, setErrorReporter, subscribeToErrors, type ErrorReport } from './errorManager'

describe('gestion centralisée des erreurs', () => {
  beforeEach(() => { clearErrorDeduplication(); setErrorReporter(); vi.restoreAllMocks() })

  it.each([[404, 'RESOURCE_NOT_FOUND'], [409, 'RESOURCE_CONFLICT'], [422, 'VALIDATION_ERROR'], [429, 'RATE_LIMITED'], [500, 'INTERNAL_ERROR'], [502, 'EXTERNAL_SERVICE_ERROR'], [503, 'SERVICE_UNAVAILABLE'], [504, 'REQUEST_TIMEOUT']])('normalise HTTP %i', (status, code) => expect(definitionForStatus(status).code).toBe(code))

  it('masque récursivement les données sensibles', () => {
    expect(sanitizeForLog({ password: 'secret', nested: { accessToken: 'token', safe: 'Bearer private-value' } })).toEqual({ password: '[REDACTED]', nested: { accessToken: '[REDACTED]', safe: 'Bearer [REDACTED]' } })
  })

  it('génère et propage des identifiants sans exposer le message brut', () => {
    let captured: ErrorReport | undefined
    setErrorReporter({ capture: (report) => { captured = report } })
    const result = reportError(new Error('database password leaked'), { correlationId: 'REQ-TEST', notify: false })
    expect(result.error.errorId).toMatch(/^ERR-\d{8}-[A-F0-9]{8}$/)
    expect(result.error.message).not.toContain('database')
    expect(captured?.correlationId).toBe('REQ-TEST')
  })

  it('déduplique les notifications identiques', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const notifications: string[] = [], unsubscribe = subscribeToErrors((item) => notifications.push(item.code))
    reportError(new Error('first')); reportError(new Error('second'))
    expect(notifications).toEqual([errorDefinitions.internal.code])
    unsubscribe()
  })
})
