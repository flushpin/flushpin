'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ShareFlushPin from '@/components/share/ShareFlushPin'
import { supabase } from '@/lib/supabase'

type ProfileUser = {
  email?: string
  user_metadata?: { full_name?: string; profile_color?: string }
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (!session?.user) {
        router.replace('/signup')
        return
      }
      setUser(session.user)
      setLoading(false)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/signup')
        return
      }
      setUser(session.user)
      setLoading(false)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  if (loading || !user) {
    return (
      <main className="min-h-[60vh] bg-fp-surface px-4 py-16">
        <p className="mx-auto max-w-lg text-center text-sm text-fp-gray-600">Loading your profile…</p>
      </main>
    )
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Explorer'
  const profileColor = user.user_metadata?.profile_color || '#00A886'

  return (
    <main className="bg-fp-surface">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6 md:py-14">
        <section className="mb-6 rounded-[26px] border border-fp-border bg-fp-white p-6 shadow-[var(--fp-shadow-soft)] sm:p-8">
          <div className="flex items-center gap-4">
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
              style={{ background: profileColor }}
              aria-hidden="true"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
                Your profile
              </p>
              <h1 className="m-0 mt-1 truncate text-2xl font-semibold tracking-[-0.03em] text-fp-ink">
                {displayName}
              </h1>
              {user.email ? (
                <p className="m-0 mt-1 truncate text-sm text-fp-gray-600">{user.email}</p>
              ) : null}
            </div>
          </div>
          <p className="m-0 mt-5 text-[15px] leading-relaxed text-fp-gray-600">
            Thank you for being part of FlushPin. When you invite someone, you help the next person
            find a restroom with less stress.
          </p>
          <Link
            href="/map"
            className="mt-5 inline-flex text-sm font-semibold text-fp-teal no-underline hover:text-fp-teal-dark"
          >
            Find a restroom →
          </Link>
        </section>

        <ShareFlushPin surface="profile" variant="card" />
      </div>
    </main>
  )
}
