import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/dashboard/', '/user/', '/auth/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/dashboard/', '/user/', '/auth/'],
      },
    ],
    sitemap: 'https://www.flushpin.com/sitemap.xml',
    host: 'https://www.flushpin.com',
  }
}
