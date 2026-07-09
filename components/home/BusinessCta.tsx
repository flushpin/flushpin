import Link from 'next/link'

export default function BusinessCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-fp-teal-tint p-12 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">
            Own a business? Turn restroom traffic into customers.
          </h2>
          <p className="mt-3 text-base leading-relaxed text-fp-gray-600">
            FlushPin turns restroom demand into a QR ad display: scan, show your message, reveal
            the access code — turning overlooked foot traffic into customer visits.
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Link
            href="/business"
            className="inline-flex items-center justify-center rounded-full bg-fp-ink px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-fp-gray-600"
          >
            See Business plans
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-fp-teal no-underline hover:text-fp-teal-dark"
          >
            Contact FlushPin
          </Link>
        </div>
      </div>
    </section>
  )
}
