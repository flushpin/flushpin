import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/business/claim',
  },
}

export default function BusinessClaimLayout({ children }: { children: React.ReactNode }) {
  return children
}
