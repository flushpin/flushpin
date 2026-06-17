'use client'

import { useEffect, useState } from 'react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'

const COLOR_OPTIONS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#FF5722', '#00BCD4',
  '#8BC34A', '#FF9800', '#795548', '#607D8B', '#0A2E1F',
]

export default function HomePage() {
  const { lang, setLang, t } = useLang()
  const [user, setUser] = useState<any>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#0EB5AB')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'https://www.flushpin.com' } })
  }

  const handleSignUp = async () => {
    if (!fullName.trim()) { setMessage(t.home.enterFullName); return }
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), profile_color: selectedColor } },
    })
    if (error) setMessage(error.message.includes('already registered') ? t.home.emailRegistered : error.message)
    else setMessage(t.home.checkEmail)
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true); setMessage('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    else { setShowAuth(false); setMessage('') }
    setLoading(false)
  }

  const handleSignOut = async () => { await supabase.auth.signOut(); setUser(null) }

  const handleSearch = () => {
    if (searchQuery.trim()) window.location.href = `/map?q=${encodeURIComponent(searchQuery.trim())}`
    else window.location.href = '/map'
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const profileColor = user?.user_metadata?.profile_color || '#0EB5AB'
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '9px',
    border: '1px solid #e0e0e0',
    fontSize: '16px',
    fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif",
    outline: 'none',
    boxSizing: 'border-box',
    color: '#1a1a1a',
    background: 'white',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 700,
    color: '#425755',
    marginBottom: '8px',
    display: 'block',
  }

  return (
    <main className="fp-home">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Sora:wght@600;700;800&display=swap");
        .fp-home{--fp-ink:#092321;--fp-muted:#5d6f6d;--fp-teal:#0eb5ab;--fp-coral:#ff6b4a;--fp-line:rgba(9,35,33,.12);margin:0;padding:0;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:#fff;min-height:100vh;color:var(--fp-ink)}
        .fp-home *{box-sizing:border-box}.fp-nav-link:hover,.fp-footer-link:hover{color:var(--fp-teal)!important}.fp-primary:hover{transform:translateY(-1px);box-shadow:0 18px 34px rgba(14,181,171,.26)}.fp-secondary:hover{color:#d7fffb!important;border-color:rgba(14,181,171,.55)!important}
        .fp-hero{background-image:linear-gradient(90deg,rgba(9,35,33,.94) 0%,rgba(9,35,33,.82) 44%,rgba(9,35,33,.34) 100%),url(https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2200&q=80);background-position:center;background-size:cover;min-height:660px;padding:66px 24px 50px;position:relative;overflow:hidden}
        .fp-hero-shell{z-index:1;grid-template-columns:minmax(0,1.02fr) minmax(360px,.78fr);align-items:center;gap:56px;width:min(1180px,100%);margin:0 auto;display:grid;position:relative}
        .fp-hero-copy{color:#fff;max-width:660px}.fp-eyebrow{color:#d7fffb;letter-spacing:.04em;text-transform:uppercase;backdrop-filter:blur(14px);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:999px;align-items:center;gap:10px;padding:8px 14px;font-size:13px;font-weight:800;display:inline-flex}.fp-eyebrow span{width:8px;height:8px;border-radius:50%;background:var(--fp-teal);box-shadow:0 0 0 5px rgba(14,181,171,.18)}
        .fp-hero-title{letter-spacing:-.035em;margin:24px 0 22px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(44px,6.4vw,76px);font-weight:800;line-height:.96}.fp-hero-title span{color:#7df4ea}.fp-hero-text{color:rgba(255,255,255,.84);max-width:590px;margin:0 0 30px;font-size:clamp(18px,2.4vw,22px);line-height:1.58}
        .fp-search{background:rgba(255,255,255,.96);border-radius:18px;width:min(620px,100%);padding:8px;display:flex;box-shadow:0 26px 70px rgba(0,0,0,.28)}.fp-search input{color:#102927;background:transparent;border:0;border-radius:12px;outline:0;flex:1;min-width:0;padding:16px 18px;font-family:inherit;font-size:16px}.fp-search button{background:var(--fp-teal);color:#fff;cursor:pointer;white-space:nowrap;border:0;border-radius:12px;padding:0 24px;font-size:16px;font-weight:800}
        .fp-cta-row{flex-wrap:wrap;align-items:center;gap:12px;margin-top:18px;display:flex}.fp-primary,.fp-secondary{border-radius:14px;justify-content:center;align-items:center;min-height:48px;padding:14px 22px;font-size:15px;font-weight:800;text-decoration:none;transition:transform .18s,box-shadow .18s,border-color .18s,color .18s;display:inline-flex}.fp-primary{background:var(--fp-teal);color:#fff;box-shadow:0 12px 24px rgba(14,181,171,.22)}.fp-secondary{color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28)}
        .fp-hero-proof{color:rgba(255,255,255,.78);flex-wrap:wrap;gap:10px;margin-top:26px;font-size:13px;font-weight:700;display:flex}.fp-proof-pill{backdrop-filter:blur(12px);background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:8px 12px}
        .fp-phone{backdrop-filter:blur(22px);background:linear-gradient(145deg,rgba(255,255,255,.86),rgba(255,255,255,.38));border:1px solid rgba(255,255,255,.42);border-radius:36px;justify-self:end;width:min(410px,100%);padding:14px;box-shadow:0 38px 90px rgba(0,0,0,.38)}.fp-phone-screen{background:#f6faf8;border:1px solid rgba(9,35,33,.1);border-radius:28px;min-height:520px;position:relative;overflow:hidden}.fp-map{background:linear-gradient(90deg,rgba(14,181,171,.08) 1px,transparent 1px) 0 0/56px 56px,linear-gradient(rgba(14,181,171,.08) 1px,transparent 1px) 0 0/56px 56px,radial-gradient(circle at 26% 28%,#fff1d6 0 9%,transparent 10%),radial-gradient(circle at 72% 18%,#ddf8f5 0 10%,transparent 11%),radial-gradient(circle at 78% 70%,#ffe2d6 0 12%,transparent 13%),#f5fbf8;position:absolute;inset:0}.fp-route{border:4px solid rgba(255,107,74,.5);border-color:rgba(255,107,74,.5) rgba(255,107,74,.5) transparent transparent;border-radius:60px 90px 70px 20px;width:280px;height:210px;position:absolute;top:126px;left:54px;transform:rotate(11deg)}.fp-pin{background:var(--fp-teal);border-radius:50% 50% 50% 8px;width:42px;height:42px;position:absolute;transform:rotate(-45deg);box-shadow:0 14px 26px rgba(14,181,171,.32)}.fp-pin:after{content:"";background:#fff;border-radius:50%;width:14px;height:14px;position:absolute;top:14px;left:14px}.fp-pin.one{top:150px;left:74px}.fp-pin.two{background:var(--fp-coral);top:100px;right:58px}.fp-pin.three{background:#142f2c;bottom:188px;right:92px}
        .fp-card{background:rgba(255,255,255,.96);border:1px solid rgba(9,35,33,.08);border-radius:24px;padding:20px;position:absolute;bottom:22px;left:22px;right:22px;box-shadow:0 24px 54px rgba(9,35,33,.2)}.fp-card-top{justify-content:space-between;align-items:flex-start;gap:14px;margin-bottom:16px;display:flex}.fp-card h3{color:var(--fp-ink);letter-spacing:-.02em;margin:0 0 5px;font-size:20px}.fp-card p{color:var(--fp-muted);margin:0;font-size:13px;line-height:1.45}.fp-chip{color:#087e78;white-space:nowrap;background:#e5fbf8;border-radius:999px;padding:8px 10px;font-size:12px;font-weight:800;display:inline-flex}.fp-access-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;display:grid}.fp-access-box{background:#fbfffe;border:1px solid rgba(9,35,33,.1);border-radius:16px;padding:13px}.fp-access-label{color:var(--fp-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px;font-size:11px;font-weight:800}.fp-access-value{color:var(--fp-ink);font-size:15px;font-weight:800}
        .fp-sections{background:linear-gradient(#fff7ed 0%,#fff 38%,#f7fbfa 100%)}.fp-section{width:min(1120px,100% - 40px);margin:0 auto;padding:76px 0}.fp-section-heading{text-align:center;max-width:720px;margin:0 auto 34px}.fp-section-heading h2{letter-spacing:-.03em;color:var(--fp-ink);margin:0 0 12px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(30px,4.6vw,52px);line-height:1.04}.fp-section-heading p{color:var(--fp-muted);margin:0;font-size:17px;line-height:1.65}.fp-stats{border:1px solid var(--fp-line);background:var(--fp-line);border-radius:24px;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;display:grid;overflow:hidden;box-shadow:0 22px 60px rgba(9,35,33,.08)}.fp-stat{background:#fff;min-height:150px;padding:30px}.fp-stat strong{letter-spacing:-.03em;color:var(--fp-ink);margin-bottom:10px;font-size:clamp(30px,4vw,48px);line-height:1;display:block}.fp-stat span{color:var(--fp-muted);font-size:14px;font-weight:700;line-height:1.5}
        .fp-feature-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;display:grid}.fp-feature{border:1px solid var(--fp-line);background:rgba(255,255,255,.86);border-radius:24px;min-height:280px;padding:24px;box-shadow:0 18px 45px rgba(9,35,33,.06)}.fp-feature-visual{background:linear-gradient(135deg,#e6fbf8,#fff1e9);border:1px solid rgba(9,35,33,.08);border-radius:18px;height:116px;margin-bottom:20px;padding:14px;position:relative;overflow:hidden}.fp-feature h3{color:var(--fp-ink);letter-spacing:-.02em;margin:0 0 10px;font-size:21px}.fp-feature p{color:var(--fp-muted);margin:0;font-size:15px;line-height:1.65}.fp-mini-line{background:rgba(9,35,33,.12);border-radius:999px;height:10px;margin-bottom:10px}.fp-mini-line.med{background:rgba(14,181,171,.22)}
        .fp-business{color:#fff;background:#092321;border-radius:28px;grid-template-columns:1fr .72fr;align-items:stretch;gap:26px;padding:34px;display:grid;position:relative;overflow:hidden}.fp-business h2{letter-spacing:-.03em;max-width:640px;margin:0 0 14px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(30px,4vw,50px);line-height:1.06}.fp-business p{color:rgba(255,255,255,.74);max-width:610px;margin:0 0 22px;font-size:16px;line-height:1.7}.fp-business-panel{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:22px}.fp-footer{color:#fff;background:#071a18;padding:56px 24px 30px}.fp-footer-grid{grid-template-columns:1.25fr .8fr .8fr;gap:34px;width:min(1120px,100%);margin:0 auto 34px;display:grid}.fp-footer h3,.fp-footer h4{margin:0 0 14px}.fp-footer p{color:rgba(255,255,255,.68);margin:0;line-height:1.65}.fp-footer a{color:rgba(255,255,255,.72);margin-bottom:10px;font-size:14px;font-weight:700;text-decoration:none;display:block}.fp-footer-bottom{color:rgba(255,255,255,.45);border-top:1px solid rgba(255,255,255,.12);flex-wrap:wrap;justify-content:space-between;gap:16px;width:min(1120px,100%);margin:0 auto;padding-top:24px;font-size:13px;display:flex}
        @media (max-width:900px){.fp-hero{min-height:auto;padding:58px 20px}.fp-hero-shell,.fp-business,.fp-footer-grid{grid-template-columns:1fr}.fp-phone{justify-self:start;max-width:390px}.fp-feature-grid,.fp-stats{grid-template-columns:1fr}}@media (max-width:640px){.desktop-nav{display:none!important}.mobile-menu-btn{display:block!important}.fp-hero{padding:42px 20px 38px}.fp-hero-title{font-size:clamp(38px,12vw,52px)}.fp-hero-text{margin-bottom:24px;font-size:17px;line-height:1.52}.fp-phone{display:none!important}.fp-search{flex-direction:column}.fp-search button{min-height:50px}.fp-section{width:min(100% - 28px,1120px);padding:58px 0}.fp-business{padding:24px}}
      `}</style>

      <nav style={{ background: 'white', borderBottom: '1px solid #f0f0f0', padding: '16px 20px', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo height={58} />
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }} className="desktop-nav">
            <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '8px', padding: '3px' }}>
              <button onClick={() => setLang('en')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: lang === 'en' ? 'white' : 'transparent', color: lang === 'en' ? '#0A2E1F' : '#999' }}>🇺🇸</button>
              <button onClick={() => setLang('es')} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', background: lang === 'es' ? 'white' : 'transparent', color: lang === 'es' ? '#0A2E1F' : '#999' }}>🇲🇽</button>
            </div>
            <a className="fp-nav-link" href="/business" style={{ color: '#425755', textDecoration: 'none', fontSize: '15px', fontWeight: 750 }}>{t.forBusinesses}</a>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: profileColor, flexShrink: 0 }} />
                <span style={{ fontSize: '15px', color: '#0A2E1F', fontWeight: 700 }}>{displayName}</span>
                <button onClick={handleSignOut} style={{ background: '#f5f5f5', border: 'none', padding: '9px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', color: '#555' }}>{t.signOut}</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowAuth(true); setAuthMode('signin'); setMessage('') }} style={{ background: 'white', color: '#0A2E1F', padding: '10px 20px', borderRadius: '9px', border: '1.5px solid #e0e0e0', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>{t.signIn}</button>
                <button onClick={() => { setShowAuth(true); setAuthMode('signup'); setMessage('') }} style={{ background: '#0EB5AB', color: 'white', padding: '10px 20px', borderRadius: '9px', border: 'none', fontSize: '15px', fontWeight: 800, cursor: 'pointer' }}>{t.signUp}</button>
              </div>
            )}
            <a href="/map" style={{ background: '#092321', color: 'white', padding: '10px 20px', borderRadius: '9px', textDecoration: 'none', fontSize: '15px', fontWeight: 800 }}>{t.findRestroom}</a>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'none' }} className="mobile-menu-btn">
            <div style={{ width: '24px', height: '2px', background: '#0A2E1F', marginBottom: '6px', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '2px', background: '#0A2E1F', marginBottom: '6px', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '2px', background: '#0A2E1F', borderRadius: '2px' }} />
          </button>
        </div>
        {menuOpen && (
          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '16px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="/business" onClick={() => setMenuOpen(false)} style={{ color: '#425755', textDecoration: 'none', fontSize: '15px', fontWeight: 700 }}>{t.forBusinesses}</a>
            <a href="/map" onClick={() => setMenuOpen(false)} style={{ background: '#092321', color: 'white', padding: '13px', borderRadius: '9px', textDecoration: 'none', fontSize: '15px', fontWeight: 800, textAlign: 'center' }}>{t.findRestroom}</a>
          </div>
        )}
      </nav>

      <section className="fp-hero">
        <div className="fp-hero-shell">
          <div className="fp-hero-copy">
            <div className="fp-eyebrow"><span />{t.badge}</div>
            <h1 className="fp-hero-title">{t.home.heroTitleMain} <span>{t.home.heroTitleAccent}</span></h1>
            <p className="fp-hero-text">{t.home.heroDesc}</p>
            <div className="fp-search">
              <input type="text" placeholder={t.home.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button onClick={handleSearch}>{t.home.findNearby}</button>
            </div>
            <div className="fp-cta-row">
              <a className="fp-primary" href="/map">{t.findBtn}</a>
              {!user && <button className="fp-secondary" onClick={() => { setShowAuth(true); setAuthMode('signup') }} style={{ cursor: 'pointer' }}>{t.joinFree}</button>}
            </div>
            <div className="fp-hero-proof">
              <span className="fp-proof-pill">{t.home.proofAccess}</span>
              <span className="fp-proof-pill">{t.home.proofBuilt}</span>
              <span className="fp-proof-pill">{t.home.proofMap}</span>
            </div>
          </div>
          <div className="fp-phone" aria-label="FlushPin map preview">
            <div className="fp-phone-screen">
              <div className="fp-map" />
              <div className="fp-route" />
              <div className="fp-pin one" />
              <div className="fp-pin two" />
              <div className="fp-pin three" />
              <div className="fp-card">
                <div className="fp-card-top">
                  <div>
                    <h3>{t.home.cardPlace}</h3>
                    <p>{t.home.cardDistance}</p>
                  </div>
                  <span className="fp-chip">{t.home.verified}</span>
                </div>
                <div className="fp-access-grid">
                  <div className="fp-access-box"><div className="fp-access-label">{t.home.access}</div><div className="fp-access-value">{t.home.askStaffValue}</div></div>
                  <div className="fp-access-box"><div className="fp-access-label">{t.home.cleanliness}</div><div className="fp-access-value">4.8 / 5</div></div>
                  <div className="fp-access-box"><div className="fp-access-label">{t.home.policy}</div><div className="fp-access-value">{t.home.customers}</div></div>
                  <div className="fp-access-box"><div className="fp-access-label">{t.home.confidence}</div><div className="fp-access-value">{t.home.high}</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fp-sections">
        <section className="fp-section">
          <div className="fp-stats">
            <div className="fp-stat"><strong>69,795+</strong><span>{t.home.statVenues}</span></div>
            <div className="fp-stat"><strong>251+</strong><span>{t.home.statCities}</span></div>
            <div className="fp-stat"><strong>4 types</strong><span>{t.home.statTypes}</span></div>
          </div>
        </section>
        <section className="fp-section" style={{ paddingTop: 0 }}>
          <div className="fp-section-heading">
            <h2>{t.home.sectionTitle}</h2>
            <p>{t.home.sectionSub}</p>
          </div>
          <div className="fp-feature-grid">
            {t.home.features.map(([title, desc, color]) => (
              <div className="fp-feature" key={title}>
                <div className="fp-feature-visual">
                  <div className="fp-mini-line" style={{ width: '92%' }} />
                  <div className="fp-mini-line med" style={{ width: '70%' }} />
                  <div className="fp-mini-line" style={{ width: '48%' }} />
                  <div style={{ position: 'absolute', right: 18, bottom: 16, width: 42, height: 42, borderRadius: '50% 50% 50% 8px', transform: 'rotate(-45deg)', background: color, boxShadow: '0 12px 24px rgba(9,35,33,.15)' }} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="fp-section" style={{ paddingTop: 0 }}>
          <div className="fp-business">
            <div>
              <h2>{t.home.businessTitle}</h2>
              <p>{t.home.businessDesc}</p>
              <div className="fp-cta-row">
                <a className="fp-primary" href="/business">{t.forBusinesses}</a>
                <a className="fp-secondary" href="/contact">{t.home.contactFlushPin}</a>
              </div>
            </div>
            <div className="fp-business-panel">
              <div className="fp-access-label" style={{ color: '#7DF4EA' }}>{t.home.dashboardPreview}</div>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,.18)', margin: '18px 0 12px', width: '86%' }} />
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(14,181,171,.42)', marginBottom: 12, width: '64%' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 24 }}>
                <div style={{ border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, padding: 14 }}><strong style={{ display: 'block', fontSize: 24, marginBottom: 4 }}>{t.home.claim}</strong><span style={{ color: 'rgba(255,255,255,.64)', fontSize: 13 }}>{t.home.manageDetails}</span></div>
                <div style={{ border: '1px solid rgba(255,255,255,.14)', borderRadius: 16, padding: 14 }}><strong style={{ display: 'block', fontSize: 24, marginBottom: 4 }}>{t.home.promote}</strong><span style={{ color: 'rgba(255,255,255,.64)', fontSize: 13 }}>{t.home.reachUsers}</span></div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAuth && (
        <div onClick={() => { setShowAuth(false); setMessage('') }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: '20px', padding: '30px 26px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0A2E1F' }}>{authMode === 'signup' ? t.joinFlushPin : t.welcomeBack}</h2>
              <button onClick={() => { setShowAuth(false); setMessage('') }} style={{ background: 'none', border: 'none', fontSize: '26px', cursor: 'pointer', color: '#999' }}>{t.home.close}</button>
            </div>
            <button onClick={handleGoogleSignIn} style={{ width: '100%', background: 'white', color: '#333', border: '1.5px solid #e0e0e0', padding: '13px', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginBottom: '16px' }}>{t.continueGoogle}</button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {authMode === 'signup' && (
                <>
                  <div><label style={labelStyle}>{t.fullName}</label><input style={inputStyle} placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                  <div>
                    <label style={labelStyle}>{t.home.profileColor}</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {COLOR_OPTIONS.map(color => <div key={color} onClick={() => setSelectedColor(color)} style={{ width: 30, height: 30, borderRadius: '50%', background: color, cursor: 'pointer', border: selectedColor === color ? '3px solid #0A2E1F' : '3px solid transparent' }} />)}
                    </div>
                  </div>
                </>
              )}
              <div><label style={labelStyle}>{t.email}</label><input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><label style={labelStyle}>{t.password}</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
              {message && <p style={{ fontSize: '14px', color: message.includes('Check') ? '#0EB5AB' : '#DC2626', margin: 0, fontWeight: 700 }}>{message}</p>}
              <button onClick={authMode === 'signup' ? handleSignUp : handleSignIn} disabled={loading} style={{ background: '#0EB5AB', color: 'white', border: 'none', padding: '16px', borderRadius: '10px', fontSize: '17px', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? '...' : (authMode === 'signup' ? t.createAccount : t.signIn)}</button>
              <button onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} style={{ background: 'none', border: 'none', color: '#0EB5AB', fontSize: '14px', fontWeight: 800, cursor: 'pointer', padding: 0 }}>{authMode === 'signup' ? t.home.alreadyHaveAccount : t.home.needAccount}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
