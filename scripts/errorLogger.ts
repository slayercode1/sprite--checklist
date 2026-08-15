import { randomUUID } from 'node:crypto'

const SENSITIVE_KEY = /authorization|cookie|password|passwd|secret|token|api[-_]?key|session/i
const sanitizeString = (value: string) => value.replace(/(bearer\s+)[^\s,;]+|((?:password|secret|token|api[-_]?key)\s*[=:]\s*)[^\s,;]+/gi, (_match, bearerPrefix: string | undefined, credentialPrefix: string | undefined) => `${bearerPrefix ?? credentialPrefix ?? ''}[REDACTED]`).slice(0, 500)

export const createImportErrorId = () => `ERR-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().slice(0, 8).toUpperCase()}`

export function sanitizeImportLog(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[TRUNCATED]'
  if (value instanceof Error) return { name: value.name, message: sanitizeString(value.message), stack: value.stack?.split('\n').slice(0, 8).map(sanitizeString).join('\n') }
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeImportLog(item, depth + 1))
  if (!value || typeof value !== 'object') return typeof value === 'string' ? sanitizeString(value) : value
  return Object.fromEntries(Object.entries(value).slice(0, 30).map(([key, item]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitizeImportLog(item, depth + 1)]))
}

export function logImportError(error: unknown, context: Record<string, unknown>) {
  const errorId = createImportErrorId()
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', errorId, correlationId: errorId, errorCode: 'SPRITE_IMPORT_ERROR', service: 'sprite-import', error: sanitizeImportLog(error), context: sanitizeImportLog(context) }))
  return errorId
}
