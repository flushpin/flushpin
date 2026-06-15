import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/business',
  },
}

export default function BusinessLayout({ children }: { children: React.ReactNode }) {
  return children
}
