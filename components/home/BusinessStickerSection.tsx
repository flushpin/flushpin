import Link from 'next/link'
import { Check } from 'lucide-react'
import BusinessStickerVisual from './BusinessStickerVisual'

const BENEFITS = [
  'Free FlushPin window sticker',
  'Get discovered by nearby visitors',
  'Give customers instant restroom access information',
  'Reduce repeated restroom questions for staff',
  'Turn foot traffic into possible purchases',
] as const

/**
 * Primary business acquisition block on the homepage.
 * Replaces the former decorative map preview — do not use for decoration.
 */
export default function BusinessStickerSection() {
  return (
    <section
      className="relative mx-auto mt-10 w-[calc(100%-2rem)] max-w-5xl"
      aria-labelledby="business-acquisition-heading"
    >
      <div className="relative overflow-hidden rounded-[1.75rem] border border-fp-border bg-fp-white shadow-sm">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(15,110,86,0.08)_0%,transparent_50%)]"
          aria-hidden="true"
        />

        <div className="relative grid items-center gap-8 p-7 sm:gap-10 sm:p-9 md:grid-cols-2 md:gap-12 md:p-12 lg:gap-14 lg:p-14">
          {/* LEFT — value proposition (text + CTAs first on mobile) */}
          <div className="text-left">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-fp-teal-dark md:text-[13px]">
              Free for businesses
            </p>

            <h2
              id="business-acquisition-heading"
              className="mt-3 text-[clamp(1.75rem,4vw,2.55rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-fp-ink"
            >
              Turn Restroom Visitors Into Paying Customers
            </h2>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-fp-gray-600 md:text-base">
              People nearby are already searching for restroom access. Help them discover your
              business first with a free FlushPin window sticker and verified listing.
            </p>

            <ul className="mt-7 space-y-3">
              {BENEFITS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[14px] leading-snug text-fp-ink md:text-[15px]"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fp-teal-tint text-fp-teal-dark">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/business/start"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-fp-teal-dark px-7 py-3.5 text-[15px] font-semibold text-white no-underline shadow-sm transition-colors hover:bg-[#04342C]"
              >
                Claim My FREE Sticker
              </Link>
              <Link
                href="/business"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-fp-border bg-transparent px-7 py-3.5 text-[15px] font-medium text-fp-ink no-underline transition-colors hover:border-fp-teal/40 hover:bg-fp-teal-tint"
              >
                See How It Works
              </Link>
            </div>
          </div>

          {/* RIGHT — café proof image (below CTAs on mobile) */}
          <div className="md:pl-2">
            <BusinessStickerVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
