import type { Metadata } from 'next'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Restrooms in Costa Mesa, CA | Nearby Bathrooms & Access Info | FlushPin',
  description: 'Find nearby bathrooms and restroom access information in Costa Mesa, California. Community-submitted restroom locations near South Coast Plaza, Triangle Square, and local dining.',
  alternates: { canonical: 'https://www.flushpin.com/restrooms/orange-county/costa-mesa' },
  openGraph: { title: 'Restrooms in Costa Mesa, CA | FlushPin', description: 'Find nearby restrooms in Costa Mesa, CA.', url: 'https://www.flushpin.com/restrooms/orange-county/costa-mesa', siteName: 'FlushPin', type: 'website' },
}
const faqs = [
  { q: 'Where can I find public restrooms in Costa Mesa?', a: 'FlushPin shows community-submitted restroom locations across Costa Mesa including near South Coast Plaza, Triangle Square, and local dining areas.' },
  { q: 'Does FlushPin show restroom access codes in Costa Mesa?', a: 'Yes. FlushPin displays community-submitted restroom access codes for many Costa Mesa locations. Codes may change — always verify when you arrive.' },
  { q: 'Are there accessible restrooms in Costa Mesa on FlushPin?', a: 'FlushPin shows community-reported accessibility details where available. Always confirm directly with the business when needed.' },
  { q: 'Is FlushPin useful for shoppers in Costa Mesa?', a: 'Yes. FlushPin helps people find nearby restrooms around South Coast Plaza and other Costa Mesa shopping destinations quickly.' },
]
export default function CostaMesaPage() {
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map((faq) => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) }
  const breadcrumbSchema = { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flushpin.com' }, { '@type': 'ListItem', position: 2, name: 'Orange County', item: 'https://www.flushpin.com/restrooms/orange-county' }, { '@type': 'ListItem', position: 3, name: 'Costa Mesa', item: 'https://www.flushpin.com/restrooms/orange-county/costa-mesa' }] }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white text-gray-900">
        <div className="mx-auto max-w-3xl px-5 py-10 pb-24">
          <nav className="mb-8 text-sm text-gray-500">
            <Link href="/">Home</Link><span className="mx-2">/</span>
            <Link href="/restrooms/orange-county">Orange County</Link><span className="mx-2">/</span>
            <span className="text-gray-900">Costa Mesa</span>
          </nav>
          <section className="mb-14">
            <h1 className="text-4xl font-extrabold leading-tight mb-5">Find Restrooms in Costa Mesa, CA</h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">Looking for a nearby bathroom in Costa Mesa? FlushPin shows community-submitted restroom locations near South Coast Plaza, Triangle Square, and local dining areas.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/map" className="rounded-xl bg-teal-500 px-6 py-3 font-semibold text-white hover:bg-teal-600 transition">Find Nearby Restrooms</Link>
              <Link href="/restrooms/orange-county" className="rounded-xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:border-gray-900 transition">Back to Orange County</Link>
            </div>
          </section>
          <section className="mb-14">
            <h2 className="text-2xl font-bold mb-5">Frequently asked questions</h2>
            <div className="space-y-8">
              {faqs.map((faq) => (<div key={faq.q}><h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3><p className="text-gray-600">{faq.a}</p></div>))}
            </div>
          </section>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900 mb-14"><strong>Important:</strong> FlushPin displays community-submitted restroom information. Availability and access details may change at any time. Business rules and staff instructions always apply.</div>
          <div className="rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">Need a restroom in Costa Mesa?</h2>
            <p className="text-gray-600 mb-6">Find nearby restroom access in seconds.</p>
            <Link href="/map" className="inline-block bg-teal-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-teal-600 transition">Find Nearby Restrooms</Link>
            <p className="text-xs text-gray-400 mt-4">Free · iOS · No spam</p>
          </div>
        </div>
      </main>
    </>
  )
}
