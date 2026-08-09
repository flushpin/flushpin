import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const alt = 'FlushPin — Find restroom codes nearby'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Official wordmark aspect from public/flushpin-logo-teal.png (1396×623). */
const LOGO_HEIGHT = 72
const LOGO_WIDTH = Math.round(LOGO_HEIGHT * (1396 / 623))

/** Default social share image for FlushPin brand search + link previews. */
export default async function OpenGraphImage() {
  const logoBytes = await readFile(join(process.cwd(), 'public/flushpin-logo-teal.png'))
  const logoSrc = `data:image/png;base64,${Buffer.from(logoBytes).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '56px 64px',
          background: 'linear-gradient(145deg, #042F2E 0%, #0EB5AB 55%, #ECFBF9 100%)',
          color: '#fff',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px 20px',
            borderRadius: 20,
            background: '#ffffff',
            boxShadow: '0 10px 28px rgba(4, 47, 46, 0.18)',
            alignSelf: 'flex-start',
          }}
        >
          <img
            src={logoSrc}
            alt="FlushPin"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            style={{ width: LOGO_WIDTH, height: LOGO_HEIGHT, objectFit: 'contain' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 900 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.05, letterSpacing: -1.5 }}>
            Restroom codes. Nearby.
          </div>
          <div style={{ fontSize: 28, color: 'rgba(255,255,255,0.92)', lineHeight: 1.35, maxWidth: 820 }}>
            Find community-shared door codes at cafés, gas stations, malls, and more — 34,000+ locations.
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 24, opacity: 0.95 }}>
          <span>www.flushpin.com</span>
          <span>Web &amp; PWA</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
