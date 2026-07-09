import Link from 'next/link'
import { Check, Minus } from 'lucide-react'

type Plan = {
  name: string
  price: string
  priceNote: string
  purpose: string
  includes: string[]
  excludes?: string[]
  popular?: boolean
  bestValue?: boolean
  cta: string
  planSlug: 'free' | 'starter' | 'business' | 'multi'
}

const plans: Plan[] = [
  {
    name: 'Free Listing',
    price: '$0',
    priceNote: 'Always free',
    purpose: 'Basic visibility on FlushPin.',
    includes: [
      'Business listed on FlushPin',
      'Restroom access status shown',
      'Request corrections to wrong restroom info',
      'Basic business profile',
    ],
    excludes: [
      'QR sticker',
      'Offer/ad screen',
      'Restroom code reveal',
      'Analytics dashboard',
    ],
    cta: 'List my business free',
    planSlug: 'free',
  },
  {
    name: 'Starter QR',
    price: '$9/mo',
    priceNote: 'per location',
    purpose: 'Easy entry for cafes, bakeries, and small shops.',
    popular: true,
    includes: [
      'FlushPin QR sticker',
      'Customer scans QR',
      'Simple offer/ad screen before code reveal',
      'Restroom code shown on phone',
      'Basic scan count',
      'One active offer',
      'Change offer once per month',
      'Email support',
    ],
    cta: 'Get Starter QR',
    planSlug: 'starter',
  },
  {
    name: 'Business',
    price: '$29/mo',
    priceNote: 'per location',
    purpose: 'For shops that want control, offers, and useful reporting.',
    includes: [
      'Everything in Starter QR',
      'Change offers anytime',
      'Weekly scan reports',
      'Busy-hour insights',
      'Campaign view counts',
      'Up to 3 active campaigns',
      'Basic owner dashboard',
      'Priority email support',
    ],
    cta: 'Get Business',
    planSlug: 'business',
  },
  {
    name: 'Multi-Location',
    price: '$49/mo',
    priceNote: 'up to 10 locations',
    purpose: 'Best value for small chains and multi-shop operators.',
    bestValue: true,
    includes: [
      'Everything in Business',
      'Up to 10 locations',
      'Separate QR for each location',
      'Separate offer for each location',
      'One dashboard for all locations',
      'Location comparison',
      'Monthly performance report',
      'Campaign suggestions',
    ],
    cta: 'Get Multi-Location',
    planSlug: 'multi',
  },
]

const futurePlan = {
  name: 'Growth / Local Ads',
  price: 'Custom',
  purpose: 'Future advertising network package for shops ready to run sponsored local campaigns.',
  includes: [
    'Sponsored local campaigns',
    'Multiple ads at once',
    'Advanced analytics',
    'Local ad placement optimization',
    'Priority support',
  ],
}

export default function BusinessPricing() {
  return (
    <section className="bg-fp-teal-tint px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">Simple pricing</h2>
          <p className="mt-3 text-base leading-relaxed text-fp-gray-600">
            Customer scans. Sees your offer. Gets the restroom code. Staff gets fewer interruptions.
            Your shop gets a small advertising channel — pick the plan that fits.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`fp-card flex flex-col bg-fp-white p-6 ${
                plan.popular || plan.bestValue ? 'border-2 border-fp-teal' : ''
              }`}
            >
              {plan.popular && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-fp-teal-tint px-3 py-1 text-xs font-semibold text-fp-teal-dark">
                  Most popular
                </span>
              )}
              {plan.bestValue && !plan.popular && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-fp-teal-tint px-3 py-1 text-xs font-semibold text-fp-teal-dark">
                  Best value
                </span>
              )}
              {!plan.popular && !plan.bestValue && <span className="mb-3 block h-6" aria-hidden="true" />}

              <h3 className="text-xl font-bold text-fp-ink">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold leading-none text-fp-ink">{plan.price}</p>
              <p className="mt-1 text-sm text-fp-gray-600">{plan.priceNote}</p>
              <p className="mt-3 text-sm leading-relaxed text-fp-gray-600">{plan.purpose}</p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {plan.includes.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-fp-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-fp-teal" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
                {plan.excludes?.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-fp-gray-400">
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={`/business/start?plan=${plan.planSlug}`}
                className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-fp-teal px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-fp-teal-dark"
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="fp-card mx-auto mt-8 max-w-3xl bg-fp-white p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-xl">
              <span className="inline-flex rounded-full bg-fp-teal-tint px-3 py-1 text-xs font-semibold text-fp-teal-dark">
                Coming later
              </span>
              <h3 className="mt-3 text-lg font-bold text-fp-ink">{futurePlan.name}</h3>
              <p className="mt-1 text-2xl font-bold text-fp-ink">{futurePlan.price}</p>
              <p className="mt-2 text-sm leading-relaxed text-fp-gray-600">{futurePlan.purpose}</p>
            </div>
            <ul className="flex flex-col gap-2 md:min-w-[240px]">
              {futurePlan.includes.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-fp-gray-600">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-fp-teal" aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/contact"
            className="mt-6 inline-flex text-sm font-medium text-fp-teal no-underline hover:text-fp-teal-dark"
          >
            Ask about Growth / Local Ads
          </Link>
        </div>
      </div>
    </section>
  )
}
