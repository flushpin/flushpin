import Link from 'next/link'

export default function BusinessFinalCta() {
  return (
    <section className="bg-fp-footer px-4 py-16 text-center md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-2xl font-bold text-white md:text-3xl">
          Your restroom code is asked every day. Make it work for you.
        </h2>
        <Link
          href="/business/claim"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-fp-teal px-8 py-3.5 text-base font-semibold text-white no-underline transition-colors hover:bg-fp-teal-dark"
        >
          Claim your business — free for 90 days
        </Link>
        <p className="mt-6 text-sm text-fp-gray-400">
          Set up takes 10 minutes. We&apos;ll help.{' '}
          <Link href="/contact" className="font-medium text-white no-underline hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </section>
  )
}
