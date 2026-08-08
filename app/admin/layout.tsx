import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { notFound } from 'next/navigation'
import { isAdminDashboardEnabled } from '../../lib/serverReleaseFlags'

const inter = Inter({ subsets: ['latin'], variable: '--font-admin-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-admin-display' })

export const metadata: Metadata = {
  title: 'Founder Dashboard',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!isAdminDashboardEnabled()) notFound()

  return (
    <div className={`${inter.variable} ${spaceGrotesk.variable}`} style={{ minHeight: '100vh' }}>
      {children}
    </div>
  )
}
