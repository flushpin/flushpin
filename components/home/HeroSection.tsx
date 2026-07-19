import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import AppStoreLink from '../AppStoreLink'
import HeroSearch from './HeroSearch'

export default function HeroSection() {
  return (
    <section className="bg-fp-white px-4 py-[120px] text-center md:px-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="fp-hero-title">
          Restroom codes. Anywhere on Earth.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-fp-gray-600">
          FlushPin taps into live location data covering millions of places worldwide — cafés, gas
          stations, malls, and rest stops. Find the restroom, check the access details, and go. See
          community-shared door codes where available, and add ones you discover so the next traveler
          never has to ask.
        </p>

        <div className="mt-10">
          <HeroSearch />
        </div>

        <p className="mt-5 flex flex-wrap items-center justify-center gap-1.5 text-sm text-fp-gray-600">
          <ShieldCheck className="h-4 w-4 text-fp-teal" aria-hidden="true" />
          <span>34,000+ locations · Updated by real people · Business-respectful</span>
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          <AppStoreLink height={48} />
          <Link
            href="/map"
            className="inline-flex items-center gap-1 text-sm font-medium text-fp-teal no-underline hover:text-fp-teal-dark"
          >
            Open Web Map
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
