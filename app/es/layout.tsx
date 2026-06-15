import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/es',
  },
}

export default function EsLayout({ children }: { children: React.ReactNode }) {
  return children
}
