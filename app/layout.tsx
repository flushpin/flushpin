import type { Metadata } from 'next'
import SwRegister from './sw-register'
import { LanguageProvider } from '../lib/LanguageContext'

export const metadata: Metadata = {
  title: 'FlushPin — Find Restroom PIN Codes Near You',
  description: 'Find restroom PIN codes and access codes at Starbucks, Panera, Target, and thousands of businesses near you. Free, community-powered restroom finder.',
  keywords: 'restroom PIN code, bathroom code, restroom access, find bathroom near me, toilet code, restroom finder',
  manifest: '/manifest.json',
  themeColor: '#1D9E75',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FlushPin',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  openGraph: {
    title: 'FlushPin — Find Restroom PIN Codes Near You',
    description: 'Community-powered restroom PIN code finder. Starting in California, coming to New York, Chicago, Istanbul and beyond.',
    url: 'https://www.flushpin.com',
    siteName: 'FlushPin',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlushPin — Find Restroom PIN Codes Near You',
    description: 'Find restroom PIN codes near you. Free, fast, community-powered.',
  },
  alternates: {
    canonical: 'https://www.flushpin.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
        <meta name="apple-mobile-web-app-title" content="FlushPin"/>
        <meta name="theme-color" content="#1D9E75"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
      </head>
      <body style={{margin:0,padding:0}}>
        <LanguageProvider>
          <SwRegister/>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}