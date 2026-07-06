'use client'

import { useEffect, useState } from 'react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'
import { APP_STORE_URL } from '../lib/site'
import LanguageToggle from '../components/LanguageToggle'

const COLOR_OPTIONS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#FF5722', '#00BCD4',
  '#8BC34A', '#FF9800', '#795548', '#607D8B', '#0A2E1F',
]

export default function HomePage() {
  const { t } = useLang()
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

  const handleOAuthSignIn = async (provider: 'google') => {
    setMessage('')
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) setMessage(error.message)
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
    width: '100%', padding: '13px 16px', borderRadius: '10px', border: '1px solid #d8e6e2',
    fontSize: '16px', fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif", outline: 'none',
    boxSizing: 'border-box', color: '#101f1e', background: 'white',
  }
  const labelStyle: React.CSSProperties = { fontSize: '13px', fontWeight: 800, color: '#36514e', marginBottom: 8, display: 'block' }

  return (
    <main className="fp-home">
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&family=Manrope:wght@700;800&display=swap");
        .fp-home{--ink:#071917;--muted:#5d6d69;--teal:#0eb5ab;--leaf:#194d42;--lime:#d9f76f;--coral:#ff6f4a;--mist:#edf8f5;--line:rgba(7,25,23,.12);margin:0;background:#fbfffd;color:var(--ink);font-family:Inter,system-ui,sans-serif;overflow:hidden}
        .fp-home *{box-sizing:border-box}.fp-nav{position:sticky;top:0;z-index:50;background:rgba(251,255,253,.88);backdrop-filter:blur(18px);border-bottom:1px solid rgba(7,25,23,.08);padding:12px 18px}.fp-nav-inner{width:min(1180px,100%);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:16px}.fp-nav-actions{display:flex;align-items:center;gap:9px}.fp-nav-link,.fp-nav-btn{min-height:42px;border-radius:12px;padding:11px 16px;border:1px solid transparent;font-size:14px;font-weight:850;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;cursor:pointer}.fp-nav-link{color:#314d49}.fp-nav-link:hover{color:var(--teal)}.fp-nav-btn.light{background:#fff;border-color:#dce9e6;color:var(--ink)}.fp-nav-btn.teal{background:var(--teal);color:#fff}.fp-nav-btn.dark{background:var(--ink);color:#fff}.fp-lang{display:flex;background:#edf5f3;border-radius:12px;padding:3px}.fp-lang button{border:0;border-radius:9px;padding:7px 10px;background:transparent;cursor:pointer}.fp-menu{display:none;border:0;background:transparent;padding:7px;cursor:pointer}.fp-menu span{display:block;width:24px;height:2px;background:var(--ink);border-radius:9px;margin:5px 0}
        .fp-hero{min-height:calc(100vh - 66px);padding:34px 22px 28px;display:grid;align-items:center;background-image:linear-gradient(90deg,rgba(7,25,23,.94),rgba(7,25,23,.78) 45%,rgba(7,25,23,.16)),url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2400&q=84");background-size:cover;background-position:center;position:relative}.fp-hero-shell{width:min(1180px,100%);margin:0 auto;display:grid;grid-template-columns:minmax(0,1.02fr) minmax(340px,.78fr);align-items:center;gap:48px}.fp-kicker{display:inline-flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.22);border-radius:999px;background:rgba(255,255,255,.11);backdrop-filter:blur(16px);padding:8px 13px;color:#d9fffb;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.fp-kicker:before{content:"";width:8px;height:8px;border-radius:50%;background:var(--lime);box-shadow:0 0 0 5px rgba(217,247,111,.18)}.fp-title{max-width:720px;margin:22px 0 18px;color:#fff;font-family:Manrope,Inter,system-ui,sans-serif;font-size:clamp(44px,7.4vw,88px);font-weight:900;line-height:.91;letter-spacing:0}.fp-title span{color:#8ffff5}.fp-lede{max-width:630px;margin:0;color:rgba(255,255,255,.84);font-size:clamp(18px,2.35vw,23px);line-height:1.52}.fp-app-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:26px}.fp-store,.fp-web-map{min-height:56px;border-radius:15px;padding:12px 18px;text-decoration:none;display:inline-flex;align-items:center;gap:12px;font-weight:900}.fp-store{background:#fff;color:#071917;box-shadow:0 22px 52px rgba(0,0,0,.22)}.fp-store small,.fp-web-map small{display:block;font-size:11px;line-height:1;color:#60716e}.fp-store strong,.fp-web-map strong{display:block;font-size:17px;line-height:1.1}.fp-web-map{background:var(--teal);color:#fff}.fp-web-map small{color:#d9fffb}.fp-search{width:min(640px,100%);margin-top:16px;background:rgba(255,255,255,.96);border-radius:18px;padding:8px;display:flex;box-shadow:0 22px 60px rgba(0,0,0,.26)}.fp-search input{flex:1;min-width:0;border:0;background:transparent;border-radius:12px;padding:16px 18px;color:#102927;outline:0;font-size:16px}.fp-search button{border:0;border-radius:12px;background:#071917;color:#fff;padding:0 22px;font-size:15px;font-weight:900;cursor:pointer}.fp-proof{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}.fp-proof span{border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.1);padding:8px 12px;color:rgba(255,255,255,.8);font-size:13px;font-weight:800}
        .fp-phone{justify-self:end;width:min(414px,100%);aspect-ratio:430/932;border-radius:58px;padding:10px;background:linear-gradient(135deg,#f3f0e9 0%,#a7a29a 13%,#f9f7f1 24%,#8f8a82 50%,#f4f1ea 78%,#77726b 100%);border:1px solid rgba(255,255,255,.58);box-shadow:0 56px 120px rgba(0,0,0,.46),inset 0 0 0 1px rgba(255,255,255,.68);position:relative;transform:rotate(1.4deg);backdrop-filter:blur(20px)}.fp-phone:before{content:"";position:absolute;left:-5px;top:150px;width:4px;height:78px;border-radius:6px 0 0 6px;background:linear-gradient(#d8d4cc,#77726c)}.fp-phone:after{content:"";position:absolute;right:-5px;top:215px;width:4px;height:106px;border-radius:0 6px 6px 0;background:linear-gradient(#d8d4cc,#77726c)}.fp-screen{height:100%;border-radius:49px;background:#f8fffd;overflow:hidden;position:relative;border:9px solid #080b0b;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18),inset 0 0 26px rgba(0,0,0,.18)}.fp-app-shot{display:block;width:100%;height:100%;object-fit:cover;object-position:top center}
        .fp-band{background:linear-gradient(#fbfffd,#f2faf7)}.fp-section{width:min(1120px,calc(100% - 40px));margin:0 auto;padding:74px 0}.fp-heading{text-align:center;max-width:760px;margin:0 auto 34px}.fp-heading h2{margin:0;color:var(--ink);font-family:Manrope,Inter,system-ui,sans-serif;font-size:clamp(32px,4.8vw,58px);line-height:.98;letter-spacing:0}.fp-heading p{margin:14px 0 0;color:var(--muted);font-size:17px;line-height:1.65}.fp-photo-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.fp-photo-card{min-height:430px;border-radius:28px;overflow:hidden;position:relative;background-size:cover;background-position:center;box-shadow:0 24px 60px rgba(7,25,23,.14)}.fp-photo-card.small{min-height:206px}.fp-photo-stack{display:grid;gap:18px}.fp-photo-copy{position:absolute;left:22px;right:22px;bottom:22px;color:#fff}.fp-photo-copy h3{margin:0 0 8px;font-size:28px;line-height:1.05}.fp-photo-copy p{margin:0;color:rgba(255,255,255,.82);line-height:1.55;font-weight:650}.fp-overlay{position:absolute;inset:0;background:linear-gradient(transparent 30%,rgba(7,25,23,.82))}
        .fp-feature-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.fp-feature{border:1px solid var(--line);border-radius:24px;background:#fff;padding:24px;min-height:260px;box-shadow:0 18px 45px rgba(7,25,23,.06)}.fp-icon{width:48px;height:48px;border-radius:16px;background:#e2fbf8;color:#087e78;display:grid;place-items:center;font-weight:950;margin-bottom:18px}.fp-feature h3{margin:0 0 10px;font-size:22px}.fp-feature p{margin:0;color:var(--muted);line-height:1.65}.fp-business{display:grid;grid-template-columns:1fr .72fr;gap:26px;align-items:stretch;border-radius:30px;background:#071917;color:#fff;padding:34px;box-shadow:0 28px 72px rgba(7,25,23,.2)}.fp-business h2{margin:0;font-family:Manrope,Inter,system-ui,sans-serif;font-size:clamp(32px,4.4vw,56px);line-height:1}.fp-business p{margin:16px 0 0;color:rgba(255,255,255,.74);font-size:16px;line-height:1.7}.fp-dashboard{border:1px solid rgba(255,255,255,.14);border-radius:24px;background:rgba(255,255,255,.08);padding:20px}.fp-bars{display:grid;gap:11px;margin-top:16px}.fp-bars span{height:11px;border-radius:999px;background:rgba(255,255,255,.18)}.fp-bars span:nth-child(2){width:72%;background:rgba(14,181,171,.48)}.fp-metrics{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:22px}.fp-metric{border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:14px}.fp-metric b{display:block;font-size:24px}.fp-metric span{font-size:12px;color:rgba(255,255,255,.66)}
        @media(max-width:900px){.fp-hero-shell,.fp-photo-grid,.fp-business{grid-template-columns:1fr}.fp-phone{justify-self:start}.fp-feature-grid{grid-template-columns:1fr}.fp-photo-card,.fp-photo-card.small{min-height:360px}}@media(max-width:640px){.fp-nav-actions{display:none}.fp-menu{display:block}.fp-nav-mobile{display:grid!important}.fp-hero{min-height:auto;padding:28px 16px 34px;background-image:linear-gradient(rgba(7,25,23,.9),rgba(7,25,23,.68)),url("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=82")}.fp-title{font-size:clamp(40px,13vw,58px)}.fp-lede{font-size:17px}.fp-phone{display:none}.fp-search{flex-direction:column}.fp-search button{min-height:50px}.fp-section{width:min(100% - 28px,1120px);padding:56px 0}.fp-app-row{display:grid}.fp-store,.fp-web-map{width:100%}.fp-business{padding:24px}.fp-metrics{grid-template-columns:1fr}}
      `}</style>

      <nav className="fp-nav">
        <div className="fp-nav-inner">
          <a href="/" aria-label="FlushPin home"><Logo height={58} /></a>
          <div className="fp-nav-actions">
            <LanguageToggle />
            <a className="fp-nav-link" href="/business">{t.forBusinesses}</a>
            {user ? (
              <>
                <span style={{ width: 28, height: 28, borderRadius: '50%', background: profileColor }} />
                <span style={{ fontSize: 14, fontWeight: 800 }}>{displayName}</span>
                <button className="fp-nav-btn light" onClick={handleSignOut}>{t.signOut}</button>
              </>
            ) : (
              <>
                <button className="fp-nav-btn light" onClick={() => { setShowAuth(true); setAuthMode('signin'); setMessage('') }}>{t.signIn}</button>
                <button className="fp-nav-btn teal" onClick={() => { setShowAuth(true); setAuthMode('signup'); setMessage('') }}>{t.signUp}</button>
              </>
            )}
            <a className="fp-nav-btn dark" href="/map">{t.findRestroom}</a>
          </div>
          <button className="fp-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu"><span /><span /><span /></button>
        </div>
        {menuOpen && (
          <div className="fp-nav-mobile" style={{ display: 'none', gap: 10, paddingTop: 14 }}>
            <a className="fp-nav-btn dark" href="/map">{t.home.mobileFindNow}</a>
            <a className="fp-nav-btn light" href="/business">{t.forBusinesses}</a>
            {!user && <button className="fp-nav-btn teal" onClick={() => { setShowAuth(true); setAuthMode('signup') }}>{t.home.mobileSignUpFree}</button>}
          </div>
        )}
      </nav>

      <section className="fp-hero">
        <div className="fp-hero-shell">
          <div>
            <div className="fp-kicker">{t.home.kicker}</div>
            <h1 className="fp-title">{t.home.heroTitleMain} <span>{t.home.heroTitleAccent}</span></h1>
            <p className="fp-lede">{t.home.heroDesc}</p>
            <div className="fp-app-row">
              <a href={APP_STORE_URL} aria-label="Download on the App Store">
                <img src="/app-store-badge.jpg" alt="Download on the App Store" style={{ maxWidth: '190px', width: '100%', height: 'auto', display: 'block' }} />
              </a>
              <a className="fp-web-map" href="/map"><span><small>{t.home.webMapSmall}</small><strong>{t.home.webMapStrong}</strong></span></a>
            </div>
            <div className="fp-search">
              <input type="text" placeholder={t.home.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button onClick={handleSearch}>{t.home.findNearby}</button>
            </div>
            <div className="fp-proof"><span>{t.home.proofCleanliness}</span><span>{t.home.proofCode}</span><span>{t.home.proofRules}</span></div>
          </div>
          <aside className="fp-phone" aria-label="FlushPin mobile app preview">
            <div className="fp-screen">
              <img className="fp-app-shot" src="/flushpin-nearby-hero.png" alt="FlushPin Nearby app screen showing California restroom results" />
            </div>
          </aside>
        </div>
      </section>

      <div className="fp-band">
        <section className="fp-section">
          <div className="fp-heading"><h2>{t.home.section1Title}</h2><p>{t.home.section1Desc}</p></div>
          <div className="fp-photo-grid">
            <article className="fp-photo-card" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=82")' }}><div className="fp-overlay" /><div className="fp-photo-copy"><h3>{t.home.photo1Title}</h3><p>{t.home.photo1Desc}</p></div></article>
            <div className="fp-photo-stack">
              <article className="fp-photo-card small" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1100&q=82")' }}><div className="fp-overlay" /><div className="fp-photo-copy"><h3>{t.home.photo2Title}</h3><p>{t.home.photo2Desc}</p></div></article>
              <article className="fp-photo-card small" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1100&q=82")' }}><div className="fp-overlay" /><div className="fp-photo-copy"><h3>{t.home.photo3Title}</h3><p>{t.home.photo3Desc}</p></div></article>
            </div>
          </div>
        </section>

        <section className="fp-section" style={{ paddingTop: 0 }}>
          <div className="fp-feature-grid">
            <article className="fp-feature"><div className="fp-icon">01</div><h3>{t.home.feature1Title}</h3><p>{t.home.feature1Desc}</p></article>
            <article className="fp-feature"><div className="fp-icon">02</div><h3>{t.home.feature2Title}</h3><p>{t.home.feature2Desc}</p></article>
            <article className="fp-feature"><div className="fp-icon">03</div><h3>{t.home.feature3Title}</h3><p>{t.home.feature3Desc}</p></article>
          </div>
        </section>

        <section className="fp-section" style={{ paddingTop: 0 }}>
          <div className="fp-business">
            <div>
              <h2>{t.home.businessTitle}</h2>
              <p>{t.home.businessDesc}</p>
              <div className="fp-app-row"><a className="fp-web-map" href="/business"><span><small>{t.home.businessPlanSmall}</small><strong>{t.home.businessPlanStrong}</strong></span></a><a className="fp-store" href="/contact"><span><small>{t.home.partnershipSmall}</small><strong>{t.home.partnershipStrong}</strong></span></a></div>
            </div>
            <aside className="fp-dashboard">
              <div style={{ color: '#8ffff5', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>{t.home.dashboardPreview}</div>
              <div className="fp-bars"><span style={{ width: '94%' }} /><span /><span style={{ width: '58%' }} /></div>
              <div className="fp-metrics"><div className="fp-metric"><b>184</b><span>{t.home.metricScans}</span></div><div className="fp-metric"><b>2-5p</b><span>{t.home.metricPeak}</span></div><div className="fp-metric"><b>37%</b><span>{t.home.metricOffers}</span></div><div className="fp-metric"><b>12%</b><span>{t.home.metricValue}</span></div></div>
            </aside>
          </div>
        </section>
      </div>

      {showAuth && (
        <div onClick={() => { setShowAuth(false); setMessage('') }} style={{ position: 'fixed', inset: 0, background: 'rgba(3,17,15,.68)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, width: '100%', maxWidth: 430, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 28px 90px rgba(0,0,0,.32)', border: '1px solid rgba(255,255,255,.7)' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #eef2f1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18 }}>
              <Logo height={34} />
              <button aria-label={t.home.close} onClick={() => { setShowAuth(false); setMessage('') }} style={{ width: 38, height: 38, borderRadius: '50%', border: '1px solid #dfe8e6', background: '#f7fbfa', color: '#61716f', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 24 }}>×</button>
            </div>
            <div style={{ padding: '26px 28px 30px' }}>
              <p style={{ margin: '0 0 8px', color: '#0EB5AB', fontSize: 12, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase' }}>{t.home.authAccountLabel}</p>
              <h2 style={{ margin: '0 0 22px', fontSize: 28, lineHeight: 1.08, fontWeight: 900, color: '#092321' }}>{authMode === 'signup' ? t.joinFlushPin : t.welcomeBack}</h2>
              <button onClick={() => handleOAuthSignIn('google')} style={{ width: '100%', background: '#fff', color: '#182725', border: '1.5px solid #dce7e5', padding: '14px 16px', borderRadius: 14, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 18 }}>{t.continueGoogle}</button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                {authMode === 'signup' && (
                  <>
                    <div><label style={labelStyle}>{t.fullName}</label><input style={inputStyle} placeholder={t.home.namePlaceholder} value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                    <div><label style={labelStyle}>{t.home.profileColor}</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{COLOR_OPTIONS.map(color => <div key={color} onClick={() => setSelectedColor(color)} style={{ width: 30, height: 30, borderRadius: '50%', background: color, cursor: 'pointer', border: selectedColor === color ? '3px solid #0A2E1F' : '3px solid transparent' }} />)}</div></div>
                  </>
                )}
                <div><label style={labelStyle}>{t.email}</label><input style={inputStyle} type="email" placeholder={t.home.emailPlaceholder} value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div><label style={labelStyle}>{t.password}</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
                {message && <p style={{ fontSize: 14, color: message.includes('Check') ? '#087f68' : '#B91C1C', background: message.includes('Check') ? '#E6FFFA' : '#FEF2F2', borderRadius: 12, padding: '10px 12px', margin: 0, fontWeight: 800 }}>{message}</p>}
                <button onClick={authMode === 'signup' ? handleSignUp : handleSignIn} disabled={loading} style={{ background: '#0EB5AB', color: 'white', border: 'none', padding: 16, borderRadius: 14, fontSize: 17, fontWeight: 900, cursor: 'pointer', opacity: loading ? .7 : 1 }}>{loading ? '...' : (authMode === 'signup' ? t.createAccount : t.signIn)}</button>
                <button onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setMessage('') }} style={{ background: 'none', border: 'none', color: '#0EB5AB', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>{authMode === 'signup' ? t.home.alreadyHaveAccount : t.home.needAccount}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
