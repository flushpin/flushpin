import type { Metadata } from 'next'
import HomePage from './HomePage'
import HomeJsonLd from '../components/HomeJsonLd'
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '../lib/seo'

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
  },
}

export default function Page() {
  return (
    <>
      <HomeJsonLd />
      <HomePage />
    </>
  )
}
