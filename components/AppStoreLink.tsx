import { APP_STORE_URL } from '../lib/site'
import { APP_STORE_BADGE_SVG } from '../lib/app-store-badge-markup'

/** Official Apple badge aspect ratio (119.66407 × 40). */
const BADGE_ASPECT = 119.66407 / 40

type AppStoreLinkProps = {
  height?: number
  className?: string
}

function AppStoreBadge({ height }: { height: number }) {
  const width = Math.round(height * BADGE_ASPECT)
  const svg = APP_STORE_BADGE_SVG.replace(
    '<svg fill="none" id="livetype"',
    `<svg fill="none" id="livetype" width="${width}" height="${height}"`,
  ).replace(/\swidth="119\.66407"/, '').replace(/\sheight="40"/, '')

  return (
    <span
      className="inline-block leading-none"
      style={{ lineHeight: 0 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default function AppStoreLink({ height = 48, className }: AppStoreLinkProps) {
  return (
    <a
      href={APP_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label="Download FlushPin on the App Store"
      style={{ display: 'inline-block', lineHeight: 0, flexShrink: 0, background: 'transparent' }}
    >
      <AppStoreBadge height={height} />
    </a>
  )
}
