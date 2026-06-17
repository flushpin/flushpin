import type { Metadata } from 'next'
import Link from 'next/link'
import { californiaGuideRegions } from '../../../lib/californiaGuides'

export const metadata: Metadata = {
  title: 'California Restroom Access Guides | FlushPin',
  description:
    'Browse California restroom access guides for Los Angeles, San Francisco, Orange County, and San Diego visitor areas, beaches, piers, parks, and shopping districts.',
  alternates: { canonical: 'https://www.flushpin.com/restrooms/california' },
  openGraph: {
    title: 'California Restroom Access Guides | FlushPin',
    description:
      'Find restroom access guidance near California visitor spots, shopping streets, beaches, piers, parks, and downtown areas.',
    url: 'https://www.flushpin.com/restrooms/california',
    siteName: 'FlushPin',
    type: 'website',
  },
}

export default function CaliforniaRestroomGuidesPage() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'California restroom access guides',
    itemListElement: californiaGuideRegions.map((region, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: `${region.name} Restroom Access Guide`,
      url: `https://www.flushpin.com/restrooms/california/${region.slug}`,
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="border-b border-teal-100 bg-gradient-to-br from-teal-50 via-white to-orange-50">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <nav className="mb-8 text-sm text-gray-500">
              <Link href="/">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">California restroom guides</span>
            </nav>

            <div className="max-w-3xl">
              <p className="mb-4 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-extrabold text-teal-800">
                California-first restroom intelligence
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Restroom access near California&apos;s busiest visitor spots.
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-650 md:text-xl">
                FlushPin is starting in California. These web guides help people find where to begin
                around beaches, piers, parks, shopping streets, tourist corridors, and downtown areas,
                then open the live map for nearby access notes.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/map" className="rounded-xl bg-teal-500 px-6 py-3 font-bold text-white transition hover:bg-teal-600">
                  Open live map
                </Link>
                <Link href="/business" className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 transition hover:border-gray-900">
                  For local businesses
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-16">
          <section>
            <div className="mb-8 max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight">Browse California by region</h2>
              <p className="mt-3 text-gray-600">
                This is a web-first v1: useful for search, simple for travelers, and measurable before
                we decide what belongs inside the mobile app.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {californiaGuideRegions.map(region => (
                <Link
                  key={region.slug}
                  href={`/restrooms/california/${region.slug}`}
                  className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-wide text-teal-700">{region.shortName}</p>
                      <h3 className="mt-2 text-2xl font-black text-gray-950">{region.name}</h3>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">
                      {region.landmarks.length} areas
                    </span>
                  </div>
                  <p className="mt-4 leading-7 text-gray-600">{region.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {region.landmarks.slice(0, 3).map(landmark => (
                      <span key={landmark.name} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                        {landmark.name}
                      </span>
                    ))}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-3xl bg-gray-950 p-8 text-white md:p-10">
            <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Why this starts on the web</h2>
                <p className="mt-4 leading-8 text-white/70">
                  The web lets FlushPin test real search intent first: “restroom near Santa Monica Pier,”
                  “bathroom near Pier 39,” or “Hollywood restroom.” Once we know which guides attract
                  users and businesses, the strongest patterns can move into the app as v2.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="text-sm font-extrabold uppercase tracking-wide text-teal-200">Business signal</p>
                <p className="mt-3 leading-7 text-white/75">
                  A restroom search is local intent. For a cafe, bakery, deli, or market, that moment can
                  become a QR scan, a short offer, and a reason to buy coffee, pastry, water, or a sandwich.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
            <strong>Important:</strong> These pages are guidance pages, not a guarantee of restroom access.
            Availability, hours, rules, and safety conditions can change. Always follow posted rules and staff instructions.
          </section>
        </div>
      </main>
    </>
  )
}
