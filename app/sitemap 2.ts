import type { MetadataRoute } from 'next'

const BASE = 'https://www.flushpin.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: `${BASE}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/map`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/business`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/signup`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/optout`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/safety`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
  ]
}
