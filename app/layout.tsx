import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '../lib/LanguageContext'

export const metadata: Metadata = {
  title: 'FlushPin',
  description: 'Find restroom access codes',
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