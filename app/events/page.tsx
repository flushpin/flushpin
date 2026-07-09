'use client'

import { useEffect, useState } from 'react'

type EventItem = {
  id: string
  name: string
  date: string
  time: string
  venue: { name: string; address: string; lat: number | null; lng: number | null }
  imageUrl: string
}

function eventIcon(eventName: string) {
  const name = eventName.toLowerCase()
  if (/concert|music|band|tour|live|festival|dj/.test(name)) return '♪'
  if (/fc|soccer|football|basketball|baseball|hockey|nfl|nba|mlb|nhl|match|game/.test(name)) return '●'
  return '◆'
}

function formatDateTime(date: string, time: string) {
  if (!date) return 'Date TBA'
  const value = new Date(`${date}T${time || '00:00:00'}`)
  if (Number.isNaN(value.getTime())) return [date, time].filter(Boolean).join(' · ')
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: time ? 'numeric' : undefined,
    minute: time ? '2-digit' : undefined,
  }).format(value)
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Finding events near you...')

  useEffect(() => {
    const loadEvents = async (lat: number, lng: number) => {
      setLoading(true)
      setMessage('Finding events near you...')
      try {
        const res = await fetch(`/api/events?lat=${lat}&lng=${lng}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load events.')
        setEvents(data.events || [])
        setMessage('')
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Could not load events.')
      } finally {
        setLoading(false)
      }
    }

    if (!navigator.geolocation) {
      loadEvents(33.6846, -117.7892)
      return
    }

    navigator.geolocation.getCurrentPosition(
      position => loadEvents(position.coords.latitude, position.coords.longitude),
      () => loadEvents(33.6846, -117.7892),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    )
  }, [])

  return (
    <main className="fp-events">
      <style>{`
        .fp-events{min-height:100vh;background:#f6fbfa;color:#0b1f1d;font-family:Inter,"Plus Jakarta Sans",system-ui,sans-serif}
        .fp-events *{box-sizing:border-box}
        .fp-events-header{background:#0B1F1D;color:white;padding:18px 22px 58px}
        .fp-events-nav{width:min(1120px,100%);margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:18px}
        .fp-events-nav a{color:rgba(255,255,255,.78);font-size:14px;font-weight:800;text-decoration:none}
        .fp-events-hero{width:min(1120px,100%);margin:54px auto 0}
        .fp-events-kicker{color:#7df4ea;font-size:13px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
        .fp-events h1{max-width:760px;margin:14px 0 14px;font-size:clamp(38px,6vw,68px);line-height:.98;letter-spacing:-.045em}
        .fp-events-hero p{max-width:640px;margin:0;color:rgba(255,255,255,.74);font-size:18px;line-height:1.65}
        .fp-events-wrap{width:min(1120px,calc(100% - 36px));margin:-28px auto 0;padding-bottom:70px}
        .fp-events-status{background:white;border:1px solid rgba(11,31,29,.1);border-radius:16px;padding:18px 20px;color:#5d6f6d;font-weight:800;box-shadow:0 18px 45px rgba(11,31,29,.08)}
        .fp-events-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
        .fp-event-card{overflow:hidden;background:white;border:1px solid rgba(11,31,29,.1);border-radius:20px;box-shadow:0 20px 50px rgba(11,31,29,.09)}
        .fp-event-image{height:190px;background:linear-gradient(135deg,#0B1F1D,#0EB5AB);background-size:cover;background-position:center}
        .fp-event-body{padding:20px}
        .fp-event-top{display:flex;align-items:flex-start;gap:12px}
        .fp-event-icon{width:38px;height:38px;border-radius:12px;background:#e5fbf8;color:#0EB5AB;display:grid;place-items:center;font-size:20px;font-weight:900;flex:0 0 auto}
        .fp-event-card h2{margin:0;color:#0b1f1d;font-size:21px;line-height:1.2;letter-spacing:-.02em}
        .fp-event-meta{margin:12px 0 0;color:#5d6f6d;font-size:14px;font-weight:800;line-height:1.55}
        .fp-event-address{margin-top:6px;color:#6f7f7d;font-size:13px;line-height:1.45}
        .fp-event-button{display:inline-flex;align-items:center;justify-content:center;margin-top:18px;min-height:44px;padding:12px 16px;border-radius:12px;background:#0EB5AB;color:white;font-size:14px;font-weight:900;text-decoration:none;box-shadow:0 12px 24px rgba(14,181,171,.2)}
        .fp-event-button[aria-disabled="true"]{background:#d7e3e1;color:#6d7b79;pointer-events:none;box-shadow:none}
        .fp-events-nav-links{display:flex;align-items:center;gap:8px;padding:6px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.08);backdrop-filter:blur(12px)}
        .fp-events-nav-links a{min-height:40px;display:inline-flex;align-items:center;padding:0 12px;border-radius:10px;color:rgba(255,255,255,.82);text-decoration:none;font-weight:850;font-size:14px;white-space:nowrap}.fp-events-nav-links a:hover{color:#7df4ea}.fp-events-nav-links .fp-events-nav-cta{background:#0EB5AB;color:white}.fp-events-nav-links .fp-events-nav-divider{width:1px;height:26px;background:rgba(255,255,255,.2)}
        @media(max-width:760px){.fp-events-grid{grid-template-columns:1fr}.fp-events-header{padding:18px 16px 48px}.fp-events-nav{gap:14px}.fp-events h1{font-size:42px}.fp-event-image{height:160px}.fp-events-nav-links{max-width:100%;overflow-x:auto;scrollbar-width:none;padding:5px;gap:6px}.fp-events-nav-links::-webkit-scrollbar{display:none}.fp-events-nav-links a{font-size:13px;min-height:38px;padding:0 10px}.fp-events-nav-links .fp-events-nav-divider{display:none}}
      `}</style>

      <header className="fp-events-header">
        <section className="fp-events-hero">
          <div className="fp-events-kicker">Events Near You</div>
          <h1>Find restrooms before the crowd does.</h1>
          <p>Concerts, games, festivals, and arena nights create restroom pressure. Pick an event and open FlushPin around that venue.</p>
        </section>
      </header>

      <section className="fp-events-wrap">
        {loading || message ? <div className="fp-events-status">{message}</div> : null}
        {!loading && !message && events.length === 0 ? (
          <div className="fp-events-status">No nearby events found right now.</div>
        ) : null}
        <div className="fp-events-grid">
          {events.map(event => {
            const nearLabel = [event.venue.address?.split(',').slice(-2).join(', ').trim(), event.venue.name]
              .filter(Boolean)
              .find(part => part && part !== 'Venue TBA') || event.venue.name
            const restroomHref = event.venue.lat && event.venue.lng
              ? `/map?lat=${event.venue.lat}&lng=${event.venue.lng}&q=${encodeURIComponent(event.venue.name)}&near=${encodeURIComponent(nearLabel)}`
              : '#'

            return (
              <article className="fp-event-card" key={event.id}>
                <div className="fp-event-image" style={event.imageUrl ? { backgroundImage: `linear-gradient(rgba(11,31,29,.18), rgba(11,31,29,.18)), url(${event.imageUrl})` } : undefined} />
                <div className="fp-event-body">
                  <div className="fp-event-top">
                    <div className="fp-event-icon">{eventIcon(event.name)}</div>
                    <div>
                      <h2>{event.name}</h2>
                      <div className="fp-event-meta">{formatDateTime(event.date, event.time)} · {event.venue.name}</div>
                      {event.venue.address ? <div className="fp-event-address">{event.venue.address}</div> : null}
                    </div>
                  </div>
                  <a className="fp-event-button" href={restroomHref} aria-disabled={restroomHref === '#' ? 'true' : undefined}>Find Restrooms</a>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
