'use client'

import Image from 'next/image'
import { APP_STORE_URL } from '../lib/site'

type AppStoreLinkProps = {
  width?: number
  height?: number
  className?: string
}

export default function AppStoreLink({ width = 140, height = 42, className }: AppStoreLinkProps) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Download FlushPin on the App Store"
      style={{ display: 'inline-block', lineHeight: 0, flexShrink: 0 }}
    >
      <Image
        src="/apple.png"
        alt="Download on the App Store"
        width={width}
        height={height}
        style={{ width, height: 'auto', maxWidth: '100%' }}
      />
    </a>
  )
}
