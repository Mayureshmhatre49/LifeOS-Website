/**
 * Telemetry Utility for Life OS
 * Tracks AI performance, latency, and cost metrics.
 */
import * as Sentry from '@sentry/nextjs'

interface AiMetrics {
  provider: string
  model: string
  durationMs: number
  inputTokens?: number
  outputTokens?: number
  success: boolean
  error?: string
  path: string
}

export function trackAiMetrics(metrics: AiMetrics) {
  const totalTokens = (metrics.inputTokens ?? 0) + (metrics.outputTokens ?? 0)

  // 1. Log to Sentry as Breadcrumb
  Sentry.addBreadcrumb({
    category: 'ai.performance',
    message: `AI Request: ${metrics.provider}/${metrics.model} - ${metrics.durationMs}ms`,
    level: metrics.success ? 'info' : 'error',
    data: {
      ...metrics,
      totalTokens,
    },
  })

  // 2. Capture as Sentry Event if it failed
  if (!metrics.success) {
    Sentry.captureMessage(`AI Provider Error: ${metrics.provider}`, {
      level: 'error',
      extra: { ...metrics },
    })
  }

  // 3. Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.info(`[Telemetry] AI ${metrics.success ? 'Success' : 'Fail'} | ${metrics.durationMs}ms | ${metrics.provider} | ${totalTokens} tokens`)
  }
}

/**
 * Wraps a promise to track its duration
 */
export async function withLatency<T>(promise: Promise<T>): Promise<[T, number]> {
  const start = Date.now()
  const result = await promise
  const duration = Date.now() - start
  return [result, duration]
}
