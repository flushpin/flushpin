import type { MetadataRoute } from 'next'

const BASE = 'https://www.flushpin.com'

/**
 * Indexable public pages only.
 * Do not list removed/legacy URLs (those are 308 redirects) or /admin.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const pages: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
    { path: '/', changeFrequency: 'daily', priority: 1 },
    { path: '/map', changeFrequency: 'daily', priority: 0.9 },
    { path: '/es', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/events', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/business', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/business/claim', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/business/start', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/signup', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/optout', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/safety', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.5 },

    // California + OC guides (live pages only)
    { path: '/restrooms/california', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/california/los-angeles', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/california/san-francisco', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/california/orange-county', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/california/san-diego', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/orange-county', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/orange-county/irvine', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/orange-county/anaheim', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/orange-county/costa-mesa', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/orange-county/newport-beach', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/restrooms/orange-county/santa-ana', changeFrequency: 'weekly', priority: 0.8 },
  ]

  return pages.map(({ path, changeFrequency, priority }) => ({
    url: `${BASE}${path === '/' ? '/' : path}`,
    lastModified,
    changeFrequency,
    priority,
  }))
}
