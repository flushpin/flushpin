import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '../lib/LanguageContext'

export const metadata: Metadata = {
  title: 'FlushPin — Restroom Intelligence',
  description: 'Location-based restroom intelligence for people who need access and businesses who want opportunity. Community-powered, California-first.',
  openGraph: {
    title: 'FlushPin — Restroom Intelligence',
    description: 'Find nearby restroom access guidance, community updates, and business intelligence.',
    url: 'https://www.flushpin.com',
    siteName: 'FlushPin',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  )
}
