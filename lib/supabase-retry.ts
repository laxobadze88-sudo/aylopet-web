/**
 * Retry logic for Supabase fetch operations.
 * Handles AuthRetryableFetchError and transient network failures.
 */

const DEFAULT_MAX_RETRIES = 2
const DEFAULT_DELAY_MS = 1000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as { name?: string; message?: string }
  return e.name === 'AbortError' || (e.message ?? '').toLowerCase().includes('aborted')
}

function isRetryableError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  if (isAbortError(err)) return false
  const msg = String((err as { message?: string }).message ?? '').toLowerCase()
  return (
    msg.includes('fetch') ||
    msg.includes('network') ||
    msg.includes('retryable') ||
    msg.includes('timeout') ||
    msg.includes('econnreset') ||
    msg.includes('enotfound')
  )
}

/**
 * Wraps a Supabase promise with retry logic.
 * Retries on AuthRetryableFetchError or fetch/network errors.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; delayMs?: number }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? DEFAULT_MAX_RETRIES
  const delayMs = options?.delayMs ?? DEFAULT_DELAY_MS
  let lastError: unknown
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (isAbortError(err)) throw err
      if (attempt < maxRetries && isRetryableError(err)) {
        await sleep(delayMs * (attempt + 1))
      } else {
        throw err
      }
    }
  }
  throw lastError
}
