import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Restrooms in Anaheim, CA | Nearby Bathrooms & Access Info | FlushPin',
  description: 'Find nearby bathrooms and restroom access information in Anaheim, California. Community-submitted restroom locations near Disneyland, hotels, and the Convention Center.',
  alternates: { canonical: 'https://www.flushpin.com/restrooms/orange-county/anaheim' },
  openGraph: {
    title: 'Restrooms in Anaheim, CA | FlushPin',
    description: 'Find nearby restrooms and bathroom access information in Anaheim, CA.',
    url: 'https://www.flushpin.com/restrooms/orange-county/anaheim',
    siteName: 'FlushPin',
    type: 'website',
  },
}

const faqs = [
  {
    q: 'Where can I find public restrooms in Anaheim?',
    a: 'FlushPin shows community-submitted restroom locations across Anaheim including near Disneyland, hotels, and the Anaheim Convention Center. Open the app to find options near your current location.',
  },
  {
    q: 'Does FlushPin show restroom access codes in Anaheim?',
    a: 'Yes. FlushPin displays community-submitted restroom access codes for many Anaheim locations. Codes may change — always verify when you arrive.',
  },
  {
    q: 'Are there accessible restrooms in Anaheim on FlushPin?',
    a: 'FlushPin shows community-reported accessibility details where available. Always confirm directly with the business when needed.',
  },
  {
    q: 'Can I find restrooms near Disneyland in Anaheim?',
    a: 'Yes. FlushPin includes restroom information near the Disneyland area and surrounding Anaheim businesses and restaurants.',
  },
]

export default function AnaheimPage() {
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
      { '@type': 'ListItem', position: 2, name: 'Orange County', item: 'https://www.flushpin.com/restrooms/orange-county' },
      { '@type': 'ListItem', position: 3, name: 'Anaheim', item: 'https://www.flushpin.com/restrooms/orange-county/anaheim' },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-3xl px-5 py-10 pb-24">

          <nav className="mb-8 text-sm text-gray-500">
            <Link href="/">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/restrooms/orange-county">Orange County</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Anaheim</span>
          </nav>

          <section className="mb-14">
            <h1 className="text-4xl font-extrabold leading-tight mb-5">
              Find Restrooms in Anaheim, CA
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Looking for a nearby bathroom in Anaheim? FlushPin shows community-submitted
              restroom locations near Disneyland, hotels, the Convention Center, and
              local businesses across Anaheim.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/map" className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition">
                Find Nearby Restrooms
              </Link>
              <Link href="/restrooms/orange-county" className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:border-gray-900 transition">
                Back to Orange County
              </Link>
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">What you can find in Anaheim</h2>
            <div className="flex flex-wrap gap-2">
              {['Restroom access information', 'Family restrooms', 'Baby changing stations', 'Reported ADA accessibility', 'Delivery driver friendly'].map((f) => (
                <span key={f} className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700">{f}</span>
              ))}
            </div>
          </section>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">Frequently asked questions</h2>
            <div className="space-y-8">
              {faqs.map((faq) => (
                <div key={faq.q}>
                  <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                  <p className="text-gray-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900 mb-14">
            <strong>Important:</strong> FlushPin displays community-submitted restroom
            information. Availability and access details may change at any time.
            Business rules and staff instructions always apply.
            A code does not guarantee permission or safety.
          </div>

          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">Explore nearby areas</h2>
            <div className="space-y-3">
              {[
                { href: '/restrooms/orange-county', label: 'All Orange County restrooms' },
                { href: '/restrooms/orange-county/irvine', label: 'Restrooms in Irvine' },
                { href: '/restrooms/orange-county/garden-grove', label: 'Restrooms in Garden Grove' },
                { href: '/restrooms/orange-county/orange', label: 'Restrooms in Orange' },
                { href: '/restroom-access-codes', label: 'How restroom access codes work' },
                { href: '/business/claim', label: 'Own a business? Claim your listing' },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="block text-teal-600 text-sm underline hover:text-teal-800">
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Need a restroom in Anaheim?</h2>
            <p className="text-gray-600 mb-6">Find nearby restroom access in seconds.</p>
            <Link href="/map" className="inline-block bg-teal-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-600 transition">
              Find Nearby Restrooms
            </Link>
            <p className="text-xs text-gray-400 mt-4">Free · iOS · No spam</p>
          </div>

        </div>
      </main>
    </>
  )
}
