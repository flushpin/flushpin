import Link from 'next/link'
import { Check } from 'lucide-react'

type Plan = {
  name: string
  price: string
  period: string
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free Pilot',
    price: '$0',
    period: '90 days',
    features: [
      'QR kit for your door',
      'Your own offer screen',
      'Basic scan counts',
      'Cancel anytime',
    ],
  },
  {
    name: 'Business',
    price: '$49/mo',
    period: 'per location',
    popular: true,
    features: [
      'Everything in Pilot',
      'Change offers anytime',
      'Weekly scan reports',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '$149/mo',
    period: 'per location',
    features: [
      'Everything in Business',
      'Busy-hour insights',
      'Multiple campaigns at once',
      'Priority support',
    ],
  },
]

export default function BusinessPricing() {
  return (
    <section className="bg-fp-teal-tint px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">Simple pricing</h2>
          <p className="mt-3 text-base text-fp-gray-600">
            Every plan starts with 90 days free. Full features. No card.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`fp-card flex flex-col bg-fp-white p-6 ${
                plan.popular ? 'border-2 border-fp-teal' : ''
              }`}
            >
              {plan.popular && (
                <span className="mb-4 inline-flex w-fit rounded-full bg-fp-teal-tint px-3 py-1 text-xs font-semibold text-fp-teal-dark">
                  Most popular
                </span>
              )}
              <h3 className="text-xl font-bold text-fp-ink">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-fp-ink">{plan.price}</p>
              <p className="mt-1 text-sm text-fp-gray-600">{plan.period}</p>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-fp-gray-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-fp-teal" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/business/claim"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-fp-teal px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-fp-teal-dark"
              >
                Start free
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
