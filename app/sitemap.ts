import type { MetadataRoute } from 'next'

const BASE = 'https://www.flushpin.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const cityPages = [
    '/restrooms/orange-county',
    '/restrooms/orange-county/irvine',
    '/restrooms/orange-county/anaheim',
    '/restrooms/orange-county/costa-mesa',
    '/restrooms/orange-county/newport-beach',
    '/restrooms/orange-county/santa-ana',
  ]

  return [
    { url: `${BASE}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/map`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/es`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/business`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/business/claim`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/signup`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/optout`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/safety`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.5 },
    ...cityPages.map(path => ({
      url: `${BASE}${path}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
