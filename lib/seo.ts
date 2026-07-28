import { APP_STORE_URL } from './site'

export const SITE_URL = 'https://www.flushpin.com'
export const SITE_NAME = 'FlushPin'
export const SITE_TAGLINE = 'Find restroom access codes nearby'
export const SITE_DESCRIPTION =
  'FlushPin helps you find nearby restrooms and community-shared door codes — cafés, gas stations, malls, and more. 34,000+ locations updated by real people. Free for travelers, families, and road trippers.'

/** Shared brand SEO strings for metadata + structured data */
export const SITE_KEYWORDS = [
  'FlushPin',
  'FlushPin app',
  'restroom code',
  'bathroom code near me',
  'door code restroom',
  'find restroom nearby',
  'public restroom access',
  'California restroom guide',
]

export function organizationJsonLd() {
  return {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: 'FlushPin',
    url: SITE_URL,
    logo: `${SITE_URL}/icon-512.png`,
    image: `${SITE_URL}/icon-512.png`,
    description: SITE_DESCRIPTION,
    email: 'admin@flushpin.com',
    foundingLocation: {
      '@type': 'Place',
      name: 'Irvine, California, USA',
    },
    areaServed: 'Worldwide',
    sameAs: [APP_STORE_URL],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'admin@flushpin.com',
        url: `${SITE_URL}/contact`,
      },
    ],
  }
}

export function websiteJsonLd() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/map?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function softwareApplicationJsonLd() {
  return {
    '@type': 'SoftwareApplication',
    name: SITE_NAME,
    operatingSystem: 'iOS',
    applicationCategory: 'TravelApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    url: APP_STORE_URL,
    downloadUrl: APP_STORE_URL,
    description: SITE_DESCRIPTION,
    author: { '@id': `${SITE_URL}/#organization` },
  }
}
