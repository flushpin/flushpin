import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Orange County Restrooms | Nearby Bathrooms & Access Info | FlushPin',
  description:
    'Find nearby bathrooms, public restrooms, and restroom access information across Orange County including Irvine, Anaheim, Santa Ana, Huntington Beach, and Costa Mesa.',
  alternates: { canonical: 'https://www.flushpin.com/restrooms/orange-county' },
  openGraph: {
    title: 'Orange County Restrooms | FlushPin',
    description: 'Find nearby bathrooms and restroom access information across Orange County.',
    url: 'https://www.flushpin.com/restrooms/orange-county',
    siteName: 'FlushPin',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Orange County Restrooms | FlushPin' },
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

const landmarks = [
  { name: 'Disneyland Area', slug: 'disneyland-area' },
  { name: 'John Wayne Airport', slug: 'john-wayne-airport' },
  { name: 'Irvine Spectrum Center', slug: 'irvine-spectrum' },
  { name: 'South Coast Plaza', slug: 'south-coast-plaza' },
  { name: 'Fashion Island', slug: 'fashion-island' },
  { name: 'Anaheim Convention Center', slug: 'anaheim-convention-center' },
]

const features = [
  'Nearby bathroom locations',
  'Family restrooms',
  'Baby changing stations',
  'Reported ADA accessibility',
  'Delivery driver friendly',
  'Restroom access information',
]

const faqs = [
  {
    q: 'Where can I find public restrooms in Orange County?',
    a: 'FlushPin helps people find nearby restroom locations across Orange County including Irvine, Anaheim, Santa Ana, Newport Beach, and nearby areas.',
  },
  {
    q: 'Can I find nearby bathrooms in Orange County?',
    a: 'Yes. FlushPin helps people quickly find nearby bathrooms and restroom access information throughout Orange County.',
  },
  {
    q: 'Are family and accessible restrooms available?',
    a: 'Some locations include community-reported family restroom and accessibility information.',
  },
  {
    q: 'Can I find restrooms near Disneyland?',
    a: 'Yes. FlushPin includes restroom information near popular Orange County destinations including Disneyland, Irvine Spectrum, shopping centers, and airports.',
  },
]

export default function OrangeCountyPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flushpin.com' },
      { '@type': 'ListItem', position: 2, name: 'California', item: 'https://www.flushpin.com/restrooms/california' },
      { '@type': 'ListItem', position: 3, name: 'Orange County', item: 'https://www.flushpin.com/restrooms/orange-county' },
    ],
  }

  const citySchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: cities.map((city, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: city.name,
      url: `https://www.flushpin.com/restrooms/orange-county/${city.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(citySchema) }} />

      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-5xl px-5 py-10">

          <nav className="mb-8 text-sm text-gray-500">
            <Link href="/">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/restrooms/california">California</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Orange County</span>
          </nav>

          <section className="max-w-3xl">
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Find Restrooms in Orange County — Nearby Bathrooms & Access Info
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-600">
              Looking for a nearby bathroom in Orange County? FlushPin helps people find
              public restrooms, family restrooms, and restroom access information across
              Irvine, Anaheim, Santa Ana, Huntington Beach, Costa Mesa, and more.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/map" className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white transition hover:bg-teal-600">
                Find Nearby Restrooms
              </Link>
              <Link href="/restrooms/california" className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 transition hover:border-gray-900">
                Browse California
              </Link>
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-2xl font-bold">Browse by City</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/restrooms/orange-county/${city.slug}`}
                  className="rounded-xl border border-gray-200 p-4 text-center font-medium transition hover:border-teal-400 hover:shadow-sm"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-2xl font-bold">Popular Restroom Areas</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
              {landmarks.map((landmark) => (
                <Link
                  key={landmark.slug}
                  href={`/restrooms/orange-county/${landmark.slug}`}
                  className="rounded-xl border border-gray-200 p-4 transition hover:border-teal-400"
                >
                  📍 {landmark.name}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-20">
            <h2 className="text-2xl font-bold">What You Can Find</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {features.map((feature) => (
                <span key={feature} className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">
                  {feature}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-20 max-w-3xl">
            <h2 className="text-2xl font-bold">Restroom Access in Orange County</h2>
            <div className="mt-5 space-y-5 text-gray-600">
              <p>
                FlushPin helps people quickly find nearby bathrooms and restroom access
                information throughout Orange County. Whether you are in Irvine, Anaheim,
                Santa Ana, Costa Mesa, or Newport Beach, finding a restroom should not
                take forever.
              </p>
              <p>
                Looking for a restroom near a mall, airport, beach, or shopping center?
                FlushPin helps people find nearby restroom options without wasting time.
              </p>
              <p>
                Parents, travelers, delivery drivers, seniors, and everyday visitors use
                FlushPin to quickly find restroom access when they need it most.
              </p>
            </div>
          </section>

          <section className="mt-20 max-w-3xl">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="mt-8 space-y-8">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-semibold">{faq.q}</h3>
                  <p className="mt-2 text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-20 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
            <strong>Important:</strong> FlushPin displays community-submitted restroom
            information. Availability and restroom access may change at any time.
            Always follow posted business rules and staff instructions.
          </section>

          <section className="mt-20 rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h2 className="text-3xl font-bold">Need a Restroom Now?</h2>
            <p className="mt-4 text-gray-600">Find nearby restroom access in seconds.</p>
            <Link href="/map" className="mt-6 inline-flex rounded-xl bg-teal-500 px-8 py-4 font-semibold text-white transition hover:bg-teal-600">
              Find Nearby Restrooms
            </Link>
          </section>

        </div>
      </main>
    </>
  )
}
