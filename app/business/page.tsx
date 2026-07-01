import type { Metadata } from 'next'
import BusinessPageContent from './BusinessPageContent'

export const metadata: Metadata = {
  title: 'FlushPin for Business - QR Restroom Access and Local Offers',
  description: 'Reduce restroom code interruptions with QR access, short ad displays, password reveal, and campaign performance for local businesses.',
  alternates: { canonical: 'https://www.flushpin.com/business' },
}

export default function BusinessPage() {
  return <BusinessPageContent />
}
