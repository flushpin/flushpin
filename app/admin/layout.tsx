import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-admin-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-admin-display' })

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/admin',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
