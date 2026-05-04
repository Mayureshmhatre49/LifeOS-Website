// Thin wrapper — keeps Sentry calls isolated so the rest of the codebase
// doesn't need to import @sentry/nextjs directly.
import * as Sentry from '@sentry/nextjs'

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureException(error, { extra: context })
  } else {
    console.error('[error]', error, context)
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureMessage(message, level)
  }
}

export function setUser(user: { id: string; email?: string } | null) {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setUser(user)
  }
}
