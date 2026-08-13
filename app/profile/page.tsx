'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ShareFlushPin from '@/components/share/ShareFlushPin'
import { supabase } from '@/lib/supabase'
import {
  contributionSummaryCopy,
  EMPTY_PROFILE_IMPACT,
  monthlyActivityTimeline,
  normalizeImpactMetrics,
  resolveCommunityLevel,
  type ProfileImpactMetrics,
} from '@/lib/profileImpact'

type ProfileUser = {
  email?: string
  user_metadata?: { full_name?: string; profile_color?: string }
}

type ImpactCard = {
  emoji: string
  label: string
  value: number
}

function ImpactMetricCards({ metrics }: { metrics: ProfileImpactMetrics }) {
  const cards: ImpactCard[] = [
    { emoji: '🚻', label: 'Restrooms viewed', value: metrics.restroomsViewed },
    { emoji: '🔑', label: 'Access codes contributed', value: metrics.codesContributed },
    { emoji: '✅', label: 'Codes verified', value: metrics.codesVerified },
    { emoji: '🚼', label: 'Amenities confirmed', value: metrics.amenitiesConfirmed },
    { emoji: '⭐', label: 'Community reports submitted', value: metrics.communityReports },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-[22px] border border-fp-border bg-fp-white px-4 py-5 shadow-[var(--fp-shadow-soft)] sm:px-5"
        >
          <p className="m-0 text-2xl leading-none" aria-hidden="true">
            {card.emoji}
          </p>
          <p className="m-0 mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-fp-ink tabular-nums">
            {card.value}
          </p>
          <p className="m-0 mt-1 text-[13px] leading-snug text-fp-gray-600">{card.label}</p>
        </article>
      ))}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<ProfileUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [monthMetrics, setMonthMetrics] = useState<ProfileImpactMetrics>(EMPTY_PROFILE_IMPACT)
  const [lifetimeMetrics, setLifetimeMetrics] =
    useState<ProfileImpactMetrics>(EMPTY_PROFILE_IMPACT)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!active) return
      if (!session?.user) {
        router.replace('/signup')
        return
      }
      setUser(session.user)
      setAuthReady(true)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace('/signup')
        return
      }
      setUser(session.user)
      setAuthReady(true)
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [router])

  useEffect(() => {
    if (!authReady || !user) return
    let cancelled = false

    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) return

      try {
        const res = await fetch('/api/profile/impact', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        const payload = (await res.json().catch(() => ({}))) as {
          month?: Partial<ProfileImpactMetrics>
          lifetime?: Partial<ProfileImpactMetrics>
        }
        if (cancelled) return
        setMonthMetrics(normalizeImpactMetrics(payload.month))
        setLifetimeMetrics(normalizeImpactMetrics(payload.lifetime))
      } catch {
        if (!cancelled) {
          setMonthMetrics(EMPTY_PROFILE_IMPACT)
          setLifetimeMetrics(EMPTY_PROFILE_IMPACT)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [authReady, user])

  if (!authReady || !user) {
    return <main className="min-h-[60vh] bg-fp-surface" aria-busy="true" />
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Explorer'
  const profileColor = user.user_metadata?.profile_color || '#00A886'
  const level = resolveCommunityLevel(lifetimeMetrics)
  const summaryLines = contributionSummaryCopy(monthMetrics)
  const timeline = monthlyActivityTimeline(monthMetrics)

  return (
    <main className="bg-fp-surface">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 md:px-6 md:py-14">
        {/* Section 1 — compact profile */}
        <section className="mb-8 rounded-[26px] border border-fp-border bg-fp-white p-5 shadow-[var(--fp-shadow-soft)] sm:p-6">
          <div className="flex items-center gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white"
              style={{ background: profileColor }}
              aria-hidden="true"
            >
              {displayName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <h1 className="m-0 truncate text-xl font-semibold tracking-[-0.03em] text-fp-ink">
                {displayName}
              </h1>
              {user.email ? (
                <p className="m-0 mt-0.5 truncate text-sm text-fp-gray-600">{user.email}</p>
              ) : null}
            </div>
          </div>
          <p className="m-0 mt-4 text-[14px] leading-relaxed text-fp-gray-600">
            Thank you for being part of FlushPin — every update helps someone find a restroom faster.
          </p>
        </section>

        {/* Section 2 — hero impact */}
        <section className="mb-8">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
            This month
          </p>
          <h2 className="m-0 mt-2 text-[1.75rem] font-semibold tracking-[-0.035em] text-fp-ink sm:text-[2rem]">
            Your Impact This Month
          </h2>
          <p className="m-0 mt-2 max-w-md text-[15px] leading-relaxed text-fp-gray-600">
            A simple look at how you’ve helped the FlushPin community.
          </p>
          <div className="mt-5">
            <ImpactMetricCards metrics={monthMetrics} />
          </div>
        </section>

        {/* Section 3 — contribution summary */}
        <section className="mb-8 rounded-[26px] border border-fp-border bg-fp-white p-6 shadow-[var(--fp-shadow-soft)] sm:p-7">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
            Contribution summary
          </p>
          <ul className="m-0 mt-4 list-none space-y-3 p-0">
            {summaryLines.map((line) => (
              <li key={line} className="text-[15px] leading-relaxed text-fp-ink">
                {line}
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4 — community level */}
        <section className="mb-8 rounded-[26px] border border-fp-teal/20 bg-fp-teal-tint p-6 shadow-[var(--fp-shadow-soft)] sm:p-7">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
            Community level
          </p>
          <h2 className="m-0 mt-2 text-2xl font-semibold tracking-[-0.03em] text-fp-ink">
            {level.label}
          </h2>
          <p className="m-0 mt-2 text-[15px] leading-relaxed text-fp-gray-600">{level.blurb}</p>
        </section>

        {/* Section 5 — monthly activity timeline */}
        <section className="mb-8 rounded-[26px] border border-fp-border bg-fp-white p-6 shadow-[var(--fp-shadow-soft)] sm:p-7">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
            Monthly activity
          </p>
          <h2 className="m-0 mt-2 text-xl font-semibold tracking-[-0.03em] text-fp-ink">This month</h2>
          <ul className="m-0 mt-5 list-none space-y-3 p-0">
            {timeline.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-[15px] leading-snug text-fp-ink">
                <span className="mt-0.5 text-fp-teal" aria-hidden="true">
                  ✓
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 6 — invite friends (below impact) */}
        <section className="mb-8">
          <ShareFlushPin surface="profile" variant="card" />
        </section>
      </div>
    </main>
  )
}
