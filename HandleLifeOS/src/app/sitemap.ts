import { MetadataRoute } from 'next'
import { siteConfig } from '@/config/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/docs`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const toolPages: MetadataRoute.Sitemap = [
    // Money tools
    { url: `${base}/emi-calculator`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/loan-comparison`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/budget-planner`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/subscription-checker`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/can-i-afford-this`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Protection tools
    { url: `${base}/scam-checker`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/is-this-a-scam`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/quote-checker`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/contract-simplifier`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/negotiation-coach`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // Planning tools
    { url: `${base}/daily-planner`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/ai-task-planner`, lastModified: now, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/routine-builder`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    // Focus tools
    { url: `${base}/focus-timer`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/pomodoro-ai`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/body-doubling`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/beat-procrastination`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    // Family tools
    { url: `${base}/family-planner`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/shared-grocery-list`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/family-task-manager`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/elder-reminder-app`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/home-organization-ai`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
  ]

  return [...staticPages, ...toolPages]
}
