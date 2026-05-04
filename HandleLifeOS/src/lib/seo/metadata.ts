import { Metadata } from 'next'
import { siteConfig } from '@/config/site'

interface PageMetaOptions {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
  keywords?: string[]
  image?: string
}

export function generatePageMeta({
  title,
  description,
  path = '',
  noIndex = false,
  keywords,
  image,
}: PageMetaOptions = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} | ${siteConfig.tagline}`
  const desc = description ?? siteConfig.description
  const url = `${siteConfig.url}${path}`
  const ogImage = image ?? siteConfig.ogImage

  return {
    title: fullTitle,
    description: desc,
    keywords: keywords ?? siteConfig.keywords,
    authors: [{ name: siteConfig.name, url: siteConfig.url }],
    creator: siteConfig.name,
    publisher: siteConfig.name,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
      languages: {
        'en-IN': url,
        'hi-IN': url,
        'mr-IN': url,
        'ta-IN': url,
        'te-IN': url,
        'kn-IN': url,
        'gu-IN': url,
        'bn-IN': url,
        'ml-IN': url,
        'pa-IN': url,
      },
    },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: ogImage, width: 1200, height: 630, alt: fullTitle }],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [ogImage],
      site: '@lifeosapp',
      creator: '@lifeosapp',
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
      shortcut: '/favicon.ico',
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: siteConfig.name,
    },
    other: {
      'geo.region': siteConfig.geo.region,
      'geo.placename': siteConfig.geo.placename,
    },
  }
}
