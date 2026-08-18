import Link from 'next/link'

type ValuePoint = {
  number: string
  title: string
  body: string
}

type Stage = {
  label: string
  status: 'now' | 'later'
  title: string
  body: string
}

const valuePoints: ValuePoint[] = [
  {
    number: '1',
    title: "They're already outside.",
    body:
      'Someone standing at your entrance looking for a restroom is the cheapest customer you will ever get. They didn\u2019t need an ad to find you. They just need a way in.',
  },
  {
    number: '2',
    title: 'People who come in, buy.',
    body:
      'A restroom visit is rarely just a restroom visit. Coffee, a drink, a snack \u2014 the trip that started as a need ends as a transaction. Turning that person away costs you the sale and the goodwill.',
  },
  {
    number: '3',
    title: "You'll know it's working.",
    body:
      'FlushPin records every time someone requests access to your location \u2014 how many, when, and from where. Not a guess. A number.',
  },
]

const stages: Stage[] = [
  {
    label: 'Stage 1',
    status: 'now',
    title: 'Free today: claim your location',
    body:
      'Confirm your details, correct what\u2019s wrong, and mark your restroom as open to the public. No cost, no contract. Businesses that are accurate and open get shown first.',
  },
  {
    label: 'Stage 2',
    status: 'later',
    title: 'Demand reports',
    body:
      'See how many people looked for restroom access at your location, at what hours, and from which neighborhoods. Restroom demand is foot traffic that never showed up on your books.',
  },
  {
    label: 'Stage 3',
    status: 'later',
    title: 'Your moment with the customer',
    body:
      'Before the access code appears, your offer does. A few seconds of undivided attention from someone who is already at your door.',
  },
]

export default function BusinessPricing() {
  return (
    <section id="packages" className="scroll-mt-24 bg-fp-teal-tint px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">
            Locked restrooms send customers to your competitor.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-fp-gray-600 md:text-lg">
            Every day, drivers, delivery workers, and parents walk up to a door they can&apos;t
            open &mdash; and go somewhere else. FlushPin gets them through your door instead.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
          {valuePoints.map((point) => (
            <div
              key={point.number}
              className="fp-card flex h-full flex-col bg-fp-white p-6 md:p-7"
            >
              <span
                aria-hidden="true"
                className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-fp-teal-tint text-sm font-semibold text-fp-teal-dark"
              >
                {point.number}
              </span>
              <h3 className="text-xl font-bold text-fp-ink">{point.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fp-gray-600 md:text-base">
                {point.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 items-stretch gap-4 md:mt-14 md:grid-cols-3">
          {stages.map((stage) => {
            const statusLabel = stage.status === 'now' ? 'Available now' : 'Later'
            const statusColor =
              stage.status === 'now' ? 'text-fp-teal-dark' : 'text-fp-gray-400'
            return (
              <div
                key={stage.label}
                className="h-full rounded-2xl border border-fp-border bg-fp-white p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-fp-gray-600">
                    {stage.label}
                  </span>
                  <span aria-hidden="true" className="text-fp-gray-400">
                    &middot;
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${statusColor}`}
                  >
                    {statusLabel}
                  </span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-fp-ink">
                  {stage.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-fp-gray-600">
                  {stage.body}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 text-center md:mt-14">
          <p className="max-w-xl text-base leading-relaxed text-fp-gray-600 md:text-lg">
            Tell us about your location and we&apos;ll get you set up.
          </p>
          <Link
            href="/business/start"
            className="inline-flex items-center justify-center rounded-full bg-fp-teal px-8 py-3.5 text-base font-semibold text-white no-underline transition-colors hover:bg-fp-teal-dark"
          >
            Claim your location
          </Link>
        </div>
      </div>
    </section>
  )
}
