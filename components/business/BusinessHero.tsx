import Link from 'next/link'

export default function BusinessHero() {
  return (
    <section className="bg-fp-white px-4 py-20 text-center md:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <span className="inline-flex rounded-full bg-fp-teal-tint px-4 py-1.5 text-sm font-semibold text-fp-teal-dark">
          FlushPin for Businesses
        </span>
        <h1 className="fp-hero-title mt-8">
          People ask for your restroom code all day. Turn every ask into a customer.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-fp-gray-600">
          One QR sticker by your register. Customers scan it, see your offer, and get the code — without
          ever interrupting your staff.
        </p>
        <div className="mt-10">
          <Link
            href="/business/start"
            className="inline-flex items-center justify-center rounded-full bg-fp-teal px-8 py-3.5 text-base font-semibold text-white no-underline transition-colors hover:bg-fp-teal-dark"
          >
            List my business free
          </Link>
        </div>
      </div>
    </section>
  )
}
