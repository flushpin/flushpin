import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/map',
  },
}

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children
}
