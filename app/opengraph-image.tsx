import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'FlushPin — Find restroom codes nearby'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/** Default social share image for FlushPin brand search + link previews. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(145deg, #042F2E 0%, #0EB5AB 55%, #ECFBF9 100%)',
          color: '#fff',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#fff',
              color: '#0EB5AB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            ⌖
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>FlushPin</div>
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
          <span>Free on the App Store</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
