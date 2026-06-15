'use client'

import { useEffect, useState } from 'react'
import AdminBarChart from './components/AdminBarChart'
import LiveActivityMap from './components/LiveActivityMap'
import { adminTheme, type DashboardMetrics, type LiveActivityPayload } from './theme'

const ADMIN_USER = 'admin@flushpin.com'
const ADMIN_PASS = 'Exxa2020@'

const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'nigga', 'nigger', 'negro', 'faggot', 'retard', 'spic', 'chink', 'rape', 'bomb',
  'orospu', 'yarrak', 'sikis', 'bok', 'amk',
]

type TabKey = 'overview' | 'live' | 'pins' | 'flagged' | 'optout' | 'logs'

type DashboardData = {
  metrics: DashboardMetrics
  restrooms: any[]
  optouts: any[]
  flagged: any[]
  logs: any[]
  supabase: any
}

function cardStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    background: adminTheme.card,
    border: `1px solid ${adminTheme.cardBorder}`,
    borderRadius: 16,
    ...extra,
  }
}

function btnStyle(variant: 'primary' | 'ghost' | 'danger' = 'ghost'): React.CSSProperties {
  if (variant === 'primary') {
    return {
      background: adminTheme.teal,
      color: adminTheme.bg,
      border: 'none',
      borderRadius: 10,
      padding: '10px 16px',
      fontWeight: 700,
      cursor: 'pointer',
      fontFamily: adminTheme.fontBody,
      fontSize: 13,
    }
  }
  if (variant === 'danger') {
    return {
      background: 'rgba(248, 113, 113, 0.12)',
      color: adminTheme.danger,
      border: '1px solid rgba(248, 113, 113, 0.25)',
      borderRadius: 8,
      padding: '6px 12px',
      cursor: 'pointer',
      fontSize: 12,
      fontFamily: adminTheme.fontBody,
    }
  }
  return {
    background: adminTheme.tealMuted,
    color: adminTheme.teal,
    border: `1px solid ${adminTheme.cardBorder}`,
    borderRadius: 10,
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontFamily: adminTheme.fontBody,
  }
}

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [liveActivity, setLiveActivity] = useState<LiveActivityPayload | null>(null)
  const [liveLoading, setLiveLoading] = useState(false)

  const loadLiveActivity = async () => {
    setLiveLoading(true)
    try {
      const res = await fetch('/admin/live?hours=24')
      if (res.ok) {
        setLiveActivity(await res.json())
      }
    } finally {
      setLiveLoading(false)
    }
  }

  useEffect(() => {
    if (!loggedIn || activeTab !== 'live') return
    loadLiveActivity()
    const interval = setInterval(loadLiveActivity, 60_000)
    return () => clearInterval(interval)
  }, [loggedIn, activeTab])

  const loadData = async () => {
    setLoading(true)

    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const metricsRes = await fetch(`/admin/data?todayStart=${encodeURIComponent(today.toISOString())}`)
    const metricsJson = metricsRes.ok ? await metricsRes.json() : null

    const metrics: DashboardMetrics = metricsJson ?? {
      totalRestrooms: 0,
      totalMembers: 0,
      newMembersToday: 0,
      pinViewsToday: 0,
      totalPinViews: 0,
      flaggedPending: 0,
      pinViewsByDay: [],
      restroomsByDay: [],
      recentRestrooms: [],
      recentAdminLogs: [],
    }

    const [{ data: restrooms }, { data: optouts }, { data: flagged }, { data: logs }] = await Promise.all([
      supabase.from('restroom').select('*'),
      supabase.from('optout_requests').select('*'),
      supabase.from('flagged_content').select('*').eq('status', 'pending'),
      supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50),
    ])

    const withFlags = (restrooms || [])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)
      .map((r: any) => {
        const pinText = String(r.pin || r.access_code || '')
        const words = BAD_WORDS.filter(
          (w) => pinText.toLowerCase().includes(w) || (r.name || '').toLowerCase().includes(w),
        )
        return { ...r, isFlagged: words.length > 0, flagWords: words }
      })

    setData({
      metrics,
      restrooms: withFlags,
      optouts: optouts || [],
      flagged: flagged || [],
      logs: logs || [],
      supabase,
    })
    setLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === ADMIN_USER && password === ADMIN_PASS) {
      setLoggedIn(true)
      loadData()
    } else {
      setError('Wrong email or password.')
    }
  }

  const handleAction = async (table: string, id: string, update: Record<string, unknown>) => {
    if (!data) return
    await data.supabase.from(table).update(update).eq('id', id)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!data || !confirm('Delete this restroom?')) return
    await data.supabase.from('restroom').delete().eq('id', id)
    loadData()
  }

  const shellStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: adminTheme.bg,
    color: adminTheme.text,
    fontFamily: adminTheme.fontBody,
  }

  if (!loggedIn) {
    return (
      <div style={{ ...shellStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontFamily: adminTheme.fontDisplay, fontSize: 28, fontWeight: 700, color: adminTheme.teal }}>
              flushpin
            </div>
            <div style={{ fontSize: 14, color: adminTheme.textMuted, marginTop: 8 }}>Admin Console</div>
          </div>

          <form onSubmit={handleLogin} style={{ ...cardStyle(), padding: 28 }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, color: adminTheme.textMuted, marginBottom: 8 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@flushpin.com"
                style={{
                  width: '100%',
                  background: adminTheme.bg,
                  border: `1px solid ${adminTheme.cardBorder}`,
                  borderRadius: 10,
                  padding: 12,
                  color: adminTheme.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: adminTheme.fontBody,
                }}
              />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, color: adminTheme.textMuted, marginBottom: 8 }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: adminTheme.bg,
                  border: `1px solid ${adminTheme.cardBorder}`,
                  borderRadius: 10,
                  padding: 12,
                  color: adminTheme.text,
                  fontSize: 14,
                  boxSizing: 'border-box',
                  fontFamily: adminTheme.fontBody,
                }}
              />
            </div>
            {error ? (
              <div style={{ color: adminTheme.danger, fontSize: 13, marginBottom: 16, textAlign: 'center' }}>{error}</div>
            ) : null}
            <button type="submit" style={{ ...btnStyle('primary'), width: '100%' }}>Sign In</button>
          </form>
        </div>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div style={{ ...shellStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: adminTheme.teal, fontSize: 16, fontFamily: adminTheme.fontDisplay }}>Loading dashboard…</div>
      </div>
    )
  }

  const { metrics } = data

  const statCards = [
    { label: 'Total Restrooms', value: metrics.totalRestrooms },
    { label: 'Total Members', value: metrics.totalMembers },
    { label: 'PIN Views Today', value: metrics.pinViewsToday },
    { label: 'Total PIN Views', value: metrics.totalPinViews },
    { label: 'New Members Today', value: metrics.newMembersToday },
    { label: 'Flagged Content', value: metrics.flaggedPending, accent: adminTheme.danger },
  ]

  const tabs: Array<{ key: TabKey; label: string; badge?: number }> = [
    { key: 'overview', label: 'Overview' },
    { key: 'live', label: 'Live Map', badge: liveActivity?.summary.recentViews || undefined },
    { key: 'pins', label: 'Pins' },
    { key: 'flagged', label: 'Flagged', badge: metrics.flaggedPending },
    { key: 'optout', label: 'Opt-Out', badge: data.optouts.filter((o) => o.status === 'pending').length },
    { key: 'logs', label: 'Logs' },
  ]

  return (
    <div style={shellStyle}>
      <header
        style={{
          ...cardStyle(),
          borderRadius: 0,
          borderTop: 'none',
          borderLeft: 'none',
          borderRight: 'none',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <div style={{ fontFamily: adminTheme.fontDisplay, fontSize: 20, fontWeight: 700, color: adminTheme.teal }}>
            flushpin admin
          </div>
          <div style={{ fontSize: 12, color: adminTheme.textMuted, marginTop: 2 }}>Operations dashboard</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              loadData()
              if (activeTab === 'live') loadLiveActivity()
            }}
            style={btnStyle('ghost')}
          >
            Refresh
          </button>
          <button type="button" onClick={() => setLoggedIn(false)} style={btnStyle('danger')}>Logout</button>
        </div>
      </header>

      <nav
        style={{
          display: 'flex',
          overflowX: 'auto',
          gap: 4,
          padding: '0 16px',
          borderBottom: `1px solid ${adminTheme.cardBorder}`,
          background: adminTheme.bg,
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '14px 16px',
                border: 'none',
                background: 'transparent',
                color: active ? adminTheme.teal : adminTheme.textMuted,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                fontFamily: adminTheme.fontBody,
                whiteSpace: 'nowrap',
                borderBottom: active ? `2px solid ${adminTheme.teal}` : '2px solid transparent',
              }}
            >
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span
                  style={{
                    marginLeft: 6,
                    background: adminTheme.danger,
                    color: '#fff',
                    borderRadius: 999,
                    padding: '1px 7px',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </nav>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px 48px' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 14,
              }}
            >
              {statCards.map((stat) => (
                <div key={stat.label} style={{ ...cardStyle(), padding: '18px 16px' }}>
                  <div
                    style={{
                      fontFamily: adminTheme.fontDisplay,
                      fontSize: 30,
                      fontWeight: 700,
                      color: stat.accent ?? adminTheme.teal,
                      lineHeight: 1.1,
                    }}
                  >
                    {stat.value.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: adminTheme.textMuted, marginTop: 8 }}>{stat.label}</div>
                </div>
              ))}
            </section>

            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              <AdminBarChart title="PIN Views — Last 7 Days" data={metrics.pinViewsByDay} />
              <AdminBarChart title="New Restrooms — Last 7 Days" data={metrics.restroomsByDay} />
            </section>

            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 16,
              }}
            >
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontFamily: adminTheme.fontDisplay, fontSize: 16, fontWeight: 700 }}>
                  Latest Restrooms
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: adminTheme.textMuted, textAlign: 'left' }}>
                        <th style={{ padding: '8px 6px', fontWeight: 600 }}>Name</th>
                        <th style={{ padding: '8px 6px', fontWeight: 600 }}>Address</th>
                        <th style={{ padding: '8px 6px', fontWeight: 600 }}>PIN</th>
                        <th style={{ padding: '8px 6px', fontWeight: 600 }}>Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentRestrooms.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: 16, color: adminTheme.textMuted, textAlign: 'center' }}>
                            No restrooms yet
                          </td>
                        </tr>
                      ) : (
                        metrics.recentRestrooms.map((row) => (
                          <tr key={row.id} style={{ borderTop: `1px solid ${adminTheme.cardBorder}` }}>
                            <td style={{ padding: '10px 6px', color: adminTheme.textSoft, maxWidth: 140 }}>{row.name || '—'}</td>
                            <td style={{ padding: '10px 6px', color: adminTheme.textMuted, maxWidth: 180 }}>{row.address || '—'}</td>
                            <td style={{ padding: '10px 6px', color: adminTheme.teal, fontFamily: 'monospace' }}>
                              {row.pin || '—'}
                            </td>
                            <td style={{ padding: '10px 6px', color: adminTheme.textMuted, whiteSpace: 'nowrap' }}>
                              {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontFamily: adminTheme.fontDisplay, fontSize: 16, fontWeight: 700 }}>
                  Recent Admin Logs
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {metrics.recentAdminLogs.length === 0 ? (
                    <div style={{ padding: 16, color: adminTheme.textMuted, textAlign: 'center', fontSize: 13 }}>
                      No logs yet
                    </div>
                  ) : (
                    metrics.recentAdminLogs.map((log, i) => (
                      <div
                        key={log.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          padding: '12px 0',
                          borderTop: i === 0 ? 'none' : `1px solid ${adminTheme.cardBorder}`,
                        }}
                      >
                        <div>
                          <div style={{ color: adminTheme.teal, fontWeight: 600, fontSize: 13 }}>{log.action}</div>
                          {log.target_type ? (
                            <div style={{ color: adminTheme.textMuted, fontSize: 11, marginTop: 2 }}>{log.target_type}</div>
                          ) : null}
                        </div>
                        <div style={{ color: adminTheme.textMuted, fontSize: 11, whiteSpace: 'nowrap' }}>
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'live' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ ...cardStyle(), padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: adminTheme.fontDisplay, fontSize: 18, fontWeight: 700 }}>
                    Live Activity Monitor
                  </h2>
                  <p style={{ margin: '8px 0 0', fontSize: 13, color: adminTheme.textMuted, maxWidth: 560, lineHeight: 1.5 }}>
                    Free OpenStreetMap tiles · PIN views from the last 24 hours plotted at venue locations.
                    Bright markers = activity in the last hour. Refreshes every 60 seconds.
                  </p>
                </div>
                <button type="button" onClick={loadLiveActivity} style={btnStyle('ghost')} disabled={liveLoading}>
                  {liveLoading ? 'Updating…' : 'Update now'}
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {[
                  { label: 'Views (24h)', value: liveActivity?.summary.totalViews ?? 0 },
                  { label: 'Live (1h)', value: liveActivity?.summary.recentViews ?? 0 },
                  { label: 'Unique users', value: liveActivity?.summary.uniqueUsers ?? 0 },
                  { label: 'Venues touched', value: liveActivity?.summary.uniqueVenues ?? 0 },
                ].map((s) => (
                  <div key={s.label} style={{ background: adminTheme.bg, borderRadius: 10, padding: '12px 14px', border: `1px solid ${adminTheme.cardBorder}` }}>
                    <div style={{ fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 700, color: adminTheme.teal }}>
                      {s.value.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 11, color: adminTheme.textMuted, marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {liveLoading && !liveActivity ? (
                <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: adminTheme.textMuted }}>
                  Loading map…
                </div>
              ) : liveActivity && liveActivity.points.length > 0 ? (
                <LiveActivityMap data={liveActivity} />
              ) : (
                <div
                  style={{
                    height: 420,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: adminTheme.textMuted,
                    background: adminTheme.bg,
                    borderRadius: 12,
                    border: `1px dashed ${adminTheme.cardBorder}`,
                    fontSize: 14,
                    textAlign: 'center',
                    padding: 24,
                  }}
                >
                  No PIN views in the last 24 hours yet.<br />
                  When members open access codes on the map, activity will appear here.
                </div>
              )}
            </div>

            {liveActivity && liveActivity.points.length > 0 ? (
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ margin: '0 0 12px', fontFamily: adminTheme.fontDisplay, fontSize: 15, fontWeight: 700 }}>
                  Recent activity feed
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0, maxHeight: 280, overflowY: 'auto' }}>
                  {liveActivity.points.slice(0, 20).map((point, i) => (
                    <div
                      key={point.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 0',
                        borderTop: i === 0 ? 'none' : `1px solid ${adminTheme.cardBorder}`,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: adminTheme.textSoft, fontWeight: 600 }}>{point.name}</div>
                        <div style={{ fontSize: 11, color: adminTheme.textMuted, marginTop: 2 }}>
                          {point.isRecent ? '● Live' : '○ Recent'} · user {point.userId.slice(0, 8)}…
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: adminTheme.textMuted, whiteSpace: 'nowrap' }}>
                        {new Date(point.viewedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        {activeTab === 'pins' && (
          <div>
            <p style={{ color: adminTheme.textMuted, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
              Latest {data.restrooms.length} restroom records
            </p>
            {data.restrooms.map((pin: any) => (
              <div
                key={pin.id}
                style={{
                  ...cardStyle(),
                  padding: 16,
                  marginBottom: 12,
                  borderColor: pin.isFlagged ? 'rgba(248, 113, 113, 0.35)' : adminTheme.cardBorder,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, fontFamily: adminTheme.fontDisplay }}>
                  {pin.name || 'Unknown'}
                  {pin.isFlagged ? (
                    <span style={{ marginLeft: 8, fontSize: 10, background: adminTheme.danger, color: '#fff', borderRadius: 6, padding: '2px 6px' }}>
                      FLAGGED
                    </span>
                  ) : null}
                </div>
                <div style={{ fontSize: 12, color: adminTheme.textMuted, marginBottom: 4 }}>{pin.address || '—'}</div>
                <div style={{ fontSize: 12, color: adminTheme.textSoft, marginBottom: 4 }}>
                  PIN: <span style={{ color: adminTheme.teal, fontFamily: 'monospace' }}>{pin.pin || pin.access_code || '—'}</span>
                </div>
                <div style={{ fontSize: 11, color: adminTheme.textMuted, marginBottom: 10 }}>
                  {pin.created_at ? new Date(pin.created_at).toLocaleString() : '—'} · {pin.status || 'active'}
                </div>
                {pin.isFlagged ? (
                  <div style={{ fontSize: 11, color: adminTheme.danger, marginBottom: 10 }}>Detected: {pin.flagWords.join(', ')}</div>
                ) : null}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => handleAction('restroom', pin.id, { status: 'approved' })} style={btnStyle('ghost')}>Approve</button>
                  <button type="button" onClick={() => handleAction('restroom', pin.id, { status: 'rejected' })} style={btnStyle('ghost')}>Reject</button>
                  <button type="button" onClick={() => handleDelete(pin.id)} style={btnStyle('danger')}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'flagged' && (
          <div>
            {data.flagged.length === 0 ? (
              <div style={{ ...cardStyle(), padding: 40, textAlign: 'center', color: adminTheme.textMuted }}>No flagged content</div>
            ) : (
              data.flagged.map((item: any) => (
                <div key={item.id} style={{ ...cardStyle(), padding: 16, marginBottom: 12, borderColor: 'rgba(248, 113, 113, 0.35)' }}>
                  <div style={{ fontWeight: 700, color: adminTheme.danger, marginBottom: 6 }}>
                    {item.content_type} — {item.flag_reason}
                  </div>
                  <div style={{ fontSize: 13, color: adminTheme.textSoft, marginBottom: 12 }}>{item.content_text}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => handleAction('flagged_content', item.id, { status: 'approved', reviewed_by: 'admin', reviewed_at: new Date().toISOString() })}
                      style={btnStyle('ghost')}
                    >
                      Allow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAction('flagged_content', item.id, { status: 'rejected', reviewed_by: 'admin', reviewed_at: new Date().toISOString() })}
                      style={btnStyle('danger')}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'optout' && (
          <div>
            {data.optouts.length === 0 ? (
              <div style={{ ...cardStyle(), padding: 40, textAlign: 'center', color: adminTheme.textMuted }}>No opt-out requests</div>
            ) : (
              data.optouts.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    ...cardStyle(),
                    padding: 16,
                    marginBottom: 12,
                    borderColor: item.status === 'pending' ? 'rgba(251, 191, 36, 0.35)' : adminTheme.cardBorder,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontFamily: adminTheme.fontDisplay }}>{item.business_name || 'Unknown'}</div>
                    <span style={{ fontSize: 11, color: item.status === 'pending' ? adminTheme.warning : adminTheme.teal }}>{item.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: adminTheme.textMuted, marginBottom: 4 }}>{item.city || '—'}</div>
                  <div style={{ fontSize: 12, color: adminTheme.textSoft, marginBottom: 4 }}>{item.reason || item.request_type || '—'}</div>
                  <div style={{ fontSize: 11, color: adminTheme.textMuted, marginBottom: 10 }}>
                    {item.contact_email || '—'} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}
                  </div>
                  {item.status === 'pending' ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" onClick={() => handleAction('optout_requests', item.id, { status: 'approved' })} style={btnStyle('ghost')}>Approve</button>
                      <button type="button" onClick={() => handleAction('optout_requests', item.id, { status: 'rejected' })} style={btnStyle('danger')}>Reject</button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            {data.logs.length === 0 ? (
              <div style={{ ...cardStyle(), padding: 40, textAlign: 'center', color: adminTheme.textMuted }}>No logs yet</div>
            ) : (
              data.logs.map((log: any) => (
                <div key={log.id} style={{ ...cardStyle(), padding: 14, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                    <div>
                      <span style={{ color: adminTheme.teal, fontWeight: 700, fontSize: 13 }}>{log.action}</span>
                      {log.target_type ? (
                        <span style={{ color: adminTheme.textMuted, fontSize: 12, marginLeft: 8 }}>{log.target_type}</span>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 11, color: adminTheme.textMuted }}>{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
