import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/chat`, lastModified: new Date(), changeFrequency: 'never', priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), changeFrequency: 'never', priority: 0.5 },
    { url: `${base}/signup`, lastModified: new Date(), changeFrequency: 'never', priority: 0.6 },
  ]
}
