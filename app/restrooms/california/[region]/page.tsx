import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { californiaGuideRegions, getCaliforniaGuideRegion } from '../../../../lib/californiaGuides'

type PageProps = {
  params: Promise<{ region: string }>
}

export function generateStaticParams() {
  return californiaGuideRegions.map(region => ({ region: region.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region: slug } = await params
  const region = getCaliforniaGuideRegion(slug)
  if (!region) return {}

  return {
    title: `${region.name} Restroom Access Guide | FlushPin`,
    description: region.description,
    alternates: { canonical: `https://www.flushpin.com/restrooms/california/${region.slug}` },
    openGraph: {
      title: `${region.name} Restroom Access Guide | FlushPin`,
      description: region.description,
      url: `https://www.flushpin.com/restrooms/california/${region.slug}`,
      siteName: 'FlushPin',
      type: 'website',
    },
  }
}

export default async function CaliforniaRegionGuidePage({ params }: PageProps) {
  const { region: slug } = await params
  const region = getCaliforniaGuideRegion(slug)
  if (!region) notFound()

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${region.name} restroom access areas`,
    itemListElement: region.landmarks.map((landmark, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: landmark.name,
      description: landmark.accessHint,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.flushpin.com' },
      { '@type': 'ListItem', position: 2, name: 'California', item: 'https://www.flushpin.com/restrooms/california' },
      { '@type': 'ListItem', position: 3, name: region.name, item: `https://www.flushpin.com/restrooms/california/${region.slug}` },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-white text-gray-900">
        <section className="border-b border-teal-100 bg-gradient-to-br from-teal-50 via-white to-orange-50">
          <div className="mx-auto max-w-6xl px-5 py-14 md:py-18">
            <nav className="mb-8 text-sm text-gray-500">
              <Link href="/">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/restrooms/california">California</Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900">{region.name}</span>
            </nav>

            <div className="max-w-4xl">
              <p className="mb-4 inline-flex rounded-full bg-teal-100 px-4 py-2 text-sm font-extrabold text-teal-800">
                California guide
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
                {region.name} restroom access guide
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-650 md:text-xl">{region.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/map?q=${encodeURIComponent(region.mapQuery)}`}
                  className="rounded-xl bg-teal-500 px-6 py-3 font-bold text-white transition hover:bg-teal-600"
                >
                  Open {region.shortName} on the map
                </Link>
                <Link href="/restrooms/california" className="rounded-xl border border-gray-300 bg-white px-6 py-3 font-semibold text-gray-800 transition hover:border-gray-900">
                  Back to California guides
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 py-16">
          <section>
            <div className="mb-8 max-w-3xl">
              <h2 className="text-3xl font-black tracking-tight">Popular areas to check first</h2>
              <p className="mt-3 leading-7 text-gray-600">
                These are high-intent visitor zones where restroom searches are common. Open the live map
                to see nearby businesses, community notes, and current access candidates.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {region.landmarks.map((landmark, index) => (
                <article key={landmark.name} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-extrabold text-teal-700">#{index + 1} · {landmark.area}</p>
                      <h3 className="mt-2 text-2xl font-black text-gray-950">{landmark.name}</h3>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">Guide</span>
                  </div>
                  <p className="leading-7 text-gray-600">{landmark.accessHint}</p>
                  <div className="mt-5 rounded-2xl bg-teal-50 p-4">
                    <p className="text-sm font-extrabold text-teal-900">Best for</p>
                    <p className="mt-1 text-sm leading-6 text-teal-900/75">{landmark.bestFor}</p>
                  </div>
                  <Link
                    href={`/map?q=${encodeURIComponent(landmark.mapQuery)}`}
                    className="mt-5 inline-flex rounded-xl border border-teal-200 px-5 py-3 text-sm font-bold text-teal-800 transition hover:border-teal-500 hover:bg-teal-50"
                  >
                    Check nearby access on map
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-16 rounded-3xl bg-gray-950 p-8 text-white md:p-10">
            <div className="grid gap-8 md:grid-cols-[1fr_.9fr] md:items-center">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-wide text-teal-200">For local businesses</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight">Restroom traffic can become a local offer.</h2>
                <p className="mt-4 leading-8 text-white/70">{region.businessAngle}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="text-sm font-extrabold uppercase tracking-wide text-white/60">FlushPin Gold flow</p>
                <ol className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                  <li>1. Guest scans QR or finds the listing.</li>
                  <li>2. Guest sees a short coffee, pastry, sandwich, or return-visit offer.</li>
                  <li>3. Access instructions appear, and the scan becomes dashboard data.</li>
                </ol>
                <Link href="/business#packages" className="mt-5 inline-flex rounded-xl bg-teal-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-600">
                  See business packages
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-16 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
            <strong>Important:</strong> This guide does not guarantee restroom availability, permission, safety,
            cleanliness, or access codes. Conditions change. Always follow posted rules and staff instructions.
          </section>
        </div>
      </main>
    </>
  )
}
