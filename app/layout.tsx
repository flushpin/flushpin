import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '../lib/LanguageContext'
import ConditionalFooter from '../components/ConditionalFooter'
import SiteHeader from '../components/SiteHeader'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.flushpin.com'),
  title: 'FlushPin — Find Restroom Codes Anywhere',
  description:
    'Find nearby restrooms and their door codes anywhere in the world. Live data on millions of locations. Free for travelers, families, and road trippers.',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'FlushPin — Find Restroom Codes Anywhere',
    description:
      'Find nearby restrooms and their door codes anywhere in the world. Live data on millions of locations. Free for travelers, families, and road trippers.',
    url: 'https://www.flushpin.com',
    siteName: 'FlushPin',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <SiteHeader />
          {children}
        </LanguageProvider>
        <ConditionalFooter />
      </body>
    </html>
  )
}
