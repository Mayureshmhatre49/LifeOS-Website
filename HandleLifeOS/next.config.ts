import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
})

// ── Security headers applied to every response ────────────────────────────────
const securityHeaders = [
  // Prevent DNS pre-fetching leaking URLs
  { key: 'X-DNS-Prefetch-Control', value: 'on' },

  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'DENY' },

  // Prevent MIME-type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },

  // Referrer policy — send origin only on same-site, nothing cross-origin
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },

  // Permissions policy — deny everything except mic (needed for voice feature)
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(), payment=()' },

  // HSTS — 2 years, include subdomains, submit to preload list
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },

  // Prevent IE from executing downloads in the site's context
  { key: 'X-Download-Options', value: 'noopen' },

  // XSS protection header (legacy browsers)
  { key: 'X-XSS-Protection', value: '1; mode=block' },

  // Cross-origin policies to prevent Spectre-class leaks
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Embedder-Policy', value: 'unsafe-none' }, // relaxed — Razorpay iframe needs it

  // Note: Content-Security-Policy is set dynamically per-request in src/proxy.ts (nonce-based)
]

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Relax COEP for public /api/v1 to allow cross-origin callers
      {
        source: '/api/v1/(.*)',
        headers: [
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },

  serverExternalPackages: ['bcryptjs'],
  cacheComponents: true,
  experimental: {
    instantNavigationDevToolsToggle: true,
  },
}

export default withSentryConfig(withPWA(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,            // Don't spam the build log
  sourcemaps: { disable: true },  // Don't expose source maps in production bundle
  disableLogger: true,
  automaticVercelMonitors: false,
})
