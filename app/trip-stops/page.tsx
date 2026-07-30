import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import TripStopsPage from '../../components/trip-stops/TripStopsPage'
import { isTripStopsEnabled } from '../../lib/serverReleaseFlags'

export function generateMetadata(): Metadata {
  if (!isTripStopsEnabled()) {
    return {
      title: 'Not Found',
      robots: { index: false, follow: false },
    }
  }
  return {
    title: 'FlushPin Trip Stops — Restroom-friendly stops along your route',
    description:
      'Find restroom-friendly stops, EV charging, gas, coffee, and food along your route or near your destination.',
    alternates: { canonical: '/trip-stops' },
  }
}

export default function Page() {
  if (!isTripStopsEnabled()) notFound()

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#09110f] px-4 py-12 text-white">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm font-semibold text-white/65">Loading FlushPin Trip Stops…</p>
          </div>
        </main>
      }
    >
      <TripStopsPage />
    </Suspense>
  )
}
