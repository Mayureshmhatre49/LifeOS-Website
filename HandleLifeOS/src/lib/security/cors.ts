// CORS helpers for API routes.
// Internal routes (app API): restrict to own origin only.
// Public API (/api/v1/*): open CORS so third-party developers can call it.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app'

const ALLOWED_ORIGINS = new Set([
  APP_URL,
  'http://localhost:3000',
  'http://localhost:3001',
])

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false
  if (ALLOWED_ORIGINS.has(origin)) return true
  // Allow any subdomain of the production domain
  try {
    const url = new URL(APP_URL)
    return origin.endsWith('.' + url.hostname)
  } catch {
    return false
  }
}

// For internal API routes — strict same-origin only
export function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isAllowedOrigin(origin) ? origin! : APP_URL
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin',
  }
}

// For public API routes (/api/v1/*) — open to external developers
export function publicApiCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

// Returns a preflight 204 response
export function preflightResponse(headers: Record<string, string>): Response {
  return new Response(null, { status: 204, headers })
}
