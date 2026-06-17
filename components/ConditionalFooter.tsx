'use client'

import { usePathname } from 'next/navigation'
import SiteFooter from './SiteFooter'

const hiddenPrefixes = ['/admin']

export default function ConditionalFooter() {
  const pathname = usePathname()

  if (hiddenPrefixes.some(prefix => pathname.startsWith(prefix))) {
    return null
  }

  return <SiteFooter />
}
