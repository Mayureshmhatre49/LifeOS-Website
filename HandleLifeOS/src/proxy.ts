import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ── Public paths (no auth required) ──────────────────────────────────────────
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/docs',
  // Chat — guest mode allowed
  '/chat',
  // Public API
  '/api/auth',
  '/api/health',
  '/api/v1',
  '/api/webhooks',
  '/api/billing/plans',
  // Static / SEO
  '/_next',
  '/favicon.ico',
  '/og.png',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
  '/opengraph-image',
  // PWA — service worker + offline fallback must be public
  '/sw.js',
  '/offline',
  '/icons',
  // Public tool landing pages (SEO)
  '/daily-planner',
  '/ai-task-planner',
  '/routine-builder',
  '/focus-timer',
  '/pomodoro-ai',
  '/body-doubling',
  '/beat-procrastination',
  '/family-planner',
  '/shared-grocery-list',
  '/family-task-manager',
  '/elder-reminder-app',
  '/home-organization-ai',
  '/emi-calculator',
  '/loan-comparison',
  '/budget-planner',
  '/subscription-checker',
  '/can-i-afford-this',
  '/scam-checker',
  '/is-this-a-scam',
  '/quote-checker',
  '/contract-simplifier',
  '/negotiation-coach',
]

// ── Max body size at edge (1 MB) ──────────────────────────────────────────────
const MAX_BODY_BYTES = 1024 * 1024

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/') || pathname.startsWith(p + '?')
  )
}

// ── Build a per-request CSP header with a fresh nonce ─────────────────────────
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  const directives = [
    "default-src 'self'",

    // nonce allows inline Next.js scripts; strict-dynamic propagates trust.
    // unsafe-eval only in dev (React error overlay needs it).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''} https://checkout.razorpay.com`,

    // style-src: nonce replaces unsafe-inline in production.
    // In dev, we allow unsafe-inline for Turbopack/Next.js HMR styles.
    `style-src 'self' ${isDev ? "'unsafe-inline'" : `'nonce-${nonce}'`} https://fonts.googleapis.com`,

    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "media-src 'self' blob:",

    // API connections — explicitly scoped, no wildcard
    [
      "connect-src 'self'",
      'https://api.anthropic.com',
      'https://api.openai.com',
      'https://*.supabase.co',
      'wss://*.supabase.co',
      'https://api.razorpay.com',
      'https://lumberjack.razorpay.com',
    ].join(' '),

    'frame-src https://api.razorpay.com https://checkout.razorpay.com',
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ]
  return directives.join('; ')
}

export default auth(async function proxy(req: NextRequest & { auth: unknown }) {
  const { pathname } = req.nextUrl
  const session = (req as { auth?: { user?: { id?: string; email_verified?: boolean } } }).auth

  // ── 1. Reject oversized bodies early ─────────────────────────────────────────
  const contentLength = req.headers.get('content-length')
  if (contentLength) {
    const bytes = parseInt(contentLength, 10)
    if (!isNaN(bytes) && bytes > MAX_BODY_BYTES) {
      return new NextResponse(JSON.stringify({ error: 'Payload too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // ── 2. CORS preflight for public API (/api/v1/*) ──────────────────────────────
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/v1/')) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // ── 3. CORS preflight for internal API ───────────────────────────────────────
  if (req.method === 'OPTIONS' && pathname.startsWith('/api/')) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lifeos.app'
    const origin = req.headers.get('origin')
    const allowedOrigin =
      origin === appUrl || origin === 'http://localhost:3000' || origin === 'http://localhost:3001'
        ? origin
        : appUrl
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
      },
    })
  }

  // ── 4. Block cross-origin requests to internal chat API in production ─────────
  if (pathname.startsWith('/api/chat')) {
    const origin = req.headers.get('origin')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    if (origin && !origin.startsWith(appUrl) && process.env.NODE_ENV === 'production') {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // ── 5. Auth-protected routes ─────────────────────────────────────────────────
  if (!isPublic(pathname) && !session?.user?.id) {
    // API routes → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // Page routes → redirect to login
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', encodeURIComponent(pathname))
    return NextResponse.redirect(loginUrl)
  }

  // ── 5b. Email verification gate ──────────────────────────────────────────────
  // Logged-in users who haven't verified their email are redirected to the
  // verify-email page. API routes are excluded (they return 401 if needed).
  if (
    session?.user?.id &&
    session.user.email_verified === false &&
    !pathname.startsWith('/api/') &&
    !pathname.startsWith('/verify-email') &&
    pathname !== '/login' &&
    pathname !== '/logout'
  ) {
    return NextResponse.redirect(new URL('/verify-email?status=pending', req.url))
  }

  // ── 6. Generate per-request nonce, set strict CSP & tracing headers ──────────
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp(nonce)

  // Forward nonce to server components so they can stamp it on script tags
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)
  requestHeaders.set('X-Request-ID', crypto.randomUUID())

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })

  // Set security headers on the response sent to the browser
  response.headers.set('Content-Security-Policy', csp)
  response.headers.set('X-Request-ID', requestHeaders.get('X-Request-ID')!)

  // Add open CORS header to public API responses
  if (pathname.startsWith('/api/v1/')) {
    response.headers.set('Access-Control-Allow-Origin', '*')
  }

  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|manifest\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
