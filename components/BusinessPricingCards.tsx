import Link from 'next/link'

type Tier = {
  name: string
  price: number | null
  priceLabel?: string
  badge?: string
  features: string[]
  cta: { label: string; href: string; external?: boolean }
  variant: 'community' | 'silver' | 'gold' | 'platinum'
}

const tiers: Tier[] = [
  {
    name: 'Community',
    price: 0,
    features: [
      'Claim your listing',
      'Update restroom info',
      'Restroom notes',
      'Community visibility',
      '1 location',
    ],
    cta: { label: 'Claim Your Listing', href: '/business/claim' },
    variant: 'community',
  },
  {
    name: 'Silver',
    price: 19,
    features: [
      'Everything in Community',
      'Verified Business badge',
      'Monthly cleanliness report',
      'PIN update history & analytics',
      'Priority listing in search',
      'Email support',
    ],
    cta: { label: 'Start Silver', href: '/signup' },
    variant: 'silver',
  },
  {
    name: 'Gold',
    price: 49,
    badge: 'Most Popular',
    features: [
      'Everything in Silver',
      'Featured placement on map',
      'QR code sticker pack (mailed)',
      'Respond to customer reviews',
      'Weekly performance reports',
      'Custom PIN update alerts',
      'Phone & email support',
    ],
    cta: { label: 'Start Gold', href: '/signup' },
    variant: 'gold',
  },
  {
    name: 'Platinum',
    price: 99,
    features: [
      'Everything in Gold',
      'FlushPin Award eligibility',
      'Multi-location management',
      'Branded door sticker (certified)',
      'Dedicated account manager',
      'API access for POS integration',
      'Custom reporting dashboard',
      'SLA & priority support',
    ],
    cta: { label: 'Contact us', href: 'mailto:admin@flushpin.com', external: true },
    variant: 'platinum',
  },
]

function cardClasses(variant: Tier['variant']) {
  switch (variant) {
    case 'community':
      return 'border border-gray-200 bg-[#f5f5f5]'
    case 'silver':
      return 'border border-[#0EB5AB]/30 bg-[#E1F5EE]'
    case 'gold':
      return 'border-2 border-[#D97706] bg-[#FEF3C7] shadow-[0_12px_40px_rgba(217,119,6,0.18)] md:scale-[1.03] md:-mt-2 md:mb-2'
    case 'platinum':
      return 'border border-[#1a2e2c] bg-[#0A2E1F]'
  }
}

function titleClasses(variant: Tier['variant']) {
  switch (variant) {
    case 'gold':
      return 'text-[#92400E]'
    case 'platinum':
      return 'text-[#9FE1CB]'
    default:
      return 'text-[#0A2E1F]'
  }
}

function featureClasses(variant: Tier['variant']) {
  switch (variant) {
    case 'gold':
      return 'text-[#78350F]'
    case 'platinum':
      return 'text-[#9FE1CB]/90'
    case 'silver':
      return 'text-[#0F6E56]'
    default:
      return 'text-gray-600'
  }
}

function checkClasses(variant: Tier['variant']) {
  switch (variant) {
    case 'gold':
      return 'text-[#D97706]'
    case 'platinum':
      return 'text-[#0EB5AB]'
    case 'silver':
      return 'text-[#0EB5AB]'
    default:
      return 'text-[#0EB5AB]'
  }
}

function ctaClasses(variant: Tier['variant']) {
  switch (variant) {
    case 'community':
      return 'bg-[#0A2E1F] hover:bg-black'
    case 'silver':
      return 'bg-[#0EB5AB] hover:bg-[#0a9e95]'
    case 'gold':
      return 'bg-[#D97706] hover:bg-[#B45309] shadow-md'
    case 'platinum':
      return 'bg-[#0EB5AB] hover:bg-[#0a9e95]'
  }
}

function badgeClasses(variant: Tier['variant']) {
  return variant === 'gold'
    ? 'bg-[#D97706]'
    : 'bg-[#0EB5AB]'
}

export default function BusinessPricingCards() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 xl:gap-5">
      {tiers.map((tier) => (
        <div
          key={tier.name}
          className={`relative flex flex-col rounded-3xl p-6 xl:p-7 ${cardClasses(tier.variant)}`}
        >
          {tier.badge && (
            <div
              className={`absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-bold text-white shadow-md ${badgeClasses(tier.variant)}`}
            >
              {tier.badge}
            </div>
          )}

          <h2 className={`text-xl font-bold xl:text-2xl ${titleClasses(tier.variant)}`}>
            {tier.name}
          </h2>

          <div className="mt-3 flex items-end gap-1">
            {tier.price === 0 ? (
              <span className={`text-4xl font-extrabold ${titleClasses(tier.variant)}`}>Free</span>
            ) : (
              <>
                <span className={`text-4xl font-extrabold ${titleClasses(tier.variant)}`}>
                  ${tier.price}
                </span>
                <span
                  className={`pb-1 text-sm font-medium ${tier.variant === 'platinum' ? 'text-[#9FE1CB]/70' : tier.variant === 'gold' ? 'text-[#B45309]' : 'text-gray-500'}`}
                >
                  /mo
                </span>
              </>
            )}
          </div>

          <ul className={`mt-6 flex flex-1 flex-col gap-3 text-sm leading-relaxed ${featureClasses(tier.variant)}`}>
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className={`mt-0.5 shrink-0 font-bold ${checkClasses(tier.variant)}`}>✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          {tier.cta.external ? (
            <a
              href={tier.cta.href}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition ${ctaClasses(tier.variant)}`}
            >
              {tier.cta.label}
            </a>
          ) : (
            <Link
              href={tier.cta.href}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-3.5 text-sm font-semibold text-white transition ${ctaClasses(tier.variant)}`}
            >
              {tier.cta.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}
