import type { Metadata } from 'next'
import BusinessPageContent from '../../components/business/BusinessPageContent'

export const metadata: Metadata = {
  title: 'FlushPin for Business - Restroom Intent Marketing',
  description:
    'Turn every restroom code ask into a customer. One QR sticker shows your offer, delivers the code, and keeps your staff focused — free for 90 days.',
  alternates: { canonical: 'https://www.flushpin.com/business' },
}

export default function BusinessPage() {
  return <BusinessPageContent />
}
