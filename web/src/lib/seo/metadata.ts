import { Metadata } from 'next'
import { siteConfig } from '@/config/site'

interface PageMetaOptions {
  title?: string
  description?: string
  path?: string
  noIndex?: boolean
}

export function generatePageMeta({
  title,
  description,
  path = '',
  noIndex = false,
}: PageMetaOptions = {}): Metadata {
  const fullTitle = title ? `${title} | ${siteConfig.name}` : `${siteConfig.name} | ${siteConfig.tagline}`
  const desc = description ?? siteConfig.description
  const url = `${siteConfig.url}${path}`

  return {
    title: fullTitle,
    description: desc,
    keywords: siteConfig.keywords,
    authors: [{ name: siteConfig.name }],
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description: desc,
      url,
      siteName: siteConfig.name,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
      type: 'website',
      locale: 'en_IN',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: desc,
      images: [siteConfig.ogImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
    },
  }
}
