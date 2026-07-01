import type { Metadata, Viewport } from 'next'
import './globals.css'
import { LanguageProvider } from '../lib/LanguageContext'
import ConditionalFooter from '../components/ConditionalFooter'
import { APP_STORE_ID } from '../lib/site'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://www.flushpin.com'),
  title: 'FlushPin — Restroom Intelligence',
  description: 'Location-based restroom intelligence for people who need access and businesses who want opportunity. Community-powered, California-first.',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/flushpin-logo-teal.png', sizes: '48x48', type: 'image/png' },
      { url: '/flushpin-logo-teal.png', sizes: '192x192', type: 'image/png' },
      { url: '/flushpin-logo-teal.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/flushpin-logo-teal.png',
  },
  openGraph: {
    title: 'FlushPin — Restroom Intelligence',
    description: 'Find nearby restroom access guidance, community updates, and business intelligence.',
    url: 'https://www.flushpin.com',
    siteName: 'FlushPin',
    type: 'website',
  },
  other: {
    'apple-itunes-app': `app-id=${APP_STORE_ID}, app-argument=https://www.flushpin.com`,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
        <ConditionalFooter />
      </body>
    </html>
  )
}
