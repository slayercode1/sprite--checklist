export type ErrorCategory = 'validation' | 'authentication' | 'authorization' | 'not_found' | 'conflict' | 'rate_limit' | 'unavailable' | 'external_service' | 'network' | 'timeout' | 'internal'
export type LogLevel = 'info' | 'warn' | 'error'
export interface AppErrorDefinition { category: ErrorCategory; httpStatus: number; code: string; userMessage: string; level: LogLevel; retryable: boolean }
export interface ErrorNotification { errorId: string; code: string; message: string; retryable: boolean; severity: LogLevel }
export interface ErrorReport { timestamp: string; level: LogLevel; errorId: string; correlationId: string; errorCode: string; category: ErrorCategory; context?: Record<string, unknown>; technicalMessage?: string; stack?: string }
export interface ErrorReporter { capture(report: ErrorReport): void | Promise<void> }
const DEFINITIONS: Record<ErrorCategory, AppErrorDefinition> = {
  validation: { category: 'validation', httpStatus: 422, code: 'VALIDATION_ERROR', userMessage: 'Certaines informations sont incorrectes. Vérifiez les champs indiqués.', level: 'info', retryable: false },
  authentication: { category: 'authentication', httpStatus: 401, code: 'AUTHENTICATION_REQUIRED', userMessage: 'Votre session a expiré. Veuillez vous reconnecter.', level: 'info', retryable: false },
  authorization: { category: 'authorization', httpStatus: 403, code: 'ACCESS_DENIED', userMessage: 'Vous n’avez pas les droits nécessaires pour effectuer cette action.', level: 'warn', retryable: false },
  not_found: { category: 'not_found', httpStatus: 404, code: 'RESOURCE_NOT_FOUND', userMessage: 'L’élément demandé est introuvable ou n’est plus disponible.', level: 'info', retryable: false },
  conflict: { category: 'conflict', httpStatus: 409, code: 'RESOURCE_CONFLICT', userMessage: 'Cette modification entre en conflit avec une action récente. Actualisez puis réessayez.', level: 'warn', retryable: true },
  rate_limit: { category: 'rate_limit', httpStatus: 429, code: 'RATE_LIMITED', userMessage: 'Trop de tentatives ont été effectuées. Patientez quelques instants puis réessayez.', level: 'warn', retryable: true },
  unavailable: { category: 'unavailable', httpStatus: 503, code: 'SERVICE_UNAVAILABLE', userMessage: 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.', level: 'error', retryable: true },
  external_service: { category: 'external_service', httpStatus: 502, code: 'EXTERNAL_SERVICE_ERROR', userMessage: 'Un service nécessaire ne répond pas. Veuillez réessayer dans quelques instants.', level: 'error', retryable: true },
  network: { category: 'network', httpStatus: 503, code: 'NETWORK_ERROR', userMessage: 'La connexion a échoué. Vérifiez votre connexion puis réessayez.', level: 'warn', retryable: true },
  timeout: { category: 'timeout', httpStatus: 504, code: 'REQUEST_TIMEOUT', userMessage: 'L’opération a pris trop de temps. Veuillez réessayer.', level: 'warn', retryable: true },
  internal: { category: 'internal', httpStatus: 500, code: 'INTERNAL_ERROR', userMessage: 'Une erreur inattendue est survenue.', level: 'error', retryable: true },
}
const SENSITIVE_KEY = /authorization|cookie|password|passwd|secret|token|api[-_]?key|session|credit|card|document/i
const sanitizeString = (value: string) => value.replace(/(bearer\s+)[^\s,;]+|((?:password|secret|token|api[-_]?key)\s*[=:]\s*)[^\s,;]+/gi, (_match, bearerPrefix: string | undefined, credentialPrefix: string | undefined) => `${bearerPrefix ?? credentialPrefix ?? ''}[REDACTED]`).slice(0, 500)
const listeners = new Set<(notification: ErrorNotification) => void>()
const recentNotifications = new Map<string, number>()
let reporter: ErrorReporter | undefined
export const definitionForStatus = (status: number) => { const category: ErrorCategory = status === 401 ? 'authentication' : status === 403 ? 'authorization' : status === 404 ? 'not_found' : status === 409 ? 'conflict' : status === 422 ? 'validation' : status === 429 ? 'rate_limit' : status === 502 ? 'external_service' : status === 503 ? 'unavailable' : status === 504 ? 'timeout' : 'internal'; return DEFINITIONS[category] }
export function sanitizeForLog(value: unknown, depth = 0): unknown {
  if (depth > 4) return '[TRUNCATED]'
  if (value instanceof Error) return { name: value.name, message: sanitizeString(value.message) }
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitizeForLog(item, depth + 1))
  if (!value || typeof value !== 'object') return typeof value === 'string' ? sanitizeString(value) : value
  return Object.fromEntries(Object.entries(value).slice(0, 30).map(([key, item]) => [key, SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitizeForLog(item, depth + 1)]))
}
export const createIncidentId = (prefix = 'ERR') => `${prefix}-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
export const setErrorReporter = (nextReporter?: ErrorReporter) => { reporter = nextReporter }
export const subscribeToErrors = (listener: (notification: ErrorNotification) => void) => { listeners.add(listener); return () => listeners.delete(listener) }
export function reportError(error: unknown, options: { category?: ErrorCategory; context?: Record<string, unknown>; correlationId?: string; notify?: boolean } = {}) {
  const definition = DEFINITIONS[options.category ?? classifyError(error)], errorId = createIncidentId(), correlationId = options.correlationId ?? createIncidentId('REQ')
  const report: ErrorReport = { timestamp: new Date().toISOString(), level: definition.level, errorId, correlationId, errorCode: definition.code, category: definition.category, context: sanitizeForLog(options.context) as Record<string, unknown> }
  if (import.meta.env.DEV) { report.technicalMessage = sanitizeForLog(error instanceof Error ? error.message : String(error)) as string; report.stack = error instanceof Error ? sanitizeForLog(error.stack) as string : undefined }
  try { reporter?.capture(report) ?? console.error(JSON.stringify(report)) } catch { console.error(JSON.stringify({ timestamp: report.timestamp, level: 'error', errorId, errorCode: definition.code })) }
  if (options.notify !== false) notifyOnce({ errorId, code: definition.code, message: `${definition.userMessage} Référence : ${errorId}.`, retryable: definition.retryable, severity: definition.level })
  return { success: false as const, error: { code: definition.code, message: definition.userMessage, errorId }, report }
}
function classifyError(error: unknown): ErrorCategory { if (error instanceof DOMException && error.name === 'TimeoutError') return 'timeout'; if (error instanceof TypeError && /fetch|network|load failed/i.test(error.message)) return 'network'; return 'internal' }
function notifyOnce(notification: ErrorNotification) { const now = Date.now(), previous = recentNotifications.get(notification.code) ?? 0; if (now - previous < 5_000) return; recentNotifications.set(notification.code, now); listeners.forEach((listener) => listener(notification)) }
export const errorDefinitions = DEFINITIONS
export const clearErrorDeduplication = () => recentNotifications.clear()
