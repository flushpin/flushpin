import type { Metadata } from 'next'
import { Suspense } from 'react'
import BusinessLeadForm from '../../../components/business/BusinessLeadForm'

export const metadata: Metadata = {
  title: 'Get Started — FlushPin for Business',
  description:
    'Tell us about your shop and we will reach out to set up your FlushPin QR sticker and plan.',
  alternates: { canonical: 'https://www.flushpin.com/business/start' },
}

function FormFallback() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-6 px-4">
      <div className="mx-auto h-8 w-48 rounded-full bg-fp-border" />
      <div className="mx-auto h-10 w-3/4 rounded-lg bg-fp-border" />
      <div className="fp-card h-96 bg-fp-white" />
    </div>
  )
}

export default function BusinessStartPage() {
  return (
    <main className="min-h-screen bg-fp-white px-4 py-12 md:px-6 md:py-16">
      <Suspense fallback={<FormFallback />}>
        <BusinessLeadForm />
      </Suspense>
    </main>
  )
}
