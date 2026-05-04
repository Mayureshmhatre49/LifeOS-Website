import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${geistSans.variable} ${geistMono.variable} h-full`}>
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
