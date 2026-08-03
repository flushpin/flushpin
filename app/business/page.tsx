import type { Metadata } from 'next'
import BusinessPageContent from '../../components/business/BusinessPageContent'

export const metadata: Metadata = {
  title: 'FlushPin for Business - Restroom Intent Marketing',
  description:
    'Turn every restroom code ask into a customer. Free Listing is always free. Paid QR plans start at $9/mo — scan, show your offer, deliver the code.',
  alternates: { canonical: 'https://www.flushpin.com/business' },
}

export default function BusinessPage() {
  return <BusinessPageContent />
}
