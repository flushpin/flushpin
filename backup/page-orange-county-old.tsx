import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Restrooms in Orange County, CA | Bathroom Finder & Access Codes | FlushPin',
  description:
    'Find restrooms across Orange County including Irvine, Anaheim, Santa Ana, and Huntington Beach. View restroom access codes, reported ADA bathrooms, and nearby options.',
  alternates: { canonical: 'https://www.flushpin.com/restrooms/orange-county' },
  openGraph: {
    title: 'Restrooms in Orange County, CA | FlushPin',
    description:
      'Find restrooms across Orange County. Access codes, reported accessibility details, and community-submitted restroom information.',
    url: 'https://www.flushpin.com/restrooms/orange-county',
    siteName: 'FlushPin',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restrooms in Orange County, CA | FlushPin',
  },
}

const cities = [
  { name: 'Irvine', slug: 'irvine' },
  { name: 'Anaheim', slug: 'anaheim' },
  { name: 'Santa Ana', slug: 'santa-ana' },
  { name: 'Huntington Beach', slug: 'huntington-beach' },
  { name: 'Costa Mesa', slug: 'costa-mesa' },
  { name: 'Newport Beach', slug: 'newport-beach' },
  { name: 'Fullerton', slug: 'fullerton' },
  { name: 'Garden Grove', slug: 'garden-grove' },
  { name: 'Orange', slug: 'orange' },
  { name: 'Laguna Beach', slug: 'laguna-beach' },
]

const places = [
  'Disneyland Area',
  'John Wayne Airport',
  'Irvine Spectrum Center',
  'South Coast Plaza',
  'Anaheim Convention Center',
  'Fashion Island',
  'Newport Pier',
  'Huntington Beach Pier',
]

const faqs = [
  {
    q: 'Where can I find public restrooms in Orange County?',
    a: 'FlushPin shows community-submitted restroom locations across Orange County including public restrooms, customer-accessible restrooms, and locations with access codes. Open the app to find options near your current location.',
  },
  {
    q: 'How do restroom access codes work on FlushPin?',
    a: 'Restroom access codes on FlushPin are submitted by the community. Codes may change at any time. Always verify the code is current when you arrive. A code does not guarantee permission or access.',
  },
  {
    q: 'Are there ADA-accessible restrooms in Orange County on FlushPin?',
    a: 'FlushPin shows community-reported accessibility details where available. This information may be incomplete or outdated and does not guarantee legal ADA compliance. Always confirm directly with the business when needed.',
  },
  {
    q: 'Can I find restrooms near Disneyland or other Orange County landmarks?',
    a: 'Yes. FlushPin includes restroom listings near popular Orange County destinations including the Disneyland area, Irvine Spectrum, South Coast Plaza, and John Wayne Airport.',
  },
  {
    q: 'Are restroom codes updated by the community?',
    a: 'Yes. FlushPin relies on community contributions to keep information current. Users can confirm working codes, report issues, and submit new locations. Listings show a verification status so you know how recent the information is.',
  },
]

export default function OrangeCountyPage() {
  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const schemaBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flushpin.com/' },
      { '@type': 'ListItem', position: 2, name: 'Restrooms', item: 'https://www.flushpin.com/restrooms/california' },
      { '@type': 'ListItem', position: 3, name: 'Orange County', item: 'https://www.flushpin.com/restrooms/orange-county' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaBreadcrumb) }} />

      <main className="max-w-3xl mx-auto px-6 py-16 font-sans text-gray-800">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/restrooms/california" className="hover:text-teal-600">California</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">Orange County</span>
        </nav>

        {/* H1 */}
        <h1 className="text-4xl font-bold mb-4 leading-tight">
          Find Restrooms in Orange County, CA
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Find public and business restrooms across Orange County, including restroom
          access codes, community-reported accessibility details, family bathrooms,
          and nearby options in Irvine, Anaheim, Santa Ana, Huntington Beach, and more.
        </p>

        {/* CTA */}
        <Link
          href="/map"
          className="inline-block bg-teal-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-600 transition mb-16"
        >
          📍 Find Restrooms Near Me
        </Link>

        {/* Cities */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Browse by city in Orange County</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/restrooms/orange-county/${city.slug}`}
                className="border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-700 hover:border-teal-400 hover:text-teal-600 transition"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Popular Places */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-6">Popular restroom areas in Orange County</h2>
          <ul className="space-y-2">
            {places.map((place) => (
              <li key={place} className="flex items-center gap-3 text-gray-700">
                <span className="text-teal-500">📍</span>
                <span>{place}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Filters */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">What you can find on FlushPin</h2>
          <div className="flex flex-wrap gap-2">
            {[
              'Access code available',
              'Reported ADA accessible',
              'Family restroom',
              'Baby changing station',
              'No purchase required',
              'Community verified',
              'Delivery driver friendly',
            ].map((tag) => (
              <span
                key={tag}
                className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-4 py-1 text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* SEO text block */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">Restroom access information in Orange County</h2>
          <p className="text-gray-600 mb-4">
            Looking for a restroom in Orange County? FlushPin helps people find nearby
            bathrooms, restroom access codes, and community-submitted restroom information
            across Irvine, Anaheim, Santa Ana, Huntington Beach, Costa Mesa, Newport Beach,
            and surrounding cities.
          </p>
          <p className="text-gray-600 mb-4">
            Whether you need a public restroom near the beach, a customer-accessible
            bathroom at a shopping center, or a family restroom with a baby changing
            table — FlushPin shows what the community has reported nearby.
          </p>
          <p className="text-gray-600">
            FlushPin is especially useful for delivery drivers, parents with young children,
            seniors, and travelers who need quick restroom access information on the go.
          </p>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm mb-14">
          <strong>Important:</strong> FlushPin displays community-submitted restroom
          information. Information may be outdated, incomplete, or inaccurate. Business
          rules, posted signs, and staff instructions always apply. A code does not
          guarantee permission or safety. FlushPin is not an emergency service.
        </div>

        {/* FAQ */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-8">Frequently asked questions</h2>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Internal links */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold mb-4">More from FlushPin</h2>
          <ul className="space-y-2">
            {[
              { href: '/restroom-access-codes', label: 'How restroom access codes work' },
              { href: '/accessible-restrooms/orange-county', label: 'Reported accessible restrooms in Orange County' },
              { href: '/baby-changing-restrooms/orange-county', label: 'Baby changing restrooms in Orange County' },
              { href: '/restrooms-for-seniors/orange-county', label: 'Restroom access for seniors in Orange County' },
              { href: '/restrooms-for-delivery-drivers', label: 'Restrooms for delivery drivers' },
              { href: '/restrooms/california', label: 'All California restrooms' },
              { href: '/business/claim', label: 'Own a business? Claim or update your listing' },
            ].map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-teal-600 underline hover:text-teal-800">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Final CTA */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to find a restroom?</h2>
          <p className="text-gray-600 mb-6">
            FlushPin is the fastest way to find restroom access near you.
          </p>
          <Link
            href="/map"
            className="inline-block bg-teal-500 text-white font-semibold px-8 py-3 rounded-lg hover:bg-teal-600 transition"
          >
            Open FlushPin
          </Link>
          <p className="text-sm text-gray-400 mt-4">Free · iOS · No spam</p>
        </div>

      </main>
    </>
  )
}
