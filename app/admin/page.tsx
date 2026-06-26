'use client'

import { useEffect, useState } from 'react'
import AdminBarChart from './components/AdminBarChart'
import LiveActivityMap from './components/LiveActivityMap'
import { adminTheme, type DashboardMetrics, type LiveActivityPayload } from './theme'

const ADMIN_USER = 'admin@flushpin.com'
const ADMIN_PASS = 'Exxa2020!'
/** Older deploys / quick gate used this single password */
const LEGACY_ADMIN_PASS = 'flush2026'

function normalizeAdminEmail(value: string) {
  return value.trim().toLowerCase()
}

function isValidAdminLogin(email: string, password: string) {
  const normalizedEmail = normalizeAdminEmail(email)
  const normalizedPassword = password.trim()

  if (normalizedEmail === ADMIN_USER && normalizedPassword === ADMIN_PASS) {
    return true
  }

  // Legacy password-only gate (no email required)
  if (normalizedPassword === LEGACY_ADMIN_PASS) {
    return true
  }

  return false
}

const BAD_WORDS = [
  'fuck', 'shit', 'bitch', 'nigga', 'nigger', 'negro', 'faggot', 'retard', 'spic', 'chink', 'rape', 'bomb',
  'orospu', 'yarrak', 'sikis', 'bok', 'amk',
]

type TabKey = 'overview' | 'users' | 'restrooms' | 'campaigns' | 'live' | 'pins' | 'flagged' | 'optout' | 'quality' | 'logs'

type DashboardData = {
  metrics: DashboardMetrics
  metricsError: string | null
  optouts: any[]
  flagged: any[]
  logs: any[]
}

type ModerationSubmission = {
  id: number
  restroom_id: string
  user_id: string
  submitted_pin: string | null
  access_type: string
  status: string
  source: string | null
  created_at: string
  restroom: {
    id: number | string
    name?: string | null
    address?: string | null
    pin?: string | null
    status?: string | null
    access_type?: string | null
    created_at?: string | null
  } | null
}

type DuplicateGroup = {
  key: string
  name?: string | null
  address?: string | null
  rows: Array<{
    id: number | string
    name?: string | null
    address?: string | null
    pin?: string | null
    status?: string | null
    created_at?: string | null
  }>
}

type ModerationQueue = {
  pendingSubmissions: ModerationSubmission[]
  duplicateGroups: DuplicateGroup[]
  summary: { pendingCount: number; duplicateGroupCount: number }
}

type BusinessClaimsQueue = {
  claims: any[]
  optouts: any[]
  summary: {
    pendingClaims: number
    pendingOptouts: number
    removalRequests: number
    totalPending: number
  }
}

type CampaignQueue = {
  campaigns: any[]
  locations: any[]
  summary: {
    totalCampaigns: number
    activeCampaigns: number
    pendingReview: number
    scans7d: number
    completedViews7d: number
    accessReveals7d: number
  }
  warnings: string[]
}

type AdminUsersPayload = {
  users: any[]
  summary: {
    totalMembers: number
    newToday: number
    confirmedEmails: number
    googleMembers: number
    emailMembers: number
  }
  newestUser: any | null
  loadedAt: string
}

function claimTypeLabel(type: string) {
  if (type === 'removal') return '🗑️ Removal — hide PIN / listing'
  if (type === 'update') return '✏️ Update access info'
  if (type === 'claim') return '🏢 Claim listing'
  return type
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
  const [moderation, setModeration] = useState<ModerationQueue | null>(null)
  const [moderationLoading, setModerationLoading] = useState(false)
  const [moderationError, setModerationError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [businessClaims, setBusinessClaims] = useState<BusinessClaimsQueue | null>(null)
  const [businessClaimsLoading, setBusinessClaimsLoading] = useState(false)
  const [businessClaimsError, setBusinessClaimsError] = useState<string | null>(null)
  const [campaignCreativePreview, setCampaignCreativePreview] = useState<string | null>(null)
  const [campaignCreativeFile, setCampaignCreativeFile] = useState<File | null>(null)
  const [campaignCreativeName, setCampaignCreativeName] = useState<string>('')
  const [campaigns, setCampaigns] = useState<CampaignQueue | null>(null)
  const [campaignsLoading, setCampaignsLoading] = useState(false)
  const [campaignsError, setCampaignsError] = useState<string | null>(null)
  const [campaignSaveBusy, setCampaignSaveBusy] = useState(false)
  const [campaignForm, setCampaignForm] = useState({
    business_name: '',
    location_name: '',
    campaign_name: '',
    offer_title: '',
    offer_description: '',
    cta_text: '',
    destination_url: '',
    starts_at: '',
    ends_at: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    restroom_id: '',
  })
  const [adminUsers, setAdminUsers] = useState<AdminUsersPayload | null>(null)
  const [adminUsersLoading, setAdminUsersLoading] = useState(false)
  const [adminUsersError, setAdminUsersError] = useState<string | null>(null)
  const [memberNotification, setMemberNotification] = useState<string | null>(null)
  const [lastSeenMemberCount, setLastSeenMemberCount] = useState<number | null>(null)

  const updateCampaignForm = (key: keyof typeof campaignForm, value: string) => {
    setCampaignForm((current) => ({ ...current, [key]: value }))
  }

  const loadAdminUsers = async (notify = false) => {
    setAdminUsersLoading(true)
    setAdminUsersError(null)
    try {
      const res = await fetch('/admin/users')
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setAdminUsersError(json?.error || `Users unavailable (HTTP ${res.status})`)
        setAdminUsers(null)
        return
      }
      setAdminUsers(json)

      const totalMembers = json?.summary?.totalMembers ?? 0
      if (notify && lastSeenMemberCount != null && totalMembers > lastSeenMemberCount) {
        const newest = json?.newestUser
        const label = newest?.email ? `${newest.name} · ${newest.email}` : 'New FlushPin member'
        const message = `New member joined: ${label}`
        setMemberNotification(message)
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('FlushPin new member', { body: label })
          } else if (Notification.permission === 'default') {
            Notification.requestPermission().then((permission) => {
              if (permission === 'granted') new Notification('FlushPin new member', { body: label })
            })
          }
        }
      }
      setLastSeenMemberCount(totalMembers)
    } finally {
      setAdminUsersLoading(false)
    }
  }

  const loadCampaigns = async () => {
    setCampaignsLoading(true)
    setCampaignsError(null)
    try {
      const res = await fetch('/admin/campaigns')
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setCampaignsError(json?.error || `Campaigns unavailable (HTTP ${res.status})`)
        setCampaigns(null)
        return
      }
      setCampaigns(json)
    } finally {
      setCampaignsLoading(false)
    }
  }

  const saveCampaignDraft = async () => {
    if (!campaignCreativeFile) {
      alert('Upload a PNG or JPG creative first.')
      return
    }
    setCampaignSaveBusy(true)
    setCampaignsError(null)
    try {
      const form = new FormData()
      Object.entries(campaignForm).forEach(([key, value]) => form.append(key, value))
      form.append('creative', campaignCreativeFile)
      const res = await fetch('/admin/campaigns', { method: 'POST', body: form })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setCampaignsError(json?.error || 'Campaign save failed')
        return
      }
      setCampaignForm({
        business_name: '',
        location_name: '',
        campaign_name: '',
        offer_title: '',
        offer_description: '',
        cta_text: '',
        destination_url: '',
        starts_at: '',
        ends_at: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        city: '',
        restroom_id: '',
      })
      setCampaignCreativeFile(null)
      setCampaignCreativeName('')
      setCampaignCreativePreview(null)
      await loadCampaigns()
    } finally {
      setCampaignSaveBusy(false)
    }
  }

  const updateCampaignStatus = async (campaignId: string, status: string) => {
    setActionBusy(`campaign-${campaignId}-${status}`)
    try {
      const res = await fetch('/admin/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId, status }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        alert(json?.error || 'Campaign action failed')
        return
      }
      await loadCampaigns()
    } finally {
      setActionBusy(null)
    }
  }

  const loadBusinessClaims = async () => {
    setBusinessClaimsLoading(true)
    setBusinessClaimsError(null)
    try {
      const res = await fetch('/admin/business-claims')
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setBusinessClaimsError(json?.error || `Business claims unavailable (HTTP ${res.status})`)
        setBusinessClaims(null)
        return
      }
      setBusinessClaims(json)
    } finally {
      setBusinessClaimsLoading(false)
    }
  }

  const runBusinessClaimAction = async (payload: Record<string, unknown>) => {
    setActionBusy(String(payload.table))
    try {
      const res = await fetch('/admin/business-claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        alert(json?.error || 'Action failed')
        return
      }
      await Promise.all([loadBusinessClaims(), loadData()])
    } finally {
      setActionBusy(null)
    }
  }

  const loadModeration = async () => {
    setModerationLoading(true)
    setModerationError(null)
    try {
      const res = await fetch('/admin/moderation')
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        setModerationError(json?.error || `Moderation queue unavailable (HTTP ${res.status})`)
        setModeration(null)
        return
      }
      setModeration(json)
    } finally {
      setModerationLoading(false)
    }
  }

  const runModerationAction = async (payload: Record<string, unknown>) => {
    setActionBusy(String(payload.action))
    try {
      const res = await fetch('/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        alert(json?.error || 'Action failed')
        return
      }
      await Promise.all([loadModeration(), loadData()])
    } finally {
      setActionBusy(null)
    }
  }

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
    if (sessionStorage.getItem('fp_admin') === '1') {
      setLoggedIn(true)
      loadData()
    }
  }, [])

  useEffect(() => {
    if (!loggedIn || activeTab !== 'live') return
    loadLiveActivity()
    const interval = setInterval(loadLiveActivity, 60_000)
    return () => clearInterval(interval)
  }, [loggedIn, activeTab])

  useEffect(() => {
    if (!loggedIn || activeTab !== 'pins') return
    loadModeration()
  }, [loggedIn, activeTab])

  useEffect(() => {
    if (!loggedIn || activeTab !== 'optout') return
    loadBusinessClaims()
  }, [loggedIn, activeTab])

  useEffect(() => {
    if (!loggedIn || activeTab !== 'campaigns') return
    loadCampaigns()
  }, [loggedIn, activeTab])

  useEffect(() => {
    if (!loggedIn || activeTab !== 'users') return
    loadAdminUsers(false)
    const interval = setInterval(() => loadAdminUsers(true), 60_000)
    return () => clearInterval(interval)
  }, [loggedIn, activeTab, lastSeenMemberCount])

  const loadData = async () => {
    setLoading(true)
    const emptyMetrics: DashboardMetrics = {
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

    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const metricsRes = await fetch(`/admin/data?todayStart=${encodeURIComponent(today.toISOString())}`)
      const metricsJson = metricsRes.ok ? await metricsRes.json() : await metricsRes.json().catch(() => null)
      const metricsError = metricsRes.ok
        ? null
        : (metricsJson?.error as string | undefined) ||
          `Admin metrics unavailable (HTTP ${metricsRes.status}). Add SUPABASE_SERVICE_ROLE_KEY on Vercel.`

      const metrics: DashboardMetrics = metricsRes.ok && metricsJson ? metricsJson : emptyMetrics

      setData({
        metrics,
        metricsError,
        optouts: metricsJson?.optouts || [],
        flagged: metricsJson?.flagged || [],
        logs: metricsJson?.logs || metricsJson?.recentAdminLogs || [],
      })
    } catch (err) {
      setData({
        metrics: emptyMetrics,
        metricsError: err instanceof Error ? err.message : 'Failed to load admin dashboard',
        optouts: [],
        flagged: [],
        logs: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (isValidAdminLogin(email, password)) {
      sessionStorage.setItem('fp_admin', '1')
      setLoggedIn(true)
      loadData()
    } else {
      setError('Wrong email or password. Use admin@flushpin.com and your admin password.')
    }
  }

  const handleFlaggedAction = async (id: string | number, status: 'approved' | 'rejected') => {
    setActionBusy(String(id))
    try {
      const res = await fetch('/admin/flagged', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      const json = await res.json().catch(() => null)
      if (!res.ok) {
        alert(json?.error || 'Action failed')
        return
      }
      await loadData()
    } finally {
      setActionBusy(null)
    }
  }

  const pinsBadge = (moderation?.summary.pendingCount ?? 0) + (moderation?.summary.duplicateGroupCount ?? 0)

  const handleCampaignCreativeSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      alert('Campaign creative must be a PNG or JPG image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Keep campaign creatives under 2 MB for fast mobile loading.')
      return
    }
    setCampaignCreativeFile(file)
    setCampaignCreativeName(file.name)
    setCampaignCreativePreview(URL.createObjectURL(file))
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
    { key: 'overview', label: 'Command Center' },
    { key: 'users', label: 'Users' },
    { key: 'restrooms', label: 'Restrooms' },
    { key: 'campaigns', label: 'Campaign Studio', badge: campaigns?.summary.pendingReview || undefined },
    { key: 'live', label: 'Live Map', badge: liveActivity?.summary.recentViews || undefined },
    { key: 'pins', label: 'Access Codes', badge: pinsBadge || undefined },
    { key: 'flagged', label: 'Reports', badge: metrics.flaggedPending },
    { key: 'optout', label: 'Business Requests', badge: businessClaims?.summary.totalPending || data.optouts.filter((o) => o.status === 'pending').length || undefined },
    { key: 'quality', label: 'Data Quality', badge: moderation?.summary.duplicateGroupCount || undefined },
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
          <div style={{ fontSize: 12, color: adminTheme.textMuted, marginTop: 2 }}>California restroom access, business requests, campaigns, and data health</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={() => {
              loadData()
              if (activeTab === 'live') loadLiveActivity()
              if (activeTab === 'pins') loadModeration()
              if (activeTab === 'optout') loadBusinessClaims()
            }}
            style={btnStyle('ghost')}
          >
            Refresh
          </button>
          <button type="button" onClick={() => { sessionStorage.removeItem('fp_admin'); setLoggedIn(false) }} style={btnStyle('danger')}>Logout</button>
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

      {data.metricsError ? (
        <div
          style={{
            margin: '0 16px',
            marginTop: 16,
            maxWidth: 1200,
            marginLeft: 'auto',
            marginRight: 'auto',
            background: 'rgba(251, 191, 36, 0.12)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            borderRadius: 12,
            padding: '14px 16px',
            color: adminTheme.warning,
            fontSize: 13,
            lineHeight: 1.5,
            fontFamily: adminTheme.fontBody,
          }}
        >
          <strong>Service metrics offline.</strong> {data.metricsError}
          <br />
          Member counts need <code style={{ color: adminTheme.textSoft }}>SUPABASE_SERVICE_ROLE_KEY</code> in Vercel →
          Settings → Environment Variables → Production, then redeploy.
        </div>
      ) : null}

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

            <section style={{ ...cardStyle(), padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 800 }}>
                    Today’s operating brief
                  </h2>
                  <p style={{ margin: '8px 0 0', color: adminTheme.textMuted, fontSize: 13, lineHeight: 1.5, maxWidth: 680 }}>
                    Start here each morning: growth, restroom demand, business risk, campaign readiness, and the data cleanup queue.
                  </p>
                </div>
                <div style={{ color: adminTheme.teal, fontSize: 12, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  California-first
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginTop: 18 }}>
                {[
                  ['Members', `${metrics.newMembersToday.toLocaleString()} new today`, `${metrics.totalMembers.toLocaleString()} total accounts`],
                  ['Restroom demand', `${metrics.pinViewsToday.toLocaleString()} code views today`, `${metrics.totalPinViews.toLocaleString()} lifetime code views`],
                  ['Business risk', `${data.optouts.filter((o) => o.status === 'pending').length.toLocaleString()} pending opt-outs`, 'Review before public conflict grows'],
                  ['Revenue queue', `${businessClaims?.summary.pendingClaims ?? 0} pending claims`, 'Convert business interest into Gold calls'],
                  ['Campaigns', 'Upload-ready workflow', '1080 x 1920 mobile creative, 4-second reveal'],
                  ['Data health', `${pinsBadge.toLocaleString()} pin / duplicate tasks`, 'Clean duplicates before statewide seeding'],
                ].map(([title, value, note]) => (
                  <div key={title} style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ color: adminTheme.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 800 }}>{title}</div>
                    <div style={{ color: adminTheme.text, fontSize: 18, fontWeight: 800, marginTop: 8, fontFamily: adminTheme.fontDisplay }}>{value}</div>
                    <div style={{ color: adminTheme.textMuted, fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>{note}</div>
                  </div>
                ))}
              </div>
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

        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ ...cardStyle(), padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 800 }}>Member intelligence</h2>
                  <p style={{ margin: '8px 0 0', color: adminTheme.textMuted, fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>
                    Detailed member names, emails, signup dates, providers, email confirmation, and last sign-in. This refreshes every 60 seconds while the tab is open.
                  </p>
                </div>
                <button type="button" onClick={() => loadAdminUsers(false)} disabled={adminUsersLoading} style={btnStyle('ghost')}>
                  {adminUsersLoading ? 'Refreshing…' : 'Refresh users'}
                </button>
              </div>
              {memberNotification ? (
                <div style={{ marginTop: 16, background: adminTheme.tealMuted, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 12, padding: 12, color: adminTheme.teal, fontWeight: 800, fontSize: 13 }}>
                  {memberNotification}
                </div>
              ) : null}
              {adminUsersError ? (
                <div style={{ marginTop: 16, background: 'rgba(248, 113, 113, 0.12)', border: '1px solid rgba(248, 113, 113, 0.35)', borderRadius: 12, padding: 12, color: adminTheme.danger, fontSize: 13 }}>
                  {adminUsersError}
                </div>
              ) : null}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 18 }}>
                {[
                  ['Total members', (adminUsers?.summary.totalMembers ?? metrics.totalMembers).toLocaleString()],
                  ['New today', (adminUsers?.summary.newToday ?? metrics.newMembersToday).toLocaleString()],
                  ['Confirmed emails', (adminUsers?.summary.confirmedEmails ?? 0).toLocaleString()],
                  ['Google members', (adminUsers?.summary.googleMembers ?? 0).toLocaleString()],
                  ['Email members', (adminUsers?.summary.emailMembers ?? 0).toLocaleString()],
                  ['Code views/user', metrics.totalMembers ? (metrics.totalPinViews / metrics.totalMembers).toFixed(1) : '0.0'],
                ].map(([label, value]) => (
                  <div key={label} style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 14, padding: 16 }}>
                    <div style={{ fontFamily: adminTheme.fontDisplay, color: adminTheme.teal, fontSize: 26, fontWeight: 800 }}>{value}</div>
                    <div style={{ color: adminTheme.textMuted, fontSize: 12, marginTop: 6 }}>{label}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...cardStyle(), padding: 20, overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 14px', fontFamily: adminTheme.fontDisplay, fontSize: 16 }}>Members</h3>
              {adminUsersLoading && !adminUsers ? (
                <div style={{ color: adminTheme.textMuted, fontSize: 13 }}>Loading members…</div>
              ) : (adminUsers?.users.length ?? 0) === 0 ? (
                <div style={{ color: adminTheme.textMuted, fontSize: 13 }}>No members loaded. Service role is required for this table.</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: adminTheme.textMuted, textAlign: 'left' }}>
                      <th style={{ padding: '8px 6px' }}>Name</th>
                      <th style={{ padding: '8px 6px' }}>Email</th>
                      <th style={{ padding: '8px 6px' }}>Provider</th>
                      <th style={{ padding: '8px 6px' }}>Confirmed</th>
                      <th style={{ padding: '8px 6px' }}>Joined</th>
                      <th style={{ padding: '8px 6px' }}>Last sign-in</th>
                      <th style={{ padding: '8px 6px' }}>User ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers?.users.map((user) => (
                      <tr key={user.id} style={{ borderTop: `1px solid ${adminTheme.cardBorder}` }}>
                        <td style={{ padding: '12px 6px', color: adminTheme.textSoft, fontWeight: 800 }}>{user.name || 'Unknown'}</td>
                        <td style={{ padding: '12px 6px', color: adminTheme.teal }}>{user.email || '—'}</td>
                        <td style={{ padding: '12px 6px', color: adminTheme.textMuted }}>{user.provider || '—'}</td>
                        <td style={{ padding: '12px 6px', color: user.email_confirmed_at ? adminTheme.teal : adminTheme.warning }}>{user.email_confirmed_at ? 'Yes' : 'No'}</td>
                        <td style={{ padding: '12px 6px', color: adminTheme.textMuted, whiteSpace: 'nowrap' }}>{user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</td>
                        <td style={{ padding: '12px 6px', color: adminTheme.textMuted, whiteSpace: 'nowrap' }}>{user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</td>
                        <td style={{ padding: '12px 6px', color: adminTheme.textMuted, fontFamily: 'monospace', fontSize: 11 }}>{String(user.id).slice(0, 8)}…</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section style={{ ...cardStyle(), padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontFamily: adminTheme.fontDisplay, fontSize: 16 }}>Notification rules</h3>
              {['Users tab polls every 60 seconds while open', 'New member count increase triggers an in-admin alert', 'Browser notification is requested only from this admin session', 'Future version can send email/SMS via a server notification table'].map((item) => (
                <div key={item} style={{ padding: '10px 0', borderTop: `1px solid ${adminTheme.cardBorder}`, color: adminTheme.textSoft, fontSize: 13 }}>{item}</div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'restrooms' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ ...cardStyle(), padding: 22 }}>
              <h2 style={{ margin: 0, fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 800 }}>Restroom operations</h2>
              <p style={{ margin: '8px 0 0', color: adminTheme.textMuted, fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>
                The working list for places, access type, current code, verification status, source, claim state, and opt-out state.
              </p>
            </section>
            <div style={{ ...cardStyle(), padding: 20, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ color: adminTheme.textMuted, textAlign: 'left' }}>
                    <th style={{ padding: '8px 6px' }}>Venue</th>
                    <th style={{ padding: '8px 6px' }}>Address</th>
                    <th style={{ padding: '8px 6px' }}>Code</th>
                    <th style={{ padding: '8px 6px' }}>Added</th>
                    <th style={{ padding: '8px 6px' }}>Next action</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.recentRestrooms.map((row) => (
                    <tr key={row.id} style={{ borderTop: `1px solid ${adminTheme.cardBorder}` }}>
                      <td style={{ padding: '12px 6px', color: adminTheme.textSoft, fontWeight: 700 }}>{row.name || 'Unknown'}</td>
                      <td style={{ padding: '12px 6px', color: adminTheme.textMuted }}>{row.address || '—'}</td>
                      <td style={{ padding: '12px 6px', color: adminTheme.teal, fontFamily: 'monospace' }}>{row.pin || '—'}</td>
                      <td style={{ padding: '12px 6px', color: adminTheme.textMuted, whiteSpace: 'nowrap' }}>{row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}</td>
                      <td style={{ padding: '12px 6px', color: adminTheme.warning }}>verify source + duplicate</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
              {['Code stale > 30 days', 'Business claimed', 'Opt-out requested', 'Duplicate nearby venue', 'Missing address', 'Google enrichment candidate'].map((label) => (
                <div key={label} style={{ ...cardStyle(), padding: 16 }}>
                  <div style={{ color: adminTheme.teal, fontWeight: 800, fontSize: 13 }}>{label}</div>
                  <div style={{ color: adminTheme.textMuted, fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>Filter-ready bucket for the next API/schema pass.</div>
                </div>
              ))}
            </section>
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ ...cardStyle(), padding: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ margin: 0, fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 800 }}>Campaign Studio</h2>
                  <p style={{ margin: '8px 0 0', color: adminTheme.textMuted, fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>
                    Upload the mobile ad a business wants shown after a QR scan. The visitor sees it for 4 seconds, then receives access instructions.
                  </p>
                </div>
                <div style={{ background: adminTheme.tealMuted, color: adminTheme.teal, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 999, padding: '8px 12px', height: 18, fontSize: 11, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                  Gold package core
                </div>
              </div>
            </section>

            {campaignsError ? (
              <div style={{ ...cardStyle(), padding: 16, borderColor: 'rgba(248, 113, 113, 0.35)', color: adminTheme.danger, fontSize: 13 }}>
                {campaignsError}
              </div>
            ) : null}

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              {[
                ['Campaigns', campaigns?.summary.totalCampaigns ?? 0],
                ['Active', campaigns?.summary.activeCampaigns ?? 0],
                ['Pending review', campaigns?.summary.pendingReview ?? 0],
                ['QR scans 7d', campaigns?.summary.scans7d ?? 0],
                ['Completed views 7d', campaigns?.summary.completedViews7d ?? 0],
                ['Access reveals 7d', campaigns?.summary.accessReveals7d ?? 0],
              ].map(([label, value]) => (
                <div key={label} style={{ ...cardStyle(), padding: 16 }}>
                  <div style={{ fontFamily: adminTheme.fontDisplay, color: adminTheme.teal, fontSize: 26, fontWeight: 800 }}>{Number(value).toLocaleString()}</div>
                  <div style={{ color: adminTheme.textMuted, fontSize: 12, marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(260px, 360px)', gap: 16, alignItems: 'start' }}>
              <div style={{ ...cardStyle(), padding: 20 }}>
                <h3 style={{ margin: '0 0 16px', fontFamily: adminTheme.fontDisplay, fontSize: 17 }}>Create campaign draft</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
                  {[
                    ['business_name', 'Business name'],
                    ['location_name', 'Location name'],
                    ['campaign_name', 'Campaign name'],
                    ['offer_title', 'Offer title'],
                    ['starts_at', 'Start date'],
                    ['ends_at', 'End date'],
                    ['cta_text', 'CTA text'],
                    ['city', 'City'],
                    ['restroom_id', 'Restroom ID'],
                    ['contact_email', 'Contact email'],
                  ].map(([key, label]) => (
                    <label key={key} style={{ display: 'flex', flexDirection: 'column', gap: 6, color: adminTheme.textMuted, fontSize: 12, fontWeight: 700 }}>
                      {label}
                      <input
                        type={key.includes('date') || key.endsWith('_at') ? 'datetime-local' : 'text'}
                        value={campaignForm[key as keyof typeof campaignForm]}
                        onChange={(event) => updateCampaignForm(key as keyof typeof campaignForm, event.target.value)}
                        placeholder={label}
                        style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 10, padding: 12, color: adminTheme.text, fontFamily: adminTheme.fontBody }}
                      />
                    </label>
                  ))}
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, color: adminTheme.textMuted, fontSize: 12, fontWeight: 700 }}>
                  Offer description
                  <textarea
                    value={campaignForm.offer_description}
                    onChange={(event) => updateCampaignForm('offer_description', event.target.value)}
                    placeholder="Today: add drip coffee for $1 with any croissant."
                    rows={3}
                    style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 10, padding: 12, color: adminTheme.text, fontFamily: adminTheme.fontBody, resize: 'vertical' }}
                  />
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12, color: adminTheme.textMuted, fontSize: 12, fontWeight: 700 }}>
                  Destination URL
                  <input
                    value={campaignForm.destination_url}
                    onChange={(event) => updateCampaignForm('destination_url', event.target.value)}
                    placeholder="https://example.com/offer"
                    style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 10, padding: 12, color: adminTheme.text, fontFamily: adminTheme.fontBody }}
                  />
                </label>
                <label style={{ display: 'block', marginTop: 14, color: adminTheme.textMuted, fontSize: 12, fontWeight: 700 }}>
                  Campaign creative PNG/JPG
                  <input type="file" accept="image/png,image/jpeg" onChange={handleCampaignCreativeSelect} style={{ display: 'block', width: '100%', marginTop: 8, background: adminTheme.bg, border: `1px dashed ${adminTheme.cardBorder}`, borderRadius: 12, padding: 14, color: adminTheme.textSoft }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginTop: 14 }}>
                  {['1080 x 1920 px', '9:16 vertical', 'PNG or JPG', 'Max 2 MB', '160 px safe top/bottom', 'Admin approval before live'].map((rule) => (
                    <div key={rule} style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 10, padding: 10, color: adminTheme.textSoft, fontSize: 12 }}>{rule}</div>
                  ))}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button type="button" onClick={saveCampaignDraft} disabled={campaignSaveBusy} style={{ ...btnStyle('primary'), opacity: campaignSaveBusy ? 0.65 : 1 }}>
                    {campaignSaveBusy ? 'Saving…' : 'Save draft for review'}
                  </button>
                  <button type="button" onClick={loadCampaigns} disabled={campaignsLoading} style={btnStyle('ghost')}>
                    {campaignsLoading ? 'Refreshing…' : 'Refresh campaigns'}
                  </button>
                </div>
              </div>

              <div style={{ ...cardStyle(), padding: 18 }}>
                <h3 style={{ margin: '0 0 12px', fontFamily: adminTheme.fontDisplay, fontSize: 16 }}>Mobile preview</h3>
                <div style={{ borderRadius: 28, background: '#050807', border: '8px solid #0f1d1b', aspectRatio: '9 / 16', overflow: 'hidden', position: 'relative', boxShadow: '0 22px 60px rgba(0,0,0,.3)' }}>
                  {campaignCreativePreview ? (
                    <img src={campaignCreativePreview} alt="Campaign preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24, color: adminTheme.textMuted }}>
                      Upload a 1080 x 1920 creative to preview the 4-second access ad.
                    </div>
                  )}
                  <div style={{ position: 'absolute', left: 14, right: 14, bottom: 14, background: 'rgba(3,17,15,.86)', border: '1px solid rgba(255,255,255,.16)', borderRadius: 16, padding: 12 }}>
                    <div style={{ color: '#7DF4EA', fontSize: 11, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase' }}>Access opens in 4</div>
                    <div style={{ color: '#fff', fontWeight: 800, marginTop: 4 }}>{campaignCreativeName || campaignForm.campaign_name || 'Corner Bakery campaign'}</div>
                    <div style={{ color: 'rgba(255,255,255,.68)', fontSize: 12, marginTop: 4 }}>{campaignForm.offer_title || 'Guest sees your offer before the restroom code.'}</div>
                  </div>
                </div>
              </div>
            </section>

            <section style={{ ...cardStyle(), padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontFamily: adminTheme.fontDisplay, fontSize: 17 }}>Campaign review queue</h3>
              {campaignsLoading ? (
                <div style={{ color: adminTheme.textMuted, fontSize: 13 }}>Loading campaigns…</div>
              ) : (campaigns?.campaigns.length ?? 0) === 0 ? (
                <div style={{ color: adminTheme.textMuted, fontSize: 13 }}>No campaigns yet. Create the first draft above after running the migration.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {campaigns?.campaigns.map((campaign: any) => {
                    const creative = Array.isArray(campaign.campaign_creatives) ? campaign.campaign_creatives[0] : null
                    return (
                      <div key={campaign.id} style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: '64px minmax(0, 1fr) auto', gap: 12, alignItems: 'center' }}>
                        <div style={{ width: 48, height: 72, borderRadius: 10, overflow: 'hidden', background: adminTheme.card }}>
                          {creative?.public_url ? <img src={creative.public_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                        <div>
                          <div style={{ color: adminTheme.textSoft, fontWeight: 800 }}>{campaign.name}</div>
                          <div style={{ color: adminTheme.textMuted, fontSize: 12, marginTop: 3 }}>{campaign.business_locations?.business_name || 'Unknown business'} · {campaign.status}</div>
                          <div style={{ color: adminTheme.textMuted, fontSize: 12, marginTop: 3 }}>{campaign.offer_title || 'No offer title yet'}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button type="button" disabled={!!actionBusy} onClick={() => updateCampaignStatus(campaign.id, 'active')} style={btnStyle('ghost')}>Approve</button>
                          <button type="button" disabled={!!actionBusy} onClick={() => updateCampaignStatus(campaign.id, 'paused')} style={btnStyle('ghost')}>Pause</button>
                          <button type="button" disabled={!!actionBusy} onClick={() => updateCampaignStatus(campaign.id, 'rejected')} style={btnStyle('danger')}>Reject</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>

            <section style={{ ...cardStyle(), padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontFamily: adminTheme.fontDisplay, fontSize: 17 }}>Campaign lifecycle</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                {['Upload creative', 'Pending review', 'Approve campaign', 'QR scan shows ad', '4-second completion', 'Access code reveal', 'Analytics report'].map((step, index) => (
                  <div key={step} style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ color: adminTheme.teal, fontSize: 12, fontWeight: 900 }}>0{index + 1}</div>
                    <div style={{ color: adminTheme.textSoft, marginTop: 8, fontWeight: 800, fontSize: 13 }}>{step}</div>
                  </div>
                ))}
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
            {moderationError ? (
              <div
                style={{
                  ...cardStyle(),
                  padding: 16,
                  marginBottom: 16,
                  borderColor: 'rgba(251, 191, 36, 0.35)',
                  color: adminTheme.warning,
                  fontSize: 13,
                }}
              >
                {moderationError}
              </div>
            ) : null}

            {moderationLoading ? (
              <div style={{ ...cardStyle(), padding: 40, textAlign: 'center', color: adminTheme.textMuted }}>
                Loading moderation queue…
              </div>
            ) : (
              <>
                <p style={{ color: adminTheme.textMuted, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
                  {moderation?.summary.pendingCount ?? 0} pending submission
                  {(moderation?.summary.pendingCount ?? 0) === 1 ? '' : 's'} ·{' '}
                  {moderation?.summary.duplicateGroupCount ?? 0} duplicate group
                  {(moderation?.summary.duplicateGroupCount ?? 0) === 1 ? '' : 's'}
                </p>

                <h3 style={{ color: adminTheme.textSoft, fontSize: 14, margin: '0 0 12px', fontFamily: adminTheme.fontDisplay }}>
                  Pending access submissions
                </h3>
                {(moderation?.pendingSubmissions.length ?? 0) === 0 ? (
                  <div style={{ ...cardStyle(), padding: 24, textAlign: 'center', color: adminTheme.textMuted, marginBottom: 24 }}>
                    No pending submissions
                  </div>
                ) : (
                  moderation?.pendingSubmissions.map((item) => {
                    const venue = item.restroom
                    const pinText = String(item.submitted_pin || venue?.pin || '—')
                    const pinWords = BAD_WORDS.filter(
                      (w) => pinText.toLowerCase().includes(w) || (venue?.name || '').toLowerCase().includes(w),
                    )
                    const busy = actionBusy === 'approve_submission' || actionBusy === 'reject_submission'
                    return (
                      <div
                        key={item.id}
                        style={{
                          ...cardStyle(),
                          padding: 16,
                          marginBottom: 12,
                          borderColor: pinWords.length ? 'rgba(248, 113, 113, 0.35)' : adminTheme.cardBorder,
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, fontFamily: adminTheme.fontDisplay }}>
                          {venue?.name || `Restroom #${item.restroom_id}`}
                          {pinWords.length ? (
                            <span style={{ marginLeft: 8, fontSize: 10, background: adminTheme.danger, color: '#fff', borderRadius: 6, padding: '2px 6px' }}>
                              FLAGGED
                            </span>
                          ) : null}
                        </div>
                        <div style={{ fontSize: 12, color: adminTheme.textMuted, marginBottom: 4 }}>{venue?.address || '—'}</div>
                        <div style={{ fontSize: 12, color: adminTheme.textSoft, marginBottom: 4 }}>
                          Access: <span style={{ color: adminTheme.teal }}>{item.access_type}</span>
                          {' · '}
                          PIN: <span style={{ fontFamily: 'monospace', color: adminTheme.teal }}>{pinText}</span>
                        </div>
                        <div style={{ fontSize: 11, color: adminTheme.textMuted, marginBottom: 10 }}>
                          Submitted {new Date(item.created_at).toLocaleString()} · source {item.source || 'app'} · venue status{' '}
                          {venue?.status || 'unknown'}
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runModerationAction({ action: 'approve_submission', submissionId: item.id })}
                            style={btnStyle('ghost')}
                          >
                            Approve & publish
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => runModerationAction({ action: 'reject_submission', submissionId: item.id })}
                            style={btnStyle('ghost')}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )
                  })
                )}

                <h3 style={{ color: adminTheme.textSoft, fontSize: 14, margin: '24px 0 12px', fontFamily: adminTheme.fontDisplay }}>
                  Duplicate restrooms
                </h3>
                {(moderation?.duplicateGroups.length ?? 0) === 0 ? (
                  <div style={{ ...cardStyle(), padding: 24, textAlign: 'center', color: adminTheme.textMuted }}>
                    No duplicate name+address groups in recent records
                  </div>
                ) : (
                  moderation?.duplicateGroups.map((group) => (
                    <div key={group.key} style={{ ...cardStyle(), padding: 16, marginBottom: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, fontFamily: adminTheme.fontDisplay }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: 12, color: adminTheme.textMuted, marginBottom: 12 }}>{group.address}</div>
                      {group.rows.map((row, index) => (
                        <div
                          key={row.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 12,
                            padding: '10px 0',
                            borderTop: index === 0 ? 'none' : `1px solid ${adminTheme.cardBorder}`,
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 12, color: adminTheme.textSoft }}>
                              ID {row.id} · PIN {row.pin || '—'} · {row.status || 'unknown'}
                            </div>
                            <div style={{ fontSize: 11, color: adminTheme.textMuted }}>
                              {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              disabled={!!actionBusy}
                              onClick={() => runModerationAction({ action: 'approve_restroom', restroomId: row.id })}
                              style={btnStyle('ghost')}
                            >
                              Keep & verify
                            </button>
                            {index === 0 ? (
                              <button
                                type="button"
                                disabled={!!actionBusy}
                                onClick={() => runModerationAction({ action: 'dedupe_restroom', keeperId: row.id })}
                                style={btnStyle('ghost')}
                              >
                                Merge dupes here
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!!actionBusy}
                                onClick={() => {
                                  if (confirm('Delete this duplicate restroom row?')) {
                                    runModerationAction({ action: 'delete_restroom', restroomId: row.id })
                                  }
                                }}
                                style={btnStyle('danger')}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </>
            )}
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
                      onClick={() => handleFlaggedAction(item.id, 'approved')}
                      style={btnStyle('ghost')}
                    >
                      Allow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFlaggedAction(item.id, 'rejected')}
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
            {businessClaimsError ? (
              <div
                style={{
                  ...cardStyle(),
                  padding: 16,
                  marginBottom: 16,
                  borderColor: 'rgba(251, 191, 36, 0.35)',
                  color: adminTheme.warning,
                  fontSize: 13,
                }}
              >
                {businessClaimsError}
              </div>
            ) : null}

            {businessClaimsLoading ? (
              <div style={{ ...cardStyle(), padding: 40, textAlign: 'center', color: adminTheme.textMuted }}>
                Loading business claims…
              </div>
            ) : (
              <>
                <p style={{ color: adminTheme.textMuted, fontSize: 13, marginTop: 0, marginBottom: 16 }}>
                  {businessClaims?.summary.totalPending ?? 0} pending ·{' '}
                  {businessClaims?.summary.removalRequests ?? 0} removal / hide-PIN requests from claim portal
                </p>

                <h3 style={{ color: adminTheme.textSoft, fontSize: 14, margin: '0 0 12px', fontFamily: adminTheme.fontDisplay }}>
                  /business/claim submissions
                </h3>
                {(businessClaims?.claims.length ?? 0) === 0 ? (
                  <div style={{ ...cardStyle(), padding: 24, textAlign: 'center', color: adminTheme.textMuted, marginBottom: 24 }}>
                    No claim portal requests yet
                  </div>
                ) : (
                  businessClaims?.claims.map((item: any) => (
                    <div
                      key={item.id}
                      style={{
                        ...cardStyle(),
                        padding: 16,
                        marginBottom: 12,
                        borderColor:
                          item.request_type === 'removal' && item.status === 'pending'
                            ? 'rgba(248, 113, 113, 0.45)'
                            : item.status === 'pending'
                              ? 'rgba(251, 191, 36, 0.35)'
                              : adminTheme.cardBorder,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontWeight: 700, fontFamily: adminTheme.fontDisplay }}>
                          {item.business_name || 'Unknown'}
                          {item.request_type === 'removal' && item.status === 'pending' ? (
                            <span style={{ marginLeft: 8, fontSize: 10, background: adminTheme.danger, color: '#fff', borderRadius: 6, padding: '2px 6px' }}>
                              HIDE PIN
                            </span>
                          ) : null}
                        </div>
                        <span style={{ fontSize: 11, color: item.status === 'pending' ? adminTheme.warning : adminTheme.teal }}>
                          {item.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: adminTheme.textSoft, marginBottom: 4 }}>{claimTypeLabel(item.request_type)}</div>
                      <div style={{ fontSize: 12, color: adminTheme.textMuted, marginBottom: 4 }}>{item.business_address || '—'}</div>
                      <div style={{ fontSize: 12, color: adminTheme.textMuted, marginBottom: 4 }}>{item.message || '—'}</div>
                      <div style={{ fontSize: 11, color: adminTheme.textMuted, marginBottom: 10 }}>
                        {item.contact_name} · {item.contact_email} · {item.contact_phone || '—'} ·{' '}
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                        {item.email_trust ? ` · ${item.email_trust} email` : ''}
                      </div>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            disabled={!!actionBusy}
                            onClick={() => runBusinessClaimAction({ table: 'business_claim_requests', id: item.id, status: 'reviewed' })}
                            style={btnStyle('ghost')}
                          >
                            Mark reviewed
                          </button>
                          <button
                            type="button"
                            disabled={!!actionBusy}
                            onClick={() => runBusinessClaimAction({ table: 'business_claim_requests', id: item.id, status: 'resolved' })}
                            style={btnStyle('ghost')}
                          >
                            Mark resolved
                          </button>
                          <button
                            type="button"
                            disabled={!!actionBusy}
                            onClick={() => runBusinessClaimAction({ table: 'business_claim_requests', id: item.id, status: 'rejected' })}
                            style={btnStyle('danger')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}

                <h3 style={{ color: adminTheme.textSoft, fontSize: 14, margin: '24px 0 12px', fontFamily: adminTheme.fontDisplay }}>
                  /optout form (restroom not publicly available)
                </h3>
                {(businessClaims?.optouts.length ?? data.optouts.length) === 0 ? (
                  <div style={{ ...cardStyle(), padding: 24, textAlign: 'center', color: adminTheme.textMuted }}>
                    No opt-out requests
                  </div>
                ) : (
                  (businessClaims?.optouts ?? data.optouts).map((item: any) => (
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
                      <div style={{ fontSize: 12, color: adminTheme.textSoft, marginBottom: 4 }}>{item.reason || '—'}</div>
                      <div style={{ fontSize: 11, color: adminTheme.textMuted, marginBottom: 10 }}>
                        {item.contact_name || '—'} · {item.email || '—'} · {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                      </div>
                      {item.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            disabled={!!actionBusy}
                            onClick={() => runBusinessClaimAction({ table: 'optout_requests', id: item.id, status: 'approved' })}
                            style={btnStyle('ghost')}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={!!actionBusy}
                            onClick={() => runBusinessClaimAction({ table: 'optout_requests', id: item.id, status: 'rejected' })}
                            style={btnStyle('danger')}
                          >
                            Reject
                          </button>
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'quality' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <section style={{ ...cardStyle(), padding: 22 }}>
              <h2 style={{ margin: 0, fontFamily: adminTheme.fontDisplay, fontSize: 22, fontWeight: 800 }}>Data Quality Command Center</h2>
              <p style={{ margin: '8px 0 0', color: adminTheme.textMuted, fontSize: 13, lineHeight: 1.5, maxWidth: 760 }}>
                This is the safety layer before California-wide OSM/Overture seeding and future Google enrichment for paid businesses.
              </p>
            </section>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
              {[
                ['Duplicate risk', `${moderation?.summary.duplicateGroupCount ?? 0} groups loaded`, 'Same name/address or nearby venues must be merged before bulk imports.'],
                ['Pending code work', `${moderation?.summary.pendingCount ?? 0} submissions`, 'Approve good access info, reject bad data, log every action.'],
                ['Source strategy', 'OSM + Overture + paid Google', 'Keep source_external_id and source separate so Google can enrich paid accounts later.'],
                ['Opt-out safety', `${data.optouts.filter((o) => o.status === 'pending').length} pending`, 'Business removal requests should soft-hide public access, not destroy audit history.'],
                ['Campaign data', 'Schema needed', 'business_campaigns, campaign_creatives, campaign_events, qr_codes.'],
                ['Admin audit', `${data.logs.length} recent logs`, 'Every destructive action needs admin_logs traceability.'],
              ].map(([title, value, note]) => (
                <div key={title} style={{ ...cardStyle(), padding: 18 }}>
                  <div style={{ color: adminTheme.textMuted, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 900 }}>{title}</div>
                  <div style={{ color: adminTheme.teal, fontFamily: adminTheme.fontDisplay, fontSize: 24, fontWeight: 800, marginTop: 8 }}>{value}</div>
                  <p style={{ color: adminTheme.textMuted, fontSize: 12, lineHeight: 1.5, margin: '8px 0 0' }}>{note}</p>
                </div>
              ))}
            </section>
            <section style={{ ...cardStyle(), padding: 20 }}>
              <h3 style={{ margin: '0 0 14px', fontFamily: adminTheme.fontDisplay, fontSize: 17 }}>Required next database tables</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {['business_accounts', 'business_locations', 'business_campaigns', 'campaign_creatives', 'qr_codes', 'campaign_events', 'admin_roles', 'restroom_source_links'].map((table) => (
                  <div key={table} style={{ background: adminTheme.bg, border: `1px solid ${adminTheme.cardBorder}`, borderRadius: 10, padding: 12, color: adminTheme.textSoft, fontFamily: 'monospace', fontSize: 12 }}>{table}</div>
                ))}
              </div>
            </section>
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
