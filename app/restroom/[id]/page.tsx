import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { computeConfidence } from '@/lib/confidence'
import { accessDisplay } from '@/lib/restroomAccess'
import AccessPanel from './AccessPanel'
import styles from './page.module.css'

export const revalidate = 60

interface RestroomPublic {
  id: number
  name: string | null
  address: string | null
  score: number | null
  pin_updated_at: string | null
  status: string | null
  verified: string | null
  accessible: boolean | null
  has_baby_changing: boolean | null
  access_type: string | null
  has_code: boolean | null
  lat: number | null
  lng: number | null
  source: string | null
  external_id: string | null
}

const PUBLIC_FIELDS =
  'id,name,address,score,pin_updated_at,status,verified,accessible,has_baby_changing,access_type,has_code,lat,lng,source,external_id'

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  return createClient(url, key, { auth: { persistSession: false } })
}

async function getRestroom(id: string): Promise<RestroomPublic | null> {
  const numId = Number(id)
  if (!Number.isFinite(numId)) return null
  const { data, error } = await serverClient()
    .from('restroom_public')
    .select(PUBLIC_FIELDS)
    .eq('id', numId)
    .maybeSingle()
  if (error) return null
  return (data as RestroomPublic) ?? null
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const r = await getRestroom(id)
  if (!r) return { title: 'Restroom not found | FlushPin' }
  const name = r.name ?? 'this location'
  return {
    title: `Restroom access at ${name} | FlushPin`,
    description: `How to access the restroom at ${name}${r.address ? `, ${r.address}` : ''}: access type, requirements, and how recently it was verified.`,
    robots: { index: true, follow: true },
  }
}

function Icon({ name }: { name: string }) {
  const p = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'lock': return <svg {...p}><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>
    case 'open': return <svg {...p}><path d="M3 21h18"/><path d="M6 21V5a2 2 0 0 1 2-2h6l4 4v14"/><path d="M14 3v4h4"/></svg>
    case 'staff': return <svg {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
    case 'cart': return <svg {...p}><circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 13h11"/><path d="M6 6h15l-2 7H7.5"/></svg>
    case 'restricted': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M5 5l14 14"/></svg>
    case 'shield': return <svg {...p}><path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>
    case 'star': return <svg {...p}><path d="M12 3l2.7 5.6 6 .9-4.3 4.3 1 6-5.4-2.9L6.6 20l1-6L3.3 9.5l6-.9z"/></svg>
    case 'wheelchair': return <svg {...p}><circle cx="12" cy="4" r="2"/><path d="M11 7v6h5l3 5"/><path d="M11 13a5 5 0 1 0 4 8"/></svg>
    case 'baby': return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 1 5 1 6 0"/></svg>
    default: return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
  }
}

export default async function RestroomDetailPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const r = await getRestroom(id)
  if (!r) notFound()

  const name = r.name ?? 'Unnamed location'
  const access = accessDisplay(r.access_type, r.has_code)
  const conf = computeConfidence(r.pin_updated_at)
  const score = typeof r.score === 'number' && r.score > 0 ? r.score : null
  const C = 2 * Math.PI * 20

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <Link href="/map" className={styles.back}>← Back to map</Link>

        <header className={styles.head}>
          <h1 className={styles.name}>{name}</h1>
          {r.address && <p className={styles.address}>{r.address}</p>}
        </header>

        <section className={`${styles.hero} ${styles[access.icon]}`}>
          <div className={styles.heroIcon}><Icon name={access.icon} /></div>
          <div className={styles.heroBody}>
            <div className={styles.heroLabel}>{access.label}</div>
            <div className={styles.heroHint}>{access.hint}</div>
          </div>
        </section>

        <AccessPanel
          id={r.id}
          name={name}
          lat={r.lat}
          lng={r.lng}
          hasRevealableCode={access.hasRevealableCode}
          accessType={r.access_type}
        />

        <section className={styles.trust}>
          <div className={`${styles.trustCard} ${styles[`conf_${conf.level}`]}`}>
            <div className={styles.confRingWrap}>
              <svg width="52" height="52" viewBox="0 0 52 52" className={styles.confRing}>
                <circle cx="26" cy="26" r="20" className={styles.ringTrack} />
                <circle cx="26" cy="26" r="20" className={styles.ringFill}
                  strokeDasharray={C} strokeDashoffset={C * (1 - conf.ring)}
                  transform="rotate(-90 26 26)" />
              </svg>
              <span className={styles.confShield}><Icon name="shield" /></span>
            </div>
            <div>
              <div className={styles.trustKicker}>Confidence</div>
              <div className={styles.trustValue}>{conf.label}</div>
              <div className={styles.trustDetail}>{conf.detail}</div>
            </div>
          </div>

          <div className={`${styles.trustCard} ${styles.scoreCard}`}>
            <div className={styles.scoreIcon}><Icon name="star" /></div>
            <div>
              <div className={styles.trustKicker}>FlushScore</div>
              <div className={styles.trustValue}>{score !== null ? score.toFixed(1) : '—'}</div>
              <div className={styles.trustDetail}>{score !== null ? 'Cleanliness & condition' : 'Not rated yet'}</div>
            </div>
          </div>
        </section>

        {(r.accessible || r.has_baby_changing) && (
          <section className={styles.facilities}>
            {r.accessible && <span className={styles.facility}><Icon name="wheelchair" /> ADA accessible</span>}
            {r.has_baby_changing && <span className={styles.facility}><Icon name="baby" /> Baby changing</span>}
          </section>
        )}

        <p className={styles.disclaimer}>
          Access info is verified by the FlushPin community and may change. Confidence reflects how recently it was confirmed — not a guarantee.
        </p>
      </div>
    </main>
  )
}
