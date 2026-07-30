import { ArrowRight, Car, MapPin, Route } from 'lucide-react'
import Link from 'next/link'

export default function TripStopsCard() {
  return (
    <section className="bg-fp-white px-4 py-10 md:px-6 md:py-14">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#101a17] text-white shadow-[0_18px_50px_rgba(10,46,31,0.16)]">
        <div className="grid items-center gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-fp-teal">
              New · Trip Stops
            </p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Plan restroom-friendly stops
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/65 sm:text-base">
              Find restrooms, EV charging, gas, coffee, and food along your route or near your destination.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/trip-stops?mode=route"
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-fp-teal px-5 text-sm font-extrabold text-white no-underline transition-colors hover:bg-fp-teal-dark"
              >
                <Car className="h-5 w-5" aria-hidden="true" />
                Plan a Road Trip
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/trip-stops?mode=destination"
                className="flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-fp-teal no-underline hover:underline"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Explore near a destination
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/55">
              <span className="rounded-full border border-white/10 px-3 py-1.5">Irvine → San Francisco</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">Around Disneyland</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">Near LEGOLAND</span>
            </div>
          </div>

          <div className="relative mx-auto hidden h-48 w-full max-w-sm md:block" aria-hidden="true">
            <div className="absolute left-10 right-10 top-1/2 h-1 -translate-y-1/2 rounded-full bg-fp-teal/35" />
            <div className="absolute left-12 top-[42%] h-7 w-7 rounded-full border-4 border-[#101a17] bg-fp-teal shadow-[0_0_0_3px_rgba(0,168,134,0.25)]" />
            <div className="absolute left-1/2 top-[42%] flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border-4 border-[#101a17] bg-white text-[#101a17]">
              <Route className="h-4 w-4" />
            </div>
            <div className="absolute right-12 top-[40%] flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#101a17] bg-fp-teal text-white shadow-[0_0_0_3px_rgba(0,168,134,0.25)]">
              <MapPin className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
