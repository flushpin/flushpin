import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/optout',
  },
}

export default function OptoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
