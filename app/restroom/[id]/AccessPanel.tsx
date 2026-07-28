'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { directionsLinks, isIOS } from '@/lib/restroomAccess'
import styles from './page.module.css'

type Phase = 'idle' | 'checking' | 'need-login' | 'promo' | 'loading' | 'done' | 'error'

interface Props {
  id: number
  name: string
  lat: number | null
  lng: number | null
  hasRevealableCode: boolean
  accessType: string | null
}

export default function AccessPanel({ id, name, lat, lng, hasRevealableCode }: Props) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [code, setCode] = useState<string | null>(null)
  const [openAccess, setOpenAccess] = useState(false)
  const [err, setErr] = useState('')

  async function reveal() {
    setErr(''); setPhase('checking')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setPhase('need-login'); return }

    setPhase('promo')
    await new Promise((r) => setTimeout(r, 3000))

    setPhase('loading')
    const { data, error } = await supabase.rpc('get_restroom_access_code', { restroom_id: id })
    if (error) { setErr(error.message || 'Could not load the access code.'); setPhase('error'); return }

    const row = Array.isArray(data) ? data[0] : data
    const pin: string | null = row?.pin ?? null
    if (!pin || pin === 'open') { setOpenAccess(true); setCode(null) }
    else setCode(pin)
    setPhase('done')
  }

  function openDirections() {
    if (lat == null || lng == null) return
    const l = directionsLinks(lat, lng, name)
    window.open(isIOS() ? l.apple : l.google, '_blank', 'noopener')
  }

  async function share() {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const payload = { title: 'FlushPin', text: `Restroom access at ${name} — FlushPin`, url }
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share(payload) } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(url); setErr('Link copied'); setTimeout(() => setErr(''), 1500) } catch {}
    }
  }

  return (
    <section className={styles.panel}>
      {hasRevealableCode && (
        <div className={styles.reveal}>
          {phase === 'idle' && (
            <button className={styles.primary} onClick={reveal}>View access code</button>
          )}
          {phase === 'checking' && <button className={styles.primary} disabled>Checking…</button>}
          {phase === 'promo' && <button className={styles.primary} disabled>Preparing access…</button>}
          {phase === 'loading' && <button className={styles.primary} disabled>Loading code…</button>}

          {phase === 'need-login' && (
            <div className={styles.loginBox}>
              <p>Sign in to view the access code.</p>
              <a className={styles.primary} href={`/login?next=/restroom/${id}`}>Sign in</a>
            </div>
          )}

          {phase === 'done' && code && (
            <div className={styles.codeBox}>
              <div className={styles.codeKicker}>Access code</div>
              <div className={styles.codeValue}>{code}</div>
            </div>
          )}
          {phase === 'done' && openAccess && (
            <div className={styles.codeBox}><div className={styles.codeValue}>Open access — no code</div></div>
          )}
          {phase === 'error' && (
            <div className={styles.errorBox}>{err || 'Something went wrong.'}<button className={styles.linkBtn} onClick={reveal}>Try again</button></div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.secondary} onClick={openDirections} disabled={lat == null || lng == null}>Directions</button>
        <button className={styles.secondary} onClick={share}>Share</button>
      </div>
      {err === 'Link copied' && <div className={styles.toast}>Link copied</div>}
    </section>
  )
}
