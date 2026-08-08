'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { FounderAnalyticsPayload } from '../../lib/founderAnalyticsTypes'
import AccessDenied from './components/AccessDenied'
import FounderHero from './components/FounderHero'
import GeoTable from './components/GeoTable'
import InvestorModeToggle from './components/InvestorModeToggle'
import InvestorSnapshot from './components/InvestorSnapshot'
import LiveUsageStrip from './components/LiveUsageStrip'
import MetricCard from './components/MetricCard'
import OpsConsole from './components/OpsConsole'
import SectionHeader from './components/SectionHeader'
import TrendChart from './components/TrendChart'
import {
  adminTheme,
  btnStyle,
  cardStyle,
  seriesDelta,
  sumSeries,
} from './theme'
import { supabase } from '../../lib/supabase'

type MainTab = 'home' | 'ops'

function authHeaders(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` }
}

function metricNumber(value: { value: number | null; status: string } | undefined): number {
  if (!value || value.status !== 'ready' || value.value == null) return 0
  return value.value
}

function computeHealth(analytics: FounderAnalyticsPayload | null): { score: number; label: string } {
  if (!analytics) return { score: 0, label: 'Warming up' }

  const visitors = metricNumber(analytics.today.uniqueVisitors)
  const access = metricNumber(analytics.today.accessViews)
  const users = metricNumber(analytics.today.newRegisteredUsers)
  const contrib = metricNumber(analytics.today.communityContributions)
  const signedIn = metricNumber(analytics.today.signedInActiveUsers)
  const conversion = analytics.business.conversionRate ?? 0

  let score = 28
  if (visitors > 0) score += 12
  if (visitors >= 25) score += 8
  if (access > 0) score += 14
  if (access >= 20) score += 8
  if (users > 0) score += 10
  if (signedIn > 0) score += 8
  if (contrib > 0) score += 10
  if (conversion >= 5) score += 6
  if (analytics.sources.vercelConfigured) score += 4
  score = Math.min(98, score)

  let label = 'Building momentum'
  if (score >= 85) label = 'Thriving'
  else if (score >= 70) label = 'Strong pulse'
  else if (score >= 55) label = 'Healthy growth'
  else if (score >= 40) label = 'Getting traction'

  return { score, label }
}

function buildHeadline(analytics: FounderAnalyticsPayload | null): { headline: string; subline: string } {
  if (!analytics) {
    return {
      headline: 'Your FlushPin morning brief is loading.',
      subline: 'Product health, growth, community, and business engagement — one calm view.',
    }
  }

  const access = metricNumber(analytics.today.accessViews)
  const visitors = metricNumber(analytics.today.uniqueVisitors)
  const users = metricNumber(analytics.today.newRegisteredUsers)
  const contrib = metricNumber(analytics.today.communityContributions)

  if (access > 0 || visitors > 0) {
    return {
      headline: 'FlushPin is being used right now.',
      subline: `${access.toLocaleString()} access unlocks and ${visitors.toLocaleString()} visitors today — with ${users.toLocaleString()} new members and ${contrib.toLocaleString()} community helps.`,
    }
  }

  return {
    headline: 'A quiet start — the board is ready.',
    subline:
      'When people search, unlock access, join, and contribute, this page becomes your daily shot of momentum.',
  }
}

export default function FounderDashboard() {
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [signingIn, setSigningIn] = useState(false)
  const [mainTab, setMainTab] = useState<MainTab>('home')
  const [investorMode, setInvestorMode] = useState(false)
  const [accessState, setAccessState] = useState<'checking' | 'allowed' | 'denied'>('checking')
  const [authorizedEmail, setAuthorizedEmail] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<FounderAnalyticsPayload | null>(null)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(false)
  const [trendWindow, setTrendWindow] = useState<'7' | '30'>('7')

  useEffect(() => {
    let mounted = true
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      if (!next) {
        setAccessState('checking')
        setAuthorizedEmail(null)
        setAnalytics(null)
      }
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const verifyFounderAccess = useCallback(async (accessToken: string) => {
    setAccessState('checking')
    const res = await fetch('/admin/session', {
      headers: authHeaders(accessToken),
      cache: 'no-store',
    })
    const json = await res.json().catch(() => null)
    if (res.status === 403 || json?.error === 'forbidden') {
      setAccessState('denied')
      setAuthorizedEmail(null)
      setAnalytics(null)
      return false
    }
    if (!res.ok) {
      setAccessState('denied')
      setAuthorizedEmail(null)
      setAnalytics(null)
      return false
    }
    setAuthorizedEmail(typeof json?.email === 'string' ? json.email : null)
    setAccessState('allowed')
    return true
  }, [])

  const loadAnalytics = useCallback(async (accessToken: string, investor: boolean) => {
    setLoadingAnalytics(true)
    setAnalyticsError(null)
    try {
      const res = await fetch(`/admin/analytics?investor=${investor ? '1' : '0'}`, {
        headers: authHeaders(accessToken),
        cache: 'no-store',
      })
      const json = await res.json().catch(() => null)
      if (res.status === 403 || json?.error === 'forbidden') {
        setAccessState('denied')
        setAnalytics(null)
        return
      }
      if (!res.ok) {
        setAnalytics(null)
        // Never surface service-role / internal detail strings to the UI.
        setAnalyticsError(
          json?.error === 'admin_service_unavailable'
            ? 'Founder metrics are temporarily unavailable. Please try again shortly.'
            : 'Could not load founder metrics.',
        )
        return
      }
      setAnalytics(json as FounderAnalyticsPayload)
    } finally {
      setLoadingAnalytics(false)
    }
  }, [])

  useEffect(() => {
    if (!session?.access_token) return
    let cancelled = false
    void (async () => {
      const allowed = await verifyFounderAccess(session.access_token)
      if (cancelled || !allowed) return
      if (mainTab === 'home') {
        await loadAnalytics(session.access_token, investorMode)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [session?.access_token, investorMode, mainTab, verifyFounderAccess, loadAnalytics])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSigningIn(true)
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (signInError || !data.session) {
        setError(signInError?.message || 'Sign-in failed')
        return
      }
      setSession(data.session)
    } finally {
      setSigningIn(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setSession(null)
    setAnalytics(null)
    setAccessState('checking')
    setAuthorizedEmail(null)
    setAnalyticsError(null)
    setError('')
  }

  const health = useMemo(() => computeHealth(analytics), [analytics])
  const story = useMemo(() => buildHeadline(analytics), [analytics])

  const visitorTrend =
    trendWindow === '7' ? analytics?.trends.visitors7d ?? [] : analytics?.trends.visitors30d ?? []
  const newUserTrend =
    trendWindow === '7' ? analytics?.trends.newUsers7d ?? [] : analytics?.trends.newUsers30d ?? []
  const accessTrend =
    trendWindow === '7' ? analytics?.trends.accessViews7d ?? [] : analytics?.trends.accessViews30d ?? []
  const contributionTrend =
    trendWindow === '7'
      ? analytics?.trends.contributions7d ?? []
      : analytics?.trends.contributions30d ?? []

  const shellStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: adminTheme.bg,
    color: adminTheme.text,
    fontFamily: adminTheme.fontBody,
  }

  if (!authReady) {
    return (
      <div style={{ ...shellStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: adminTheme.teal, fontFamily: adminTheme.fontDisplay, fontSize: 18 }}>
          Preparing your founder brief…
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div
        style={{
          ...shellStyle,
          background: adminTheme.bgHero,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div style={{ width: '100%', maxWidth: 440 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                fontFamily: adminTheme.fontDisplay,
                fontSize: 34,
                fontWeight: 700,
                color: adminTheme.teal,
                letterSpacing: '-0.04em',
              }}
            >
              FlushPin
            </div>
            <div style={{ fontSize: 15, color: adminTheme.textSoft, marginTop: 8 }}>
              Founder Dashboard
            </div>
          </div>
          <form onSubmit={handleLogin} style={{ ...cardStyle(), padding: 28, boxShadow: adminTheme.shadow }}>
            <p style={{ margin: '0 0 18px', fontSize: 14, color: adminTheme.textSoft, lineHeight: 1.55 }}>
              Sign in with your FlushPin founder account. Access is checked on the server every time.
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 12, color: adminTheme.textMuted, marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                style={{
                  width: '100%',
                  background: adminTheme.bg,
                  border: `1px solid ${adminTheme.cardBorder}`,
                  borderRadius: 12,
                  padding: 12,
                  color: adminTheme.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontSize: 12, color: adminTheme.textMuted, marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{
                  width: '100%',
                  background: adminTheme.bg,
                  border: `1px solid ${adminTheme.cardBorder}`,
                  borderRadius: 12,
                  padding: 12,
                  color: adminTheme.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            {error ? (
              <div style={{ color: adminTheme.danger, fontSize: 13, marginBottom: 14, textAlign: 'center' }}>
                {error}
              </div>
            ) : null}
            <button type="submit" disabled={signingIn} style={{ ...btnStyle('primary'), width: '100%' }}>
              {signingIn ? 'Opening…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (accessState === 'checking') {
    return (
      <div style={{ ...shellStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: adminTheme.teal, fontFamily: adminTheme.fontDisplay, fontSize: 18 }}>
          Verifying founder access…
        </div>
      </div>
    )
  }

  if (accessState === 'denied') {
    return (
      <div style={shellStyle}>
        <AccessDenied
          email={session.user.email ?? authorizedEmail}
          onSignOut={() => void handleLogout()}
        />
      </div>
    )
  }

  return (
    <div style={shellStyle}>
      <header
        style={{
          padding: '14px 22px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(247,252,250,0.88)',
          backdropFilter: 'blur(14px)',
          borderBottom: `1px solid ${adminTheme.cardBorder}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div
              style={{
                fontFamily: adminTheme.fontDisplay,
                fontSize: 20,
                fontWeight: 700,
                color: adminTheme.teal,
                letterSpacing: '-0.03em',
              }}
            >
              FlushPin
            </div>
            <div style={{ fontSize: 12, color: adminTheme.textMuted, marginTop: 2 }}>Founder Dashboard</div>
          </div>
          <nav style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setMainTab('home')}
              style={btnStyle(mainTab === 'home' ? 'primary' : 'ghost')}
            >
              Home
            </button>
            {!investorMode ? (
              <button
                type="button"
                onClick={() => setMainTab('ops')}
                style={btnStyle(mainTab === 'ops' ? 'primary' : 'quiet')}
              >
                Workspace
              </button>
            ) : null}
          </nav>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <InvestorModeToggle enabled={investorMode} onChange={setInvestorMode} />
          <button
            type="button"
            onClick={() => session.access_token && loadAnalytics(session.access_token, investorMode)}
            style={btnStyle('ghost')}
          >
            Refresh
          </button>
          <button type="button" onClick={() => void handleLogout()} style={btnStyle('danger')}>
            Sign out
          </button>
        </div>
      </header>

      <main style={{ padding: '22px 20px 40px', maxWidth: 1180, margin: '0 auto' }}>
        {mainTab === 'ops' ? (
          <OpsConsole accessToken={session.access_token} investorMode={investorMode} />
        ) : (
          <>
            {analyticsError ? (
              <div
                style={{
                  ...cardStyle(),
                  padding: 16,
                  marginBottom: 16,
                  borderColor: 'rgba(220,38,38,0.25)',
                  color: adminTheme.danger,
                  fontSize: 14,
                }}
              >
                {analyticsError}
              </div>
            ) : null}

            <FounderHero
              healthScore={health.score}
              healthLabel={health.label}
              headline={story.headline}
              subline={story.subline}
              liveAccessViews={metricNumber(analytics?.today.accessViews)}
              investorMode={investorMode}
              updatedAt={analytics?.generatedAt}
            />

            {!analytics?.sources.vercelConfigured ? (
              <div
                style={{
                  ...cardStyle(),
                  padding: '12px 16px',
                  marginBottom: 18,
                  background: adminTheme.bgSoft,
                  fontSize: 13,
                  color: adminTheme.textSoft,
                }}
              >
                Traffic analytics are still warming up. Access, membership, community, and business metrics are live;
                visitor charts unlock once web analytics is connected.
              </div>
            ) : null}

            <LiveUsageStrip
              accessViews={metricNumber(analytics?.today.accessViews)}
              signedInActives={metricNumber(analytics?.today.signedInActiveUsers)}
              contributions={metricNumber(analytics?.today.communityContributions)}
              topCity={analytics?.geography.topCities[0]?.name}
            />

            <section style={{ marginBottom: 30 }}>
              <SectionHeader
                eyebrow="Today"
                title="What moved this morning"
                description="The four signals that tell you FlushPin is alive."
              />
              {loadingAnalytics && !analytics ? (
                <div style={{ color: adminTheme.textMuted }}>Gathering today’s pulse…</div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 14,
                  }}
                >
                  <MetricCard
                    accent
                    label="People discovering FlushPin"
                    metric={analytics?.today.uniqueVisitors}
                    deltaPct={seriesDelta(analytics?.trends.visitors7d ?? []).pct}
                  />
                  <MetricCard
                    accent
                    label="Access unlocked"
                    metric={analytics?.today.accessViews}
                    deltaPct={seriesDelta(analytics?.trends.accessViews7d ?? []).pct}
                  />
                  <MetricCard
                    accent
                    label="New members"
                    metric={analytics?.today.newRegisteredUsers}
                    deltaPct={seriesDelta(analytics?.trends.newUsers7d ?? []).pct}
                  />
                  <MetricCard
                    accent
                    label="Community helps"
                    metric={analytics?.today.communityContributions}
                    deltaPct={seriesDelta(analytics?.trends.contributions7d ?? []).pct}
                  />
                </div>
              )}
            </section>

            <section style={{ marginBottom: 30 }}>
              <SectionHeader
                eyebrow="Product depth"
                title="How people use the product"
                description="Searches and detail views light up once event tracking is approved."
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                <MetricCard label="Signed-in active" metric={analytics?.today.signedInActiveUsers} />
                <MetricCard label="Restroom searches" metric={analytics?.today.restroomSearches} />
                <MetricCard label="Place detail views" metric={analytics?.today.restroomDetailViews} />
                <MetricCard label="App Store interest" metric={analytics?.today.appStoreClicks} />
                <MetricCard label="Page views" metric={analytics?.today.pageViews} />
              </div>
            </section>

            <section style={{ marginBottom: 30 }}>
              <SectionHeader
                eyebrow="Growth"
                title="Momentum over time"
                description="Watch the curves that matter: discovery, membership, unlocks, and community."
                action={
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['7', '30'] as const).map((window) => (
                      <button
                        key={window}
                        type="button"
                        onClick={() => setTrendWindow(window)}
                        style={btnStyle(trendWindow === window ? 'primary' : 'ghost')}
                      >
                        {window}d
                      </button>
                    ))}
                  </div>
                }
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 14,
                }}
              >
                <TrendChart title="Discovery" data={visitorTrend} emptyLabel="Visitor curve unlocks with traffic analytics" />
                <TrendChart title="New members" data={newUserTrend} />
                <TrendChart title="Access unlocks" data={accessTrend} />
                <TrendChart title="Community energy" data={contributionTrend} />
              </div>
            </section>

            <section style={{ marginBottom: 30 }}>
              <SectionHeader
                eyebrow="Where it’s happening"
                title="Geography & attention"
                description="Countries from traffic analytics; cities from venue access activity (never user GPS)."
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 14,
                }}
              >
                <GeoTable
                  title="Top countries"
                  primaryHeader="Visitors"
                  secondaryHeader="Views"
                  rows={(analytics?.geography.topCountries ?? []).map((row) => ({
                    label: row.name,
                    primary: row.visitors,
                    secondary: row.pageviews,
                  }))}
                  emptyLabel="Country map appears once traffic analytics is connected"
                />
                <GeoTable
                  title="Top cities"
                  primaryHeader="Unlocks"
                  rows={(analytics?.geography.topCities ?? []).map((row) => ({
                    label: row.name,
                    primary: row.accessViews,
                  }))}
                  emptyLabel="City heat builds as people unlock access"
                />
                <GeoTable
                  title="Top restroom locations"
                  primaryHeader="Unlocks"
                  rows={(analytics?.geography.topRestrooms ?? []).map((row) => ({
                    label: row.city ? `${row.name} · ${row.city}` : row.name,
                    primary: row.accessViews,
                  }))}
                  emptyLabel="Location popularity builds from access unlocks"
                />
                <GeoTable
                  title="Pages people love"
                  primaryHeader="Views"
                  secondaryHeader="Visitors"
                  rows={(analytics?.geography.topRoutes ?? []).map((row) => ({
                    label: row.route,
                    primary: row.pageviews,
                    secondary: row.visitors,
                  }))}
                  emptyLabel="Route popularity appears with traffic analytics"
                />
              </div>
            </section>

            <section style={{ marginBottom: 30 }}>
              <SectionHeader
                eyebrow="Community"
                title="People making FlushPin better"
                description="Codes, access rules, accessibility notes, and verified help — last 30 days unless noted."
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                <MetricCard label="Codes shared" value={analytics?.community.codesAdded ?? 0} />
                <MetricCard label="Access rules added" value={analytics?.community.accessRulesAdded ?? 0} />
                <MetricCard label="Code-change reports" value={analytics?.community.codeChangedReports ?? 0} />
                <MetricCard label="Accessibility updates" value={analytics?.community.accessibilityUpdates ?? 0} />
                <MetricCard label="Baby-changing updates" value={analytics?.community.babyChangingUpdates ?? 0} />
                <MetricCard
                  label="Verified contributions"
                  value={analytics?.community.verifiedContributions ?? 0}
                  hint="All-time approved"
                />
              </div>
            </section>

            <section style={{ marginBottom: 30 }}>
              <SectionHeader
                eyebrow="Business"
                title="Partner engagement"
                description="Offer attention and conversion — the path from brand moment to unlock."
              />
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 12,
                }}
              >
                <MetricCard label="Offer impressions" value={analytics?.business.offerViews ?? 0} />
                <MetricCard label="Continue to access" value={analytics?.business.continueToAccessClicks ?? 0} />
                <MetricCard label="QR redemptions" metric={analytics?.business.qrRedemptions} />
                <MetricCard
                  label="Conversion"
                  value={analytics?.business.conversionRate}
                  suffix="%"
                  hint="Clicks ÷ offer views"
                />
              </div>
            </section>

            <InvestorSnapshot
              visitors7d={sumSeries(analytics?.trends.visitors7d ?? [])}
              newUsers7d={sumSeries(analytics?.trends.newUsers7d ?? [])}
              accessViews7d={sumSeries(analytics?.trends.accessViews7d ?? [])}
              contributions7d={sumSeries(analytics?.trends.contributions7d ?? [])}
              conversionRate={analytics?.business.conversionRate ?? null}
              topCountry={analytics?.geography.topCountries[0]?.name}
            />
          </>
        )}
      </main>
    </div>
  )
}
