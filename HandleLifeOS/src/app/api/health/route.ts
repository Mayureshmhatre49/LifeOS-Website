import { NextResponse } from 'next/server'
import { isSupabaseConfigured } from '@/lib/db/client'
import { Redis } from '@upstash/redis'

interface HealthChecks {
  uptime: number
  timestamp: string
  database: string
  redis: string
  ai: { configured: boolean }
  latency_ms: number
}

export async function GET() {
  const start = Date.now()

  const checks: Partial<HealthChecks> = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    // NODE_ENV intentionally omitted — reduces information disclosure
  }

  // 1. Database Check (Supabase)
  try {
    checks.database = isSupabaseConfigured() ? 'configured' : 'missing'
  } catch {
    checks.database = 'error'
  }

  // 2. Redis Check (Upstash)
  try {
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (upstashUrl && upstashToken) {
      const redis = new Redis({ url: upstashUrl, token: upstashToken })
      const ping = await redis.ping()
      checks.redis = ping === 'PONG' ? 'healthy' : 'unhealthy'
    } else {
      checks.redis = 'not_configured'
    }
  } catch {
    checks.redis = 'error'
  }

  // 3. AI Provider — report only whether any provider is configured, not which one
  checks.ai = {
    configured: !!(
      process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.GOOGLE_GEMINI_API_KEY
    ),
  }

  const duration = Date.now() - start
  checks.latency_ms = duration

  const isHealthy = checks.database !== 'error' && checks.redis !== 'error'
  
  return NextResponse.json(
    { 
      status: isHealthy ? 'healthy' : 'degraded',
      ...checks 
    },
    { status: isHealthy ? 200 : 503 }
  )
}
