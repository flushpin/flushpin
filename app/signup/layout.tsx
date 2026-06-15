import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/signup',
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
