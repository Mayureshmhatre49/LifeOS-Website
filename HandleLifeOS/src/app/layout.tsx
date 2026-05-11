import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import './globals.css'
import { generatePageMeta } from '@/lib/seo/metadata'
import { organizationSchema, webSiteSchema, softwareApplicationSchema } from '@/lib/seo/json-ld'
import { PWARegister } from '@/components/pwa/PWARegister'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = generatePageMeta()

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

// Safely serialize JSON-LD: replace '<' with its unicode escape to prevent
// XSS via </script> injection, as recommended by Next.js 16.2.4 docs.
function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

const RTL_LANGS = new Set(['ar', 'he', 'fa', 'ur', 'dv', 'ps', 'yi', 'sd'])

function resolveLocale(acceptLang: string): { lang: string; dir: 'ltr' | 'rtl' } {
  const primary = acceptLang.split(',')[0].trim().split(';')[0].trim()
  const base = primary.split('-')[0].toLowerCase()
  return { lang: primary || 'en', dir: RTL_LANGS.has(base) ? 'rtl' : 'ltr' }
}

// Isolated async component so headers() is read inside Suspense,
// preventing it from blocking the entire route stream.
async function HtmlShell({ children }: { children: React.ReactNode }) {
  const hdrs = await headers()
  const { lang, dir } = resolveLocale(hdrs.get('accept-language') ?? 'en')

  return (
    <html lang={lang} dir={dir} className={`${geistSans.variable} ${geistMono.variable} h-full`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(organizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(webSiteSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd(softwareApplicationSchema()) }}
        />
      </head>
      <body className="h-full antialiased">
        <SessionProvider>
          {children}
          <PWARegister />
        </SessionProvider>
      </body>
    </html>
  )
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <html lang="en" dir="ltr" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
        <body className="h-full antialiased" />
      </html>
    }>
      <HtmlShell>{children}</HtmlShell>
    </Suspense>
  )
}
