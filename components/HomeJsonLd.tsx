import {
  organizationJsonLd,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '../lib/seo'

/** Server-only JSON-LD for homepage brand entity signals. */
export default function HomeJsonLd() {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [organizationJsonLd(), websiteJsonLd(), softwareApplicationJsonLd()],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}
