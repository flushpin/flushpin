'use client'

import { useEffect, useState } from 'react'
import Logo from '../components/Logo'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'
import { APP_STORE_URL } from '../lib/site'

type HomeEventItem = {
  id: string
  name: string
  date: string
  time: string
  venue: { name: string; address: string; lat: number | null; lng: number | null }
}

type SeasonalMessage = {
  label: string
  title: string
  body: string
  action: string
}

function getHomeEventIcon(eventName: string) {
  const name = eventName.toLowerCase()
  if (/basketball|nba/.test(name)) return '🏀'
  if (/soccer|football|fc|match/.test(name)) return '⚽'
  if (/hockey|nhl|ducks|kings/.test(name)) return '🏒'
  if (/concert|music|band|tour|festival|dj|club/.test(name)) return '🎵'
  return '🎟️'
}

function getHomeEventCity(address: string) {
  const parts = address.split(',').map(part => part.trim()).filter(Boolean)
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || 'Nearby'
}

function formatHomeEventDate(date: string) {
  if (!date) return 'Date TBA'
  const value = new Date(`${date}T00:00:00`)
  if (Number.isNaN(value.getTime())) return date
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(value)
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, nth: number) {
  const first = new Date(year, month, 1)
  const offset = (weekday - first.getDay() + 7) % 7
  return new Date(year, month, 1 + offset + (nth - 1) * 7)
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number) {
  const last = new Date(year, month + 1, 0)
  const offset = (last.getDay() - weekday + 7) % 7
  return new Date(year, month, last.getDate() - offset)
}

function getDaysFrom(date: Date, month: number, day: number) {
  const target = new Date(date.getFullYear(), month, day)
  return Math.round((date.getTime() - target.getTime()) / 86400000)
}

function getSeasonalMessage(now: number | null, lang: 'en' | 'es'): SeasonalMessage | null {
  if (now == null) return null
  const today = new Date(now)
  const year = today.getFullYear()
  const daysFromJulyFourth = getDaysFrom(today, 6, 4)
  const daysFromChristmas = getDaysFrom(today, 11, 25)
  const daysFromNewYear = getDaysFrom(today, 0, 1)
  const memorialDay = lastWeekdayOfMonth(year, 4, 1)
  const laborDay = nthWeekdayOfMonth(year, 8, 1, 1)
  const thanksgiving = nthWeekdayOfMonth(year, 10, 4, 4)
  const daysFromMemorial = Math.round((today.getTime() - memorialDay.getTime()) / 86400000)
  const daysFromLabor = Math.round((today.getTime() - laborDay.getTime()) / 86400000)
  const daysFromThanksgiving = Math.round((today.getTime() - thanksgiving.getTime()) / 86400000)
  const spanish = lang === 'es'

  if (daysFromJulyFourth === 0) {
    return {
      label: spanish ? '4 de julio' : 'Fourth of July',
      title: spanish ? 'Happy 4th of July' : 'Happy 4th of July',
      body: spanish ? 'Encuentra acceso cerca de desfiles, fuegos artificiales y planes de verano.' : 'Find restroom access near parades, fireworks, and summer plans.',
      action: spanish ? 'Buscar cerca' : 'Search nearby',
    }
  }
  if (daysFromMemorial === 0) {
    return {
      label: spanish ? 'Memorial Day' : 'Memorial Day',
      title: spanish ? 'Memorial Day weekend' : 'Memorial Day weekend',
      body: spanish ? 'Para viajes, playas y parques: revisa el acceso antes de salir.' : 'For road trips, beaches, and parks: check access before you head out.',
      action: spanish ? 'Abrir mapa' : 'Open map',
    }
  }
  if (daysFromLabor === 0) {
    return {
      label: spanish ? 'Labor Day' : 'Labor Day',
      title: spanish ? 'Labor Day travel help' : 'Labor Day travel help',
      body: spanish ? 'Planes de fin de semana largo funcionan mejor con una parada confiable.' : 'Long-weekend plans go smoother with a reliable stop nearby.',
      action: spanish ? 'Ver mapa' : 'View map',
    }
  }
  if (daysFromThanksgiving === 0) {
    return {
      label: spanish ? 'Thanksgiving' : 'Thanksgiving',
      title: spanish ? 'Thanksgiving travel made easier' : 'Thanksgiving travel made easier',
      body: spanish ? 'Encuentra baños cerca de rutas, restaurantes y visitas familiares.' : 'Find restroom access near routes, restaurants, and family stops.',
      action: spanish ? 'Buscar ahora' : 'Search now',
    }
  }
  if (daysFromChristmas === 0) {
    return {
      label: spanish ? 'Holiday season' : 'Holiday season',
      title: spanish ? 'Holiday errands, easier stops' : 'Holiday errands, easier stops',
      body: spanish ? 'Compras, viajes y eventos son más simples con acceso claro cerca.' : 'Shopping, travel, and events are easier with clear access nearby.',
      action: spanish ? 'Encontrar acceso' : 'Find access',
    }
  }
  if (daysFromNewYear === 0) {
    return {
      label: spanish ? 'New Year' : 'New Year',
      title: spanish ? 'Start the year with better access' : 'Start the year with better access',
      body: spanish ? 'Gracias por ayudar a que FlushPin sea más útil para todos.' : 'Thanks for helping make FlushPin more useful for everyone.',
      action: spanish ? 'Abrir FlushPin' : 'Open FlushPin',
    }
  }
  return null
}

const COLOR_OPTIONS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#FF5722', '#00BCD4',
  '#8BC34A', '#FF9800', '#795548', '#607D8B', '#0A2E1F',
]

const CALIFORNIA_WORLD_CUP_MATCHES = [
  {
    date: '2026-06-18T12:00:00-07:00',
    matchup: 'Switzerland vs Bosnia and Herzegovina',
    stage: 'Group B',
    stadium: 'Los Angeles Stadium',
    city: 'Inglewood, California',
    restroomSearch: 'Los Angeles Stadium Inglewood restrooms',
    lat: 33.9535,
    lng: -118.3392,
    mapLabel: 'Los Angeles Stadium, Inglewood, CA',
  },
  {
    date: '2026-06-19T21:00:00-07:00',
    matchup: 'Turkiye vs Paraguay',
    stage: 'Group D',
    stadium: 'San Francisco Bay Area Stadium',
    city: 'Santa Clara, California',
    restroomSearch: "Levi's Stadium Santa Clara restrooms",
    lat: 37.4030,
    lng: -121.9700,
    mapLabel: "San Francisco Bay Area Stadium, Santa Clara, CA",
  },
  {
    date: '2026-06-21T12:00:00-07:00',
    matchup: 'Belgium vs IR Iran',
    stage: 'Group G',
    stadium: 'Los Angeles Stadium',
    city: 'Inglewood, California',
    restroomSearch: 'Los Angeles Stadium Inglewood restrooms',
    lat: 33.9535,
    lng: -118.3392,
    mapLabel: 'Los Angeles Stadium, Inglewood, CA',
  },
  {
    date: '2026-06-22T20:00:00-07:00',
    matchup: 'Jordan vs Algeria',
    stage: 'Group J',
    stadium: 'San Francisco Bay Area Stadium',
    city: 'Santa Clara, California',
    restroomSearch: "Levi's Stadium Santa Clara restrooms",
    lat: 37.4030,
    lng: -121.9700,
    mapLabel: "San Francisco Bay Area Stadium, Santa Clara, CA",
  },
  {
    date: '2026-06-25T19:00:00-07:00',
    matchup: 'Turkiye vs USA',
    stage: 'Group D',
    stadium: 'Los Angeles Stadium',
    city: 'Inglewood, California',
    restroomSearch: 'Los Angeles Stadium Inglewood restrooms',
    lat: 33.9535,
    lng: -118.3392,
    mapLabel: 'Los Angeles Stadium, Inglewood, CA',
  },
  {
    date: '2026-06-25T19:00:00-07:00',
    matchup: 'Paraguay vs Australia',
    stage: 'Group D',
    stadium: 'San Francisco Bay Area Stadium',
    city: 'Santa Clara, California',
    restroomSearch: "Levi's Stadium Santa Clara restrooms",
    lat: 37.4030,
    lng: -121.9700,
    mapLabel: "San Francisco Bay Area Stadium, Santa Clara, CA",
  },
  {
    date: '2026-06-28T12:00:00-07:00',
    matchup: 'Round of 32',
    stage: 'Knockout',
    stadium: 'Los Angeles Stadium',
    city: 'Inglewood, California',
    restroomSearch: 'Los Angeles Stadium Inglewood restrooms',
    lat: 33.9535,
    lng: -118.3392,
    mapLabel: 'Los Angeles Stadium, Inglewood, CA',
  },
  {
    date: '2026-07-01T17:00:00-07:00',
    matchup: 'Round of 32',
    stage: 'Knockout',
    stadium: 'San Francisco Bay Area Stadium',
    city: 'Santa Clara, California',
    restroomSearch: "Levi's Stadium Santa Clara restrooms",
    lat: 37.4030,
    lng: -121.9700,
    mapLabel: "San Francisco Bay Area Stadium, Santa Clara, CA",
  },
  {
    date: '2026-07-02T12:00:00-07:00',
    matchup: 'Round of 32',
    stage: 'Knockout',
    stadium: 'Los Angeles Stadium',
    city: 'Inglewood, California',
    restroomSearch: 'Los Angeles Stadium Inglewood restrooms',
    lat: 33.9535,
    lng: -118.3392,
    mapLabel: 'Los Angeles Stadium, Inglewood, CA',
  },
  {
    date: '2026-07-10T12:00:00-07:00',
    matchup: 'Quarter-final',
    stage: 'Knockout',
    stadium: 'Los Angeles Stadium',
    city: 'Inglewood, California',
    restroomSearch: 'Los Angeles Stadium Inglewood restrooms',
    lat: 33.9535,
    lng: -118.3392,
    mapLabel: 'Los Angeles Stadium, Inglewood, CA',
  },
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
  const [worldCupNow, setWorldCupNow] = useState<number | null>(null)
  const [homeEvents, setHomeEvents] = useState<HomeEventItem[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setWorldCupNow(Date.now())
    const interval = window.setInterval(() => setWorldCupNow(Date.now()), 60 * 60 * 1000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return

    const loadHomeEvents = async (lat: number, lng: number) => {
      try {
        const res = await fetch(`/api/events?lat=${lat}&lng=${lng}`)
        if (!res.ok) return
        const data = await res.json()
        setHomeEvents((data.events || []).slice(0, 5))
      } catch {
        setHomeEvents([])
      }
    }

    navigator.geolocation.getCurrentPosition(
      position => loadHomeEvents(position.coords.latitude, position.coords.longitude),
      () => setHomeEvents([]),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    )
  }, [])

  const handleOAuthSignIn = async (provider: 'google') => {
    setMessage('')
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
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
  const visibleWorldCupMatches = (worldCupNow == null
    ? CALIFORNIA_WORLD_CUP_MATCHES
    : CALIFORNIA_WORLD_CUP_MATCHES.filter(match => new Date(match.date).getTime() >= worldCupNow - 4 * 60 * 60 * 1000)
  ).slice(0, 4)
  const seasonalMessage = getSeasonalMessage(worldCupNow, lang === 'es' ? 'es' : 'en')
  const formatMatchTime = (date: string, timeZone: string) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone,
      timeZoneName: 'short',
    }).format(new Date(date))
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
        .fp-home{--fp-ink:#092321;--fp-muted:#5d6f6d;--fp-teal:#0eb5ab;--fp-coral:#ff6b4a;--fp-line:rgba(9,35,33,.12);margin:0;padding:0;font-family:"Plus Jakarta Sans",Inter,system-ui,sans-serif;background:#fff;min-height:100vh;color:var(--fp-ink);overflow-x:hidden}
        .fp-home *{box-sizing:border-box}.fp-nav-link:hover,.fp-footer-link:hover{color:var(--fp-teal)!important}.fp-primary:hover{transform:translateY(-1px);box-shadow:0 18px 34px rgba(14,181,171,.26)}.fp-secondary:hover{color:#d7fffb!important;border-color:rgba(14,181,171,.55)!important}.fp-nav-shell{display:flex;justify-content:space-between;align-items:center;gap:24px;width:min(1180px,100%);margin:0 auto}.desktop-nav{display:flex;align-items:center;gap:14px}.fp-nav-cluster{display:flex;align-items:center;gap:10px;padding:6px 8px;border:1px solid rgba(9,35,33,.1);border-radius:14px;background:#fff;box-shadow:0 8px 22px rgba(9,35,33,.04)}.fp-nav-divider{width:1px;height:28px;background:rgba(9,35,33,.14);flex:0 0 auto}.fp-user-pill{display:flex;align-items:center;gap:9px;min-height:42px;padding:4px 6px 4px 4px;border:1px solid rgba(9,35,33,.1);border-radius:999px;background:#f8fbfa}.fp-nav-link{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 12px;border-radius:10px;white-space:nowrap}.fp-nav-link.is-active{background:#effaf8;color:#087e78!important}.fp-nav-link.is-business{border-left:1px solid rgba(9,35,33,.12);border-radius:0;padding-left:16px}.fp-nav-cta{background:#092321;color:white;padding:11px 18px;border-radius:11px;text-decoration:none;font-size:15px;font-weight:850;white-space:nowrap}.fp-nav-cta:hover{background:#0d3430}
        .fp-hero{background-image:linear-gradient(90deg,rgba(9,35,33,.94) 0%,rgba(9,35,33,.82) 44%,rgba(9,35,33,.34) 100%),url(https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=2200&q=80);background-position:center;background-size:cover;min-height:660px;padding:66px 24px 50px;position:relative;overflow:hidden}
        .fp-hero-shell{z-index:1;grid-template-columns:minmax(0,1.02fr) minmax(360px,.78fr);align-items:center;gap:56px;width:min(1180px,100%);margin:0 auto;display:grid;position:relative}
        .fp-hero-copy{color:#fff;max-width:660px}.fp-eyebrow{color:#d7fffb;letter-spacing:.04em;text-transform:uppercase;backdrop-filter:blur(14px);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);border-radius:999px;align-items:center;gap:10px;padding:8px 14px;font-size:13px;font-weight:800;display:inline-flex}.fp-eyebrow span{width:8px;height:8px;border-radius:50%;background:var(--fp-teal);box-shadow:0 0 0 5px rgba(14,181,171,.18)}
        .fp-hero-title{letter-spacing:-.035em;margin:24px 0 22px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(44px,6.4vw,76px);font-weight:800;line-height:.96}.fp-hero-title span{color:#7df4ea}.fp-hero-text{color:rgba(255,255,255,.84);max-width:590px;margin:0 0 30px;font-size:clamp(18px,2.4vw,22px);line-height:1.58}
        .fp-search{background:rgba(255,255,255,.96);border-radius:18px;width:min(620px,100%);padding:8px;display:flex;box-shadow:0 26px 70px rgba(0,0,0,.28)}.fp-search input{color:#102927;background:transparent;border:0;border-radius:12px;outline:0;flex:1;min-width:0;padding:16px 18px;font-family:inherit;font-size:16px}.fp-search button{background:var(--fp-teal);color:#fff;cursor:pointer;white-space:nowrap;border:0;border-radius:12px;padding:0 24px;font-size:16px;font-weight:800}
        .fp-event-strip{margin-top:16px;width:min(620px,100%)}.fp-event-strip-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.fp-event-strip-title{color:#fff;font-size:14px;font-weight:900}.fp-event-strip-link{color:#7df4ea;font-size:13px;font-weight:900;text-decoration:none;white-space:nowrap}.fp-event-scroll{display:flex;gap:10px;overflow-x:auto;padding:2px 2px 10px;scrollbar-width:none}.fp-event-scroll::-webkit-scrollbar{display:none}.fp-home-event-card{background:#fff;border-left:3px solid var(--fp-teal);border-radius:10px;box-shadow:0 12px 28px rgba(0,0,0,.2);color:var(--fp-ink);display:grid;grid-template-columns:auto minmax(138px,1fr);gap:9px;min-width:210px;padding:11px;text-decoration:none}.fp-home-event-icon{font-size:20px;line-height:1}.fp-home-event-name{font-size:13px;font-weight:900;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}.fp-home-event-meta{color:var(--fp-muted);font-size:11px;font-weight:800;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fp-cta-row{flex-wrap:wrap;align-items:center;gap:12px;margin-top:18px;display:flex}.fp-primary,.fp-secondary{border-radius:14px;justify-content:center;align-items:center;min-height:48px;padding:14px 22px;font-size:15px;font-weight:800;text-decoration:none;transition:transform .18s,box-shadow .18s,border-color .18s,color .18s;display:inline-flex}.fp-primary{background:var(--fp-teal);color:#fff;box-shadow:0 12px 24px rgba(14,181,171,.22)}.fp-secondary{color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28)}
        .fp-hero-proof{color:rgba(255,255,255,.78);flex-wrap:wrap;gap:10px;margin-top:26px;font-size:13px;font-weight:700;display:flex}.fp-proof-pill{backdrop-filter:blur(12px);background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:8px 12px}
        .fp-device-stage{justify-self:end;width:min(440px,100%);min-height:560px;display:grid;place-items:center;position:relative}.fp-device-stage:before{content:"";position:absolute;inset:20px 0 0;background:radial-gradient(circle at 28% 22%,rgba(125,244,234,.28),transparent 30%),radial-gradient(circle at 82% 76%,rgba(255,107,74,.18),transparent 28%),linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.16);border-radius:42px;backdrop-filter:blur(18px)}.fp-iphone{width:min(318px,76vw);aspect-ratio:430/932;border-radius:46px;background:linear-gradient(135deg,#f8fbfa,#aeb8b6 44%,#f5fbf8 54%,#6f7c79);padding:10px;position:relative;box-shadow:0 42px 90px rgba(0,0,0,.42),inset 0 0 0 1px rgba(255,255,255,.55);transform:rotate(-3deg);z-index:1}.fp-iphone:before{content:"";position:absolute;inset:5px;border-radius:42px;border:1px solid rgba(255,255,255,.72);pointer-events:none}.fp-iphone-screen{height:100%;border-radius:37px;background:#f7fbfa;overflow:hidden;position:relative;border:1px solid rgba(9,35,33,.14)}.fp-dynamic-island{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:112px;height:31px;border-radius:999px;background:#0a1110;z-index:5;box-shadow:0 2px 7px rgba(0,0,0,.3)}.fp-app-screen{height:100%;position:relative;background:linear-gradient(180deg,#f7fffd 0%,#eff9f7 58%,#ffffff 100%);padding:56px 18px 18px;color:#092321}.fp-app-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}.fp-app-brand{display:flex;align-items:center;gap:9px;font-weight:950;font-size:18px;letter-spacing:-.03em}.fp-app-brand span{width:28px;height:28px;border-radius:9px;background:#0eb5ab;display:grid;place-items:center;color:#fff;font-size:15px}.fp-app-avatar{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#092321,#0eb5ab)}.fp-app-search{height:42px;border-radius:14px;background:#fff;border:1px solid rgba(9,35,33,.1);display:flex;align-items:center;gap:9px;padding:0 12px;color:#60716f;font-size:12px;font-weight:850;box-shadow:0 10px 24px rgba(9,35,33,.08)}.fp-app-search-dot{width:18px;height:18px;border-radius:50%;background:#0eb5ab;box-shadow:inset 0 0 0 6px #dff8f5}.fp-app-map{height:260px;margin:16px -18px 0;position:relative;background:linear-gradient(90deg,rgba(14,181,171,.08) 1px,transparent 1px) 0 0/42px 42px,linear-gradient(rgba(14,181,171,.08) 1px,transparent 1px) 0 0/42px 42px,radial-gradient(circle at 24% 28%,#fff0d7 0 12%,transparent 13%),radial-gradient(circle at 75% 24%,#dff8f5 0 12%,transparent 13%),radial-gradient(circle at 76% 76%,#ffe1d7 0 13%,transparent 14%),#f5fbf8;overflow:hidden}.fp-app-route{position:absolute;left:54px;top:92px;width:210px;height:126px;border:4px solid rgba(255,107,74,.42);border-left-color:transparent;border-bottom-color:transparent;border-radius:80px 110px 30px 70px;transform:rotate(13deg)}.fp-app-pin{position:absolute;width:35px;height:35px;border-radius:50% 50% 50% 8px;transform:rotate(-45deg);background:#0eb5ab;box-shadow:0 12px 24px rgba(14,181,171,.24)}.fp-app-pin:after{content:"";position:absolute;width:11px;height:11px;border-radius:50%;background:#fff;left:12px;top:12px}.fp-app-pin.a{left:72px;top:88px}.fp-app-pin.b{right:62px;top:57px;background:#ff6b4a}.fp-app-pin.c{right:96px;bottom:54px;background:#092321}.fp-app-sheet{position:absolute;left:14px;right:14px;bottom:18px;background:rgba(255,255,255,.96);border:1px solid rgba(9,35,33,.09);border-radius:24px;padding:17px;box-shadow:0 22px 50px rgba(9,35,33,.18)}.fp-app-sheet-head{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.fp-app-sheet h3{margin:0 0 3px;font-size:18px;letter-spacing:-.03em;color:#092321}.fp-app-sheet p{margin:0;color:#5d6f6d;font-size:12px;font-weight:750}.fp-app-verified{align-self:flex-start;color:#087e78;background:#e5fbf8;border-radius:999px;padding:7px 9px;font-size:11px;font-weight:950}.fp-app-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.fp-app-tile{border:1px solid rgba(9,35,33,.1);background:#fbfffe;border-radius:15px;padding:10px}.fp-app-tile span{display:block;color:#687977;text-transform:uppercase;letter-spacing:.05em;font-size:9px;font-weight:950;margin-bottom:5px}.fp-app-tile strong{font-size:13px;letter-spacing:-.02em}.fp-device-caption{position:absolute;left:16px;bottom:18px;color:#071a18;font-size:12px;font-weight:850;z-index:1}.fp-device-caption strong{display:block;color:#071a18;font-size:14px;margin-bottom:2px}
        .fp-real-phone{width:min(328px,76vw);aspect-ratio:430/932;border-radius:52px;background:linear-gradient(135deg,#fafafa,#aeb7b5 38%,#ffffff 52%,#5f6966);padding:11px;position:relative;box-shadow:0 42px 92px rgba(0,0,0,.46),0 0 0 1px rgba(255,255,255,.42) inset;transform:rotate(-2deg);z-index:1}.fp-real-phone:before{content:"";position:absolute;inset:5px;border-radius:47px;border:1px solid rgba(255,255,255,.8);pointer-events:none}.fp-real-screen{height:100%;border-radius:41px;overflow:hidden;background:#fff;position:relative;border:1px solid rgba(9,35,33,.16)}.fp-real-screen img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}.fp-real-screen:after{content:"";position:absolute;inset:0;border-radius:40px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55);pointer-events:none}.fp-store-pill{display:inline-flex;align-items:center;gap:12px;padding:10px 14px 10px 12px;border-radius:16px;background:#071a18;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.14);box-shadow:0 16px 34px rgba(0,0,0,.24)}.fp-store-icon{width:34px;height:34px;border-radius:10px;background:#fff;color:#071a18;display:grid;place-items:center;font-size:21px;font-weight:900}.fp-store-copy{display:grid;gap:1px;line-height:1.05}.fp-store-copy span{color:rgba(255,255,255,.68);font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.06em}.fp-store-copy strong{color:#fff;font-size:15px;font-weight:950;letter-spacing:-.02em}.fp-hero-app-copy strong{color:#f7fffd}.fp-hero-app-copy span{color:rgba(255,255,255,.76)}
        .fp-sections{background:linear-gradient(#fff7ed 0%,#fff 38%,#f7fbfa 100%)}.fp-section{width:min(1120px,100% - 40px);margin:0 auto;padding:76px 0}.fp-section-heading{text-align:center;max-width:720px;margin:0 auto 34px}.fp-section-heading h2{letter-spacing:-.03em;color:var(--fp-ink);margin:0 0 12px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(30px,4.6vw,52px);line-height:1.04}.fp-section-heading p{color:var(--fp-muted);margin:0;font-size:17px;line-height:1.65}.fp-stats{border:1px solid var(--fp-line);background:var(--fp-line);border-radius:24px;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;display:grid;overflow:hidden;box-shadow:0 22px 60px rgba(9,35,33,.08)}.fp-stat{background:#fff;min-height:150px;padding:30px}.fp-stat strong{letter-spacing:-.03em;color:var(--fp-ink);margin-bottom:10px;font-size:clamp(30px,4vw,48px);line-height:1;display:block}.fp-stat span{color:var(--fp-muted);font-size:14px;font-weight:700;line-height:1.5}
        .fp-worldcup{border:1px solid rgba(9,35,33,.12);background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 22px 60px rgba(9,35,33,.08)}
        .fp-worldcup-head{background:#092321;color:#fff;padding:28px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:20px;align-items:end}.fp-worldcup-head h2{letter-spacing:-.03em;margin:0 0 10px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(28px,4vw,44px);line-height:1.05}.fp-worldcup-head p{color:rgba(255,255,255,.76);max-width:650px;margin:0;font-size:15px;line-height:1.65}.fp-worldcup-badge{color:#7df4ea;background:rgba(14,181,171,.14);border:1px solid rgba(125,244,234,.28);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap}
        .fp-worldcup-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1px;background:rgba(9,35,33,.1)}.fp-match{background:#fff;padding:22px;min-height:230px;display:flex;flex-direction:column;gap:14px}.fp-match-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.fp-match h3{color:var(--fp-ink);letter-spacing:-.02em;margin:0;font-size:21px;line-height:1.2}.fp-match-stage{color:#087e78;background:#e5fbf8;border-radius:999px;padding:7px 10px;font-size:12px;font-weight:900;white-space:nowrap}.fp-match-times{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.fp-time{background:#f7fbfa;border:1px solid rgba(9,35,33,.09);border-radius:14px;padding:11px}.fp-time span{color:var(--fp-muted);display:block;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}.fp-time strong{color:var(--fp-ink);font-size:13px;line-height:1.35;display:block}.fp-stadium{color:var(--fp-muted);font-size:14px;font-weight:750;line-height:1.5}.fp-stadium strong{color:var(--fp-ink);display:block;font-size:15px;margin-bottom:2px}.fp-restroom-link{margin-top:auto;color:#fff;background:#0eb5ab;border-radius:12px;padding:12px 14px;text-align:center;text-decoration:none;font-size:14px;font-weight:900;box-shadow:0 12px 24px rgba(14,181,171,.18)}.fp-worldcup-note{color:#60716f;background:#f7fbfa;border-top:1px solid rgba(9,35,33,.1);padding:16px 22px;font-size:13px;font-weight:700;line-height:1.55}
        .fp-feature-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;display:grid}.fp-feature{border:1px solid var(--fp-line);background:rgba(255,255,255,.86);border-radius:24px;min-height:280px;padding:24px;box-shadow:0 18px 45px rgba(9,35,33,.06)}.fp-feature-visual{background:linear-gradient(135deg,#e6fbf8,#fff1e9);border:1px solid rgba(9,35,33,.08);border-radius:18px;height:116px;margin-bottom:20px;padding:14px;position:relative;overflow:hidden}.fp-feature h3{color:var(--fp-ink);letter-spacing:-.02em;margin:0 0 10px;font-size:21px}.fp-feature p{color:var(--fp-muted);margin:0;font-size:15px;line-height:1.65}.fp-mini-line{background:rgba(9,35,33,.12);border-radius:999px;height:10px;margin-bottom:10px}.fp-mini-line.med{background:rgba(14,181,171,.22)}
        .fp-business{color:#fff;background:#092321;border-radius:28px;grid-template-columns:1fr .72fr;align-items:stretch;gap:26px;padding:34px;display:grid;position:relative;overflow:hidden}.fp-business h2{letter-spacing:-.03em;max-width:640px;margin:0 0 14px;font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(30px,4vw,50px);line-height:1.06}.fp-business p{color:rgba(255,255,255,.74);max-width:610px;margin:0 0 22px;font-size:16px;line-height:1.7}.fp-business-panel{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);border-radius:22px;padding:22px}.fp-footer{color:#fff;background:#071a18;padding:56px 24px 30px}.fp-footer-grid{grid-template-columns:1.25fr .8fr .8fr;gap:34px;width:min(1120px,100%);margin:0 auto 34px;display:grid}.fp-footer h3,.fp-footer h4{margin:0 0 14px}.fp-footer p{color:rgba(255,255,255,.68);margin:0;line-height:1.65}.fp-footer a{color:rgba(255,255,255,.72);margin-bottom:10px;font-size:14px;font-weight:700;text-decoration:none;display:block}.fp-footer-bottom{color:rgba(255,255,255,.45);border-top:1px solid rgba(255,255,255,.12);flex-wrap:wrap;justify-content:space-between;gap:16px;width:min(1120px,100%);margin:0 auto;padding-top:24px;font-size:13px;display:flex}
        .fp-nav{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.9);border-bottom:1px solid rgba(9,35,33,.08);backdrop-filter:blur(18px);padding:12px 20px}.fp-nav .fp-nav-shell{min-height:58px}.fp-nav-main{display:flex;align-items:center;gap:8px;padding:5px;border:1px solid rgba(9,35,33,.1);border-radius:16px;background:#fff;box-shadow:0 18px 45px rgba(9,35,33,.08)}.fp-nav-main .fp-nav-link{min-height:42px}.fp-nav-main .fp-nav-cta{min-height:42px;display:inline-flex;align-items:center}.fp-nav-tools{display:flex;align-items:center;gap:8px}.fp-lang-toggle{display:flex;background:#f3f7f6;border:1px solid rgba(9,35,33,.08);border-radius:14px;padding:4px}.fp-lang-toggle button{min-width:42px;min-height:34px;padding:0 10px;border-radius:10px;border:0;font-size:13px;font-weight:850;cursor:pointer}.fp-auth-buttons{display:flex;align-items:center;gap:8px}.fp-auth-ghost,.fp-auth-solid{min-height:42px;border-radius:13px;padding:0 16px;font-size:15px;font-weight:850;cursor:pointer;font-family:inherit}.fp-auth-ghost{background:#fff;color:#0A2E1F;border:1.5px solid #dce7e5}.fp-auth-solid{background:#0EB5AB;color:#fff;border:0;box-shadow:0 12px 24px rgba(14,181,171,.18)}.fp-user-pill{min-height:46px;box-shadow:0 12px 26px rgba(9,35,33,.06)}
        .fp-season-card{width:min(620px,100%);margin-top:16px;background:linear-gradient(135deg,rgba(255,255,255,.16),rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.24);border-radius:18px;padding:14px 16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;backdrop-filter:blur(16px);box-shadow:0 20px 52px rgba(0,0,0,.18)}.fp-season-kicker{color:#7df4ea;font-size:11px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;margin-bottom:4px}.fp-season-title{color:#fff;font-size:18px;font-weight:950;letter-spacing:-.02em;margin-bottom:3px}.fp-season-body{color:rgba(255,255,255,.78);font-size:13px;font-weight:700;line-height:1.45}.fp-season-action{color:#092321;background:#7df4ea;border-radius:999px;padding:10px 13px;text-decoration:none;font-size:13px;font-weight:950;white-space:nowrap}.fp-hero-app-row{display:flex;align-items:center;gap:12px;margin-top:18px;color:rgba(255,255,255,.72);font-size:13px;font-weight:800}.fp-hero-app-copy{display:flex;flex-direction:column;gap:2px}.fp-hero-app-copy strong{color:#fff;font-size:14px}.fp-hero-app-copy span{color:rgba(255,255,255,.68)}
        .fp-auth-overlay{position:fixed;inset:0;background:rgba(3,17,15,.72);backdrop-filter:blur(12px);z-index:100;display:flex;align-items:center;justify-content:center;padding:18px}.fp-auth-modal{background:#fff;border-radius:30px;width:min(920px,100%);max-height:92vh;overflow:hidden;display:grid;grid-template-columns:.92fr 1.08fr;box-shadow:0 32px 100px rgba(0,0,0,.34);border:1px solid rgba(255,255,255,.7)}.fp-auth-story{color:#fff;background:radial-gradient(circle at 20% 16%,rgba(125,244,234,.22),transparent 32%),linear-gradient(145deg,#092321,#0d3430);padding:30px;display:flex;flex-direction:column;justify-content:space-between;min-height:560px}.fp-auth-story h2{font-family:Sora,"Plus Jakarta Sans",system-ui,sans-serif;font-size:clamp(34px,4vw,48px);line-height:1.02;letter-spacing:-.04em;margin:20px 0 14px}.fp-auth-story p{color:rgba(255,255,255,.76);font-size:15px;line-height:1.65;margin:0}.fp-auth-proof{display:grid;gap:10px;margin-top:26px}.fp-auth-proof div{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.14);border-radius:16px;padding:14px;color:#d7fffb;font-size:13px;font-weight:850}.fp-auth-card{background:rgba(255,255,255,.94);border:1px solid rgba(255,255,255,.32);border-radius:22px;padding:18px;margin-top:26px;color:#092321;box-shadow:0 20px 46px rgba(0,0,0,.22)}.fp-auth-card strong{display:block;font-size:20px;letter-spacing:-.03em;margin-bottom:4px}.fp-auth-card span{color:#5d6f6d;font-size:13px;font-weight:750}.fp-auth-panel{overflow-y:auto}.fp-auth-head{padding:22px 24px 18px;border-bottom:1px solid #eef2f1;display:flex;align-items:center;justify-content:space-between;gap:18px}.fp-auth-close{width:38px;height:38px;border-radius:50%;border:1px solid #dfe8e6;background:#f7fbfa;color:#61716f;cursor:pointer;display:grid;place-items:center;font-size:24px;line-height:1;font-weight:400}.fp-auth-form{padding:26px 30px 30px}.fp-auth-kicker{margin:0 0 8px;color:#0EB5AB;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.fp-auth-title{margin:0;font-size:30px;line-height:1.08;letter-spacing:-.04em;font-weight:950;color:#092321}.fp-auth-sub{margin:10px 0 0;color:#5d6f6d;font-size:14px;line-height:1.55;font-weight:700}.fp-google-button{width:100%;background:#fff;color:#182725;border:1.5px solid #dce7e5;padding:14px 16px;border-radius:14px;font-size:15px;font-weight:850;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;box-shadow:0 8px 24px rgba(9,35,33,.06)}.fp-auth-rule{display:flex;align-items:center;gap:12px;margin:20px 0}.fp-auth-rule div{flex:1;height:1px;background:#eef2f1}.fp-auth-rule span{color:#7b8b89;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.08em}.fp-submit-button{background:#0EB5AB;color:white;border:0;padding:16px;border-radius:14px;font-size:17px;font-weight:950;cursor:pointer;box-shadow:0 14px 30px rgba(14,181,171,.24)}.fp-auth-switch{background:none;border:0;color:#0EB5AB;font-size:14px;font-weight:950;cursor:pointer;padding:0}
        .fp-nav-clean{background:#fff;border-bottom:1px solid rgba(9,35,33,.1);box-shadow:0 1px 0 rgba(9,35,33,.03);padding:0}.fp-topbar{display:grid;grid-template-columns:auto minmax(360px,1fr) auto auto;align-items:center;gap:18px;width:min(1220px,100%);min-height:82px;margin:0 auto;padding:14px 24px}.fp-nav-search{height:50px;display:grid;grid-template-columns:minmax(180px,1fr) minmax(130px,190px) 58px;align-items:center;border:1px solid rgba(9,35,33,.14);border-radius:10px;background:#fff;box-shadow:0 12px 30px rgba(9,35,33,.09);overflow:hidden}.fp-nav-search input{height:100%;min-width:0;border:0;outline:0;padding:0 16px;color:#182725;font:700 15px "Plus Jakarta Sans",system-ui,sans-serif}.fp-nav-search input::placeholder{color:#7b8785;font-weight:650}.fp-nav-location{height:100%;display:flex;align-items:center;padding:0 16px;border-left:1px solid rgba(9,35,33,.1);color:#253937;font-size:15px;font-weight:800;white-space:nowrap}.fp-nav-search button{height:100%;border:0;background:#0eb5ab;color:#fff;cursor:pointer;font-size:20px;font-weight:950}.fp-nav-actions{display:flex;align-items:center;gap:14px;white-space:nowrap}.fp-nav-actions a{color:#263b39;text-decoration:none;font-size:14px;font-weight:900}.fp-nav-actions a:hover{color:#087e78}.fp-auth-text{border:0;background:transparent;color:#263b39;cursor:pointer;font:900 14px "Plus Jakarta Sans",system-ui,sans-serif;padding:8px 2px}.fp-auth-join{border:1.5px solid #0eb5ab;background:#0eb5ab;color:#fff;cursor:pointer;border-radius:9px;padding:10px 14px;font:950 14px "Plus Jakarta Sans",system-ui,sans-serif;box-shadow:0 10px 22px rgba(14,181,171,.18)}.fp-clean-user{display:flex;align-items:center;gap:9px;border:1px solid rgba(9,35,33,.1);border-radius:999px;padding:4px 5px 4px 4px;background:#f8fbfa}.fp-clean-user span{max-width:96px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#0A2E1F;font-size:14px;font-weight:900}.fp-clean-user button{background:#fff;border:1px solid rgba(9,35,33,.1);border-radius:999px;padding:8px 12px;color:#5a6765;cursor:pointer;font-weight:900}.fp-category-row{border-top:1px solid rgba(9,35,33,.07)}.fp-category-row-inner{width:min(1220px,100%);margin:0 auto;padding:0 24px;display:flex;align-items:center;gap:30px;min-height:46px}.fp-category-row a{color:#3d504e;text-decoration:none;font-size:14px;font-weight:850}.fp-category-row a:first-child{color:#087e78}.fp-category-row a:hover{color:#0eb5ab}.fp-mobile-search{display:none}
        .fp-mobile-drawer{border:1px solid rgba(9,35,33,.1);margin-top:12px;padding:12px;display:flex;flex-direction:column;gap:10px;border-radius:22px;background:rgba(255,255,255,.98);box-shadow:0 20px 54px rgba(9,35,33,.16)}.fp-mobile-primary{display:grid;grid-template-columns:1fr 1fr;gap:9px}.fp-mobile-primary a,.fp-mobile-primary button{min-height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:14px;font-weight:900;text-decoration:none;border:0;font-family:inherit}.fp-mobile-find{grid-column:1/-1;background:#092321;color:#fff}.fp-mobile-event{background:#effaf8;color:#087e78}.fp-mobile-business{background:#fff;border:1px solid rgba(9,35,33,.12)!important;color:#425755}.fp-mobile-account{display:grid;grid-template-columns:1fr 1fr;gap:9px}.fp-mobile-account button{min-height:43px;border-radius:12px;font-size:14px;font-weight:850;font-family:inherit}.fp-mobile-utility{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:4px 0 0}.fp-mobile-lang{display:flex;background:#f5f5f5;border-radius:10px;padding:3px}.fp-mobile-lang button{padding:7px 10px;border-radius:8px;border:0;font-size:12px;font-weight:800}.fp-mobile-user{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid rgba(9,35,33,.1);border-radius:14px;background:#f8fbfa}.fp-mobile-user span{font-size:14px;font-weight:850;color:#0A2E1F;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fp-mobile-signout{margin-left:auto;background:#fff;border:1px solid rgba(9,35,33,.1);border-radius:999px;padding:8px 12px;color:#555;font-weight:850}
        @media (max-width:1040px){.fp-topbar{grid-template-columns:auto minmax(280px,1fr) auto}.fp-nav-actions{display:none}.fp-nav-search{grid-template-columns:minmax(160px,1fr) minmax(118px,160px) 54px}.mobile-menu-btn{display:grid!important;place-items:center;width:42px;height:42px;border:1px solid rgba(9,35,33,.1)!important;border-radius:14px!important;background:#f8fbfa!important}}@media (max-width:900px){.fp-hero{min-height:auto;padding:58px 20px}.fp-hero-shell,.fp-business,.fp-footer-grid,.fp-worldcup-list,.fp-worldcup-head{grid-template-columns:1fr}.fp-device-stage{justify-self:center;width:min(420px,100%)}.fp-feature-grid,.fp-stats{grid-template-columns:1fr}.fp-worldcup-badge{justify-self:start}.fp-auth-modal{grid-template-columns:1fr;width:min(520px,100%)}.fp-auth-story{display:none}.fp-auth-panel{max-height:92vh}}@media (max-width:760px){.desktop-nav{display:none!important}.fp-topbar{grid-template-columns:auto auto;gap:12px;padding:12px 16px;min-height:68px}.fp-nav-shell{gap:12px}.fp-topbar img,.fp-nav-shell img{max-height:40px;width:auto}.fp-nav-search{display:none}.fp-category-row{display:none}.fp-mobile-search{display:grid;grid-template-columns:1fr 46px;border:1px solid rgba(9,35,33,.14);border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 10px 26px rgba(9,35,33,.08)}.fp-mobile-search input{min-height:46px;border:0;outline:0;padding:0 13px;color:#182725;font-size:15px;font-weight:750}.fp-mobile-search button{border:0;background:#0eb5ab;color:#fff;font-size:18px;font-weight:950}.fp-hero{padding:36px 18px 34px;overflow:hidden}.fp-hero-shell{width:100%;gap:0}.fp-hero-copy{width:100%;min-width:0;max-width:100%}.fp-eyebrow{font-size:11px;max-width:100%;white-space:normal}.fp-hero-title{font-size:clamp(34px,10.2vw,43px);line-height:1.02;letter-spacing:-.025em;max-width:100%;overflow-wrap:normal}.fp-hero-title span{display:inline}.fp-hero-text{max-width:100%;margin-bottom:22px;font-size:16px;line-height:1.5}.fp-device-stage{display:none!important}.fp-search{width:100%;max-width:100%;flex-direction:column;border-radius:18px;padding:7px}.fp-search input{font-size:15px;padding:15px 14px}.fp-search button{min-height:50px;width:100%;padding:0 16px}.fp-season-card{grid-template-columns:1fr}.fp-season-action{justify-self:start}.fp-hero-app-row{align-items:flex-start}.fp-event-strip{width:100%;max-width:100%;overflow:hidden}.fp-home-event-card{min-width:206px}.fp-cta-row{gap:10px}.fp-primary,.fp-secondary{min-height:46px;padding:12px 18px}.fp-section{width:min(100% - 28px,1120px);padding:58px 0}.fp-business,.fp-worldcup-head{padding:24px}.fp-match-times{grid-template-columns:1fr}.fp-auth-form{padding:24px 22px 26px}.fp-auth-head{padding:18px 20px}.fp-auth-title{font-size:27px}}@media (max-width:390px){.fp-hero-title{font-size:38px}.fp-hero{padding-left:16px;padding-right:16px}.fp-home-event-card{min-width:198px}.fp-mobile-utility{align-items:flex-start;flex-direction:column}.fp-mobile-utility a{align-self:flex-start}}
      `}</style>

      <nav className="fp-nav fp-nav-clean">
        <div className="fp-topbar">
          <Logo height={58} />
          <div className="fp-nav-search" role="search" aria-label="Find restroom access">
            <input type="text" placeholder="Search restroom, cafe, store, or place" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
            <div className="fp-nav-location">Irvine, CA</div>
            <button aria-label="Search" onClick={handleSearch}>⌕</button>
          </div>
          <div className="fp-nav-actions" aria-label="Account and business links">
            <a href="/business">{t.forBusinesses}</a>
            {user ? (
              <div className="fp-clean-user">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: profileColor, flexShrink: 0 }} />
                <span>{displayName}</span>
                <button onClick={handleSignOut}>{t.signOut}</button>
              </div>
            ) : (
              <>
                <button className="fp-auth-text" onClick={() => { setShowAuth(true); setAuthMode('signin'); setMessage('') }}>{t.signIn}</button>
                <button className="fp-auth-join" onClick={() => { setShowAuth(true); setAuthMode('signup'); setMessage('') }}>{t.signUp}</button>
              </>
            )}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'none' }} className="mobile-menu-btn">
            <div style={{ width: '24px', height: '2px', background: '#0A2E1F', marginBottom: '6px', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '2px', background: '#0A2E1F', marginBottom: '6px', borderRadius: '2px' }} />
            <div style={{ width: '24px', height: '2px', background: '#0A2E1F', borderRadius: '2px' }} />
          </button>
        </div>
        <div className="fp-category-row" aria-label="Explore FlushPin">
          <div className="fp-category-row-inner">
            <a href="/map">Restroom Map</a>
            <a href="/map?q=access%20code">Access Codes</a>
            <a href="/events">Events</a>
            <a href="/business">For Businesses</a>
          </div>
        </div>
        {menuOpen && (
          <div className="fp-mobile-drawer">
            <div className="fp-mobile-search" role="search" aria-label="Find restroom access">
              <input type="text" placeholder="Search restroom access" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
              <button aria-label="Search" onClick={handleSearch}>⌕</button>
            </div>
            <div className="fp-mobile-primary">
              <a className="fp-mobile-find" href="/map" onClick={() => setMenuOpen(false)}>{t.findRestroom}</a>
              <a className="fp-mobile-event" href="/events" onClick={() => setMenuOpen(false)}>🎟️ Events</a>
              <a className="fp-mobile-business" href="/business" onClick={() => setMenuOpen(false)}>{t.forBusinesses}</a>
            </div>
            {user ? (
              <div className="fp-mobile-user">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: profileColor, flexShrink: 0 }} />
                <span>{displayName}</span>
                <button className="fp-mobile-signout" onClick={handleSignOut}>{t.signOut}</button>
              </div>
            ) : (
              <div className="fp-mobile-account">
                <button onClick={() => { setShowAuth(true); setAuthMode('signin'); setMessage(''); setMenuOpen(false) }} style={{ background: 'white', color: '#0A2E1F', border: '1.5px solid #e0e0e0' }}>{t.signIn}</button>
                <button onClick={() => { setShowAuth(true); setAuthMode('signup'); setMessage(''); setMenuOpen(false) }} style={{ background: '#0EB5AB', color: 'white', border: 'none' }}>{t.signUp}</button>
              </div>
            )}
            <div className="fp-mobile-utility">
              <div className="fp-mobile-lang">
                <button onClick={() => setLang('en')} style={{ cursor: 'pointer', background: lang === 'en' ? 'white' : 'transparent', color: lang === 'en' ? '#0A2E1F' : '#999' }}>🇺🇸 EN</button>
                <button onClick={() => setLang('es')} style={{ cursor: 'pointer', background: lang === 'es' ? 'white' : 'transparent', color: lang === 'es' ? '#0A2E1F' : '#999' }}>🇲🇽 ES</button>
              </div>
              <a className="fp-store-pill" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download FlushPin on the App Store">
                <span className="fp-store-icon"></span>
                <span className="fp-store-copy"><span>Available on</span><strong>App Store</strong></span>
              </a>
            </div>
          </div>
        )}
      </nav>

      <section className="fp-hero">
        <div className="fp-hero-shell">
          <div className="fp-hero-copy">
            <div className="fp-eyebrow"><span />{t.badge}</div>
            <h1 className="fp-hero-title">{t.home.heroTitleMain} <span>{t.home.heroTitleAccent}</span></h1>
            <p className="fp-hero-text">{t.home.heroDesc}</p>
            {seasonalMessage && (
              <div className="fp-season-card">
                <div>
                  <div className="fp-season-kicker">{seasonalMessage.label}</div>
                  <div className="fp-season-title">{seasonalMessage.title}</div>
                  <div className="fp-season-body">{seasonalMessage.body}</div>
                </div>
                <a className="fp-season-action" href="/map">{seasonalMessage.action}</a>
              </div>
            )}
            {homeEvents.length > 0 && (
              <div className="fp-event-strip">
                <div className="fp-event-strip-head">
                  <div className="fp-event-strip-title">🎟️ Events Near You</div>
                  <a className="fp-event-strip-link" href="/events">See all events →</a>
                </div>
                <div className="fp-event-scroll">
                  {homeEvents.map(event => (
                    <a className="fp-home-event-card" href="/events" key={event.id}>
                      <span className="fp-home-event-icon">{getHomeEventIcon(event.name)}</span>
                      <span>
                        <span className="fp-home-event-name">{event.name.length > 20 ? `${event.name.slice(0, 20)}…` : event.name}</span>
                        <span className="fp-home-event-meta">{getHomeEventCity(event.venue.address)} · {formatHomeEventDate(event.date)}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
            <div className="fp-cta-row">
              <a className="fp-primary" href="/map">{t.findBtn}</a>
              {!user && <button className="fp-secondary" onClick={() => { setShowAuth(true); setAuthMode('signup') }} style={{ cursor: 'pointer' }}>{t.joinFree}</button>}
            </div>
            <div className="fp-hero-app-row">
              <a className="fp-store-pill" href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" aria-label="Download FlushPin on the App Store">
                <span className="fp-store-icon"></span>
                <span className="fp-store-copy"><span>Available on</span><strong>App Store</strong></span>
              </a>
              <div className="fp-hero-app-copy">
                <strong>FlushPin is live on iPhone</strong>
                <span>Real app screen, access notes, and nearby restroom guidance.</span>
              </div>
            </div>
            <div className="fp-hero-proof">
              <span className="fp-proof-pill">{t.home.proofAccess}</span>
              <span className="fp-proof-pill">{t.home.proofBuilt}</span>
              <span className="fp-proof-pill">Live web map</span>
            </div>
          </div>
          <div className="fp-device-stage" aria-label="FlushPin iPhone app preview">
            <div className="fp-real-phone">
              <div className="fp-real-screen">
                <img src="/flushpin-app-home-screen.png" alt="FlushPin iPhone app home screen" />
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
        {visibleWorldCupMatches.length > 0 && (
          <section className="fp-section" style={{ paddingTop: 0 }}>
            <div className="fp-worldcup">
              <div className="fp-worldcup-head">
                <div>
                  <h2>California World Cup restroom guide</h2>
                  <p>Match-day restroom help for California games only. See Pacific and Eastern times, the host city, and a direct FlushPin search for restroom access around the stadium.</p>
                </div>
                <span className="fp-worldcup-badge">California only</span>
              </div>
              <div className="fp-worldcup-list">
                {visibleWorldCupMatches.map(match => (
                  <article className="fp-match" key={`${match.date}-${match.stadium}-${match.matchup}`}>
                    <div className="fp-match-top">
                      <h3>{match.matchup}</h3>
                      <span className="fp-match-stage">{match.stage}</span>
                    </div>
                    <div className="fp-match-times">
                      <div className="fp-time">
                        <span>Pacific</span>
                        <strong>{formatMatchTime(match.date, 'America/Los_Angeles')}</strong>
                      </div>
                      <div className="fp-time">
                        <span>Eastern</span>
                        <strong>{formatMatchTime(match.date, 'America/New_York')}</strong>
                      </div>
                    </div>
                    <div className="fp-stadium">
                      <strong>{match.stadium}</strong>
                      {match.city}
                    </div>
                    <a className="fp-restroom-link" href={`/map?q=${encodeURIComponent(match.restroomSearch)}&lat=${match.lat}&lng=${match.lng}&label=${encodeURIComponent(match.mapLabel)}&event=worldcup-ca`}>
                      Restrooms near this stadium
                    </a>
                  </article>
                ))}
              </div>
              <div className="fp-worldcup-note">This guide is intentionally limited to California matches and will disappear after the final California match window passes.</div>
            </div>
          </section>
        )}
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
        <div
          onClick={() => { setShowAuth(false); setMessage('') }}
          className="fp-auth-overlay"
        >
          <div onClick={e => e.stopPropagation()} className="fp-auth-modal">
            <aside className="fp-auth-story">
              <div>
                <Logo height={38} />
                <h2>{authMode === 'signup' ? 'Join the access map people actually use.' : 'Welcome back to the map.'}</h2>
                <p>{authMode === 'signup' ? 'Save time, share respectful access updates, and help the next person make a faster choice.' : 'Pick up where you left off with community notes, access confirmations, and nearby restroom intelligence.'}</p>
                <div className="fp-auth-proof">
                  <div>Access notes for codes, staff keys, customer policies, and open restrooms.</div>
                  <div>Your updates help keep FlushPin accurate for everyone nearby.</div>
                  <div>Built for quick, respectful decisions in real-world moments.</div>
                </div>
              </div>
              <div className="fp-auth-card">
                <strong>Community-powered</strong>
                <span>Every confirmation makes the next urgent search less stressful.</span>
              </div>
            </aside>

            <div className="fp-auth-panel">
              <div className="fp-auth-head">
                <Logo height={34} />
                <button
                  aria-label={t.home.close}
                  onClick={() => { setShowAuth(false); setMessage('') }}
                  className="fp-auth-close"
                >
                  ×
                </button>
              </div>

              <div className="fp-auth-form">
                <div style={{ marginBottom: 22 }}>
                  <p className="fp-auth-kicker">FlushPin account</p>
                  <h2 className="fp-auth-title">{authMode === 'signup' ? t.joinFlushPin : t.welcomeBack}</h2>
                  <p className="fp-auth-sub">{authMode === 'signup' ? 'Create a free account to contribute access notes and personalize your profile.' : 'Sign in to keep helping the community with accurate restroom access updates.'}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <button onClick={() => handleOAuthSignIn('google')} className="fp-google-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    {t.continueGoogle}
                  </button>
                </div>

                <div className="fp-auth-rule">
                  <div />
                  <span>or use email</span>
                  <div />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {authMode === 'signup' && (
                    <>
                      <div><label style={labelStyle}>{t.fullName}</label><input style={inputStyle} placeholder="Jane Smith" value={fullName} onChange={e => setFullName(e.target.value)} /></div>
                      <div>
                        <label style={labelStyle}>{t.home.profileColor}</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {COLOR_OPTIONS.map(color => <div key={color} onClick={() => setSelectedColor(color)} style={{ width: 30, height: 30, borderRadius: '50%', background: color, cursor: 'pointer', border: selectedColor === color ? '3px solid #0A2E1F' : '3px solid transparent', boxShadow: selectedColor === color ? '0 0 0 3px rgba(14,181,171,.18)' : 'none' }} />)}
                        </div>
                      </div>
                    </>
                  )}
                  <div><label style={labelStyle}>{t.email}</label><input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
                  <div><label style={labelStyle}>{t.password}</label><input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} /></div>
                  {message && <p style={{ fontSize: '14px', color: message.includes('Check') ? '#087f68' : '#B91C1C', background: message.includes('Check') ? '#E6FFFA' : '#FEF2F2', border: `1px solid ${message.includes('Check') ? '#B6F4E8' : '#FECACA'}`, borderRadius: 12, padding: '10px 12px', margin: 0, fontWeight: 800 }}>{message}</p>}
                  <button onClick={authMode === 'signup' ? handleSignUp : handleSignIn} disabled={loading} className="fp-submit-button" style={{ opacity: loading ? 0.7 : 1 }}>{loading ? '...' : (authMode === 'signup' ? t.createAccount : t.signIn)}</button>
                  <button onClick={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setMessage('') }} className="fp-auth-switch">{authMode === 'signup' ? t.home.alreadyHaveAccount : t.home.needAccount}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
