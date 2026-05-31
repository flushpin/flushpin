'use client'

import { useState } from 'react'

const ADMIN_USER = 'admin@flushpin.com'
const ADMIN_PASS = 'Exxa2020@'

export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: any) => {
    e.preventDefault()
    if (email === ADMIN_USER && password === ADMIN_PASS) {
      setLoggedIn(true)
      loadData()
    } else {
      setError('Wrong email or password.')
    }
  }

  const loadData = async () => {
    setLoading(true)
    const { createBrowserClient } = await import('@supabase/ssr')
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    )
    const { data: restrooms } = await supabase.from('restroom').select('*')
    const { data: optouts } = await supabase.from('optout_requests').select('*')
    const { data: flagged } = await supabase.from('flagged_content').select('*').eq('status', 'pending')
    const { data: logs } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(50)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const cityMap: Record<string, number> = {}
    restrooms?.forEach((r: any) => {
      const city = r.city || 'Unknown'
      cityMap[city] = (cityMap[city] || 0) + 1
    })

    const BAD_WORDS = ['fuck','shit','bitch','nigga','nigger','negro','faggot','retard','spic','chink','rape','bomb','orospu','yarrak','sikis','bok','amk']
    const withFlags = (restrooms || [])
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50)
      .map((r: any) => {
        const words = BAD_WORDS.filter(w => (r.access_code || '').toLowerCase().includes(w) || (r.name || '').toLowerCase().includes(w))
        return { ...r, isFlagged: words.length > 0, flagWords: words }
      })

    setData({
      restrooms: withFlags,
      optouts: optouts || [],
      flagged: flagged || [],
      logs: logs || [],
      stats: {
        total: restrooms?.length || 0,
        today: restrooms?.filter((r: any) => new Date(r.created_at) >= today).length || 0,
        optoutPending: optouts?.filter((o: any) => o.status === 'pending').length || 0,
        flaggedCount: flagged?.length || 0,
      },
      cities: Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 10),
      supabase,
    })
    setLoading(false)
  }

  const handleAction = async (table: string, id: string, update: any) => {
    await data.supabase.from(table).update(update).eq('id', id)
    loadData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete?')) return
    await data.supabase.from('restroom').delete().eq('id', id)
    loadData()
  }

  // LOGIN SCREEN
  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚿</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#60a5fa' }}>FlushPin Admin</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Restricted Access</div>
          </div>

          <form onSubmit={handleLogin} style={{ background: '#1e293b', borderRadius: '16px', padding: '28px', border: '1px solid #334155' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@flushpin.com"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '12px', color: '#e2e8f0', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>
            {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>{error}</div>}
            <button type="submit" style={{ width: '100%', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  // LOADING
  if (loading || !data) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a' }}>
        <div style={{ color: '#60a5fa', fontSize: '18px' }}>Loading...</div>
      </div>
    )
  }

  // DASHBOARD
  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'pins', label: 'Pins' },
    { key: 'flagged', label: 'Flagged', badge: data.stats.flaggedCount },
    { key: 'optout', label: 'Opt-Out', badge: data.stats.optoutPending },
    { key: 'logs', label: 'Logs' },
  ]

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', position: 'sticky', top: 0, zIndex: 100 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#60a5fa' }}>FlushPin Admin</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>John Ertan</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={loadData} style={{ background: '#334155', color: '#94a3b8', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}>Refresh</button>
          <button onClick={() => setLoggedIn(false)} style={{ background: '#7c2d12', color: '#fb923c', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', background: '#1e293b', borderBottom: '1px solid #334155' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '12px 16px', border: 'none', background: activeTab === tab.key ? '#0f172a' : 'transparent', color: activeTab === tab.key ? '#60a5fa' : '#64748b', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap', borderBottom: activeTab === tab.key ? '2px solid #60a5fa' : '2px solid transparent' }}>
            {tab.label}
            {(tab as any).badge > 0 ? <span style={{ background: '#ef4444', color: 'white', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', marginLeft: '4px' }}>{(tab as any).badge}</span> : null}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Total Restrooms', value: data.stats.total, color: '#60a5fa' },
                { label: 'Added Today', value: data.stats.today, color: '#34d399' },
                { label: 'Opt-Out Pending', value: data.stats.optoutPending, color: '#f59e0b' },
                { label: 'Flagged Content', value: data.stats.flaggedCount, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155' }}>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#1e293b', borderRadius: '12px', padding: '16px', border: '1px solid #334155' }}>
              <div style={{ fontWeight: 600, marginBottom: '12px', color: '#94a3b8' }}>Top Cities</div>
              {data.cities.map(([city, count]: any, i: number) => (
                <div key={city} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.cities.length - 1 ? '1px solid #334155' : 'none' }}>
                  <span>{city}</span>
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'pins' && (
          <div>
            <div style={{ marginBottom: '12px', color: '#64748b', fontSize: '13px' }}>Son {data.restrooms.length} kayit</div>
            {data.restrooms.map((pin: any) => (
              <div key={pin.id} style={{ background: pin.isFlagged ? '#2d1b1b' : '#1e293b', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid ' + (pin.isFlagged ? '#ef4444' : '#334155') }}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: pin.isFlagged ? '#fca5a5' : '#e2e8f0', marginBottom: '6px' }}>
                  {pin.name || 'Unknown'}
                  {pin.isFlagged && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#ef4444', color: 'white', borderRadius: '4px', padding: '1px 6px' }}>FLAGGED</span>}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{pin.city || '-'} - {pin.address || '-'}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>PIN: <span style={{ color: '#fbbf24', fontFamily: 'monospace' }}>{pin.access_code || '-'}</span></div>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{new Date(pin.created_at).toLocaleString()} - {pin.status || 'active'}</div>
                {pin.isFlagged && <div style={{ fontSize: '11px', color: '#ef4444', marginBottom: '8px' }}>Detected: {pin.flagWords.join(', ')}</div>}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction('restroom', pin.id, { status: 'approved' })} style={{ background: '#065f46', color: '#34d399', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Approve</button>
                  <button onClick={() => handleAction('restroom', pin.id, { status: 'rejected' })} style={{ background: '#7c2d12', color: '#fb923c', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Reject</button>
                  <button onClick={() => handleDelete(pin.id)} style={{ background: '#1e1b4b', color: '#a5b4fc', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'flagged' && (
          <div>
            {data.flagged.length === 0
              ? <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No flagged content</div>
              : data.flagged.map((item: any) => (
                <div key={item.id} style={{ background: '#2d1b1b', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #ef4444' }}>
                  <div style={{ fontWeight: 600, color: '#fca5a5', marginBottom: '6px' }}>{item.content_type} - {item.flag_reason}</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>{item.content_text}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleAction('flagged_content', item.id, { status: 'approved', reviewed_by: 'admin', reviewed_at: new Date().toISOString() })} style={{ background: '#065f46', color: '#34d399', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Allow</button>
                    <button onClick={() => handleAction('flagged_content', item.id, { status: 'rejected', reviewed_by: 'admin', reviewed_at: new Date().toISOString() })} style={{ background: '#7c2d12', color: '#fb923c', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {activeTab === 'optout' && (
          <div>
            {data.optouts.length === 0
              ? <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No opt-out requests</div>
              : data.optouts.map((item: any) => (
                <div key={item.id} style={{ background: '#1e293b', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid ' + (item.status === 'pending' ? '#f59e0b' : '#334155') }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ fontWeight: 600 }}>{item.business_name || 'Unknown'}</div>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '10px', background: item.status === 'pending' ? '#451a03' : '#052e16', color: item.status === 'pending' ? '#fbbf24' : '#34d399' }}>{item.status}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{item.city || '-'}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>{item.reason || item.request_type || '-'}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>{item.contact_email || '-'} - {new Date(item.created_at).toLocaleDateString()}</div>
                  {item.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleAction('optout_requests', item.id, { status: 'approved' })} style={{ background: '#065f46', color: '#34d399', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Approve</button>
                      <button onClick={() => handleAction('optout_requests', item.id, { status: 'rejected' })} style={{ background: '#7c2d12', color: '#fb923c', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px' }}>Reject</button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            {data.logs.length === 0
              ? <div style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No logs yet</div>
              : data.logs.map((log: any) => (
                <div key={log.id} style={{ background: '#1e293b', borderRadius: '8px', padding: '12px', marginBottom: '8px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: '#60a5fa', fontWeight: 600, fontSize: '13px' }}>{log.action}</span>
                      <span style={{ color: '#64748b', fontSize: '12px', marginLeft: '8px' }}>{log.target_type}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{new Date(log.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}
