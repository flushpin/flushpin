import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
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

export default async function RestroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const r = await getRestroom(id)
  if (!r) notFound()

  const name = r.name ?? 'Unnamed location'
  const access = accessDisplay(r.access_type, r.has_code)
  const conf = computeConfidence(r.pin_updated_at)
  const isVerified = conf.level === 'high' || conf.level === 'reliable'

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <AccessPanel
          id={r.id}
          name={name}
          address={r.address}
          lat={r.lat}
          lng={r.lng}
          hasRevealableCode={access.hasRevealableCode}
          accessType={r.access_type}
          hasCode={r.has_code}
          accessible={r.accessible}
          hasBabyChanging={r.has_baby_changing}
          access={access}
          confidenceDetail={conf.detail}
          confidenceLabel={conf.label}
          isVerified={isVerified}
        />
      </div>
    </main>
  )
}
