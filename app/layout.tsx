import type { Metadata } from 'next'
import SwRegister from './sw-register'
import { LanguageProvider } from '../lib/LanguageContext'

export const metadata: Metadata = {
  title: 'FlushPin — Restroom access, made simple.',
  description: 'Community-shared restroom access information for travelers, parents, and anyone in need.',
  manifest: '/manifest.json',
  themeColor: '#1D9E75',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FlushPin',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
