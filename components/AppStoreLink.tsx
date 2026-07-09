import { APP_STORE_URL } from '../lib/site'

/** Official Apple badge aspect ratio (119.66407 × 40). */
const BADGE_ASPECT = 119.66407 / 40

type AppStoreLinkProps = {
  height?: number
  className?: string
}

export default function AppStoreLink({ height = 48, className }: AppStoreLinkProps) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Download FlushPin on the App Store"
      style={{ display: 'inline-block', lineHeight: 0, flexShrink: 0 }}
    >
      <img
        src="/app-store-badge.svg"
        alt="Download FlushPin on the App Store"
        width={Math.round(height * BADGE_ASPECT)}
        height={height}
        style={{ height, width: 'auto', display: 'block' }}
      />
    </a>
  )
}
