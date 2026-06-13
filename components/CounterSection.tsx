'use client'
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../lib/LanguageContext'

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(tick)
          else setCount(target)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

type Stats = { accessIntel: number; venues: number; cities: number; cityList?: string[] }

export default function CounterSection() {
  const { lang } = useLang()
  const [stats, setStats] = useState<Stats>({ accessIntel: 0, venues: 0, cities: 0 })
  const [loaded, setLoaded] = useState(false)
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then((d: Stats) => { setStats(d); setLoaded(true) })
      .catch(() => setLoaded(true))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1400)
    return () => clearInterval(interval)
  }, [])

  const { count: accessIntel, ref } = useCountUp(stats.accessIntel)
  const { count: venues, ref: ref2 } = useCountUp(stats.venues)
  const { count: cities, ref: ref3 } = useCountUp(stats.cities)

  const labels = lang === 'es'
    ? {
        live: 'EN VIVO · CALIFORNIA',
        access: 'puntos de inteligencia de acceso',
        accessSub: 'información comunitaria activa',
        venues: 'lugares en el mapa',
        venuesSub: 'cafés, restaurantes y más',
        cities: 'ciudades cubiertas',
        citiesSub: 'en California',
        quote: '"Por fin no tengo que preguntarle al barista." — Usuario de FlushPin',
        loading: 'Cargando estadísticas en vivo…',
      }
    : {
        live: 'LIVE · CALIFORNIA',
        access: 'access intelligence points',
        accessSub: 'active community guidance',
        venues: 'venues mapped',
        venuesSub: 'cafes, restaurants & more',
        cities: 'cities covered',
        citiesSub: 'across California',
        quote: '"Finally, I don\'t have to ask the barista anymore." — FlushPin user, California',
        loading: 'Loading live stats…',
      }

  return (
    <section style={{ padding: '0 40px 70px', maxWidth: '920px', margin: '0 auto' }}>
      <div style={{ background: 'linear-gradient(135deg,#0A2E1F 0%,#1a4a32 100%)', borderRadius: '20px', padding: '40px 32px', position: 'relative', overflow: 'hidden' }}>

        <div style={{ position: 'absolute', inset: 0, opacity: 0.06 }}>
          {[...Array(24)].map((_, i) => (
            <div key={i} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: 'white', left: `${(i % 6) * 20 + 5}%`, top: `${Math.floor(i / 6) * 28 + 10}%` }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(29,158,117,0.2)', border: '1px solid rgba(29,158,117,0.4)', borderRadius: '20px', padding: '6px 16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1D9E75', boxShadow: pulse ? '0 0 0 4px rgba(29,158,117,0.3)' : '0 0 0 0px rgba(29,158,117,0)', transition: 'box-shadow 0.7s ease' }} />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#5DCAA5', letterSpacing: '0.5px' }}>{labels.live}</span>
          </div>
        </div>

        {!loaded ? (
          <p style={{ textAlign: 'center', color: '#5DCAA5', fontSize: '14px', margin: '0 0 24px' }}>{labels.loading}</p>
        ) : null}

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '32px' }}>
          <div ref={ref} style={{ textAlign: 'center', flex: '1', minWidth: '160px' }}>
            <div style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: '48px', fontWeight: '700', color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
              {accessIntel.toLocaleString()}{stats.accessIntel > 0 ? <span style={{ color: '#1D9E75', fontSize: '36px' }}>+</span> : null}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#9FE1CB', marginTop: '8px' }}>{labels.access}</div>
            <div style={{ fontSize: '12px', color: '#5DCAA5', marginTop: '4px' }}>{labels.accessSub}</div>
          </div>

          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '0 8px' }} />

          <div ref={ref2} style={{ textAlign: 'center', flex: '1', minWidth: '160px' }}>
            <div style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: '48px', fontWeight: '700', color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
              {venues.toLocaleString()}{stats.venues > 0 ? <span style={{ color: '#1D9E75', fontSize: '36px' }}>+</span> : null}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#9FE1CB', marginTop: '8px' }}>{labels.venues}</div>
            <div style={{ fontSize: '12px', color: '#5DCAA5', marginTop: '4px' }}>{labels.venuesSub}</div>
          </div>

          <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'stretch', margin: '0 8px' }} />

          <div ref={ref3} style={{ textAlign: 'center', flex: '1', minWidth: '160px' }}>
            <div style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: '48px', fontWeight: '700', color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
              {cities.toLocaleString()}{stats.cities > 0 ? <span style={{ color: '#1D9E75', fontSize: '36px' }}>+</span> : null}
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#9FE1CB', marginTop: '8px' }}>{labels.cities}</div>
            <div style={{ fontSize: '12px', color: '#5DCAA5', marginTop: '4px' }}>{labels.citiesSub}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#5DCAA5', margin: 0, fontStyle: 'italic' }}>{labels.quote}</p>
        </div>

      </div>
    </section>
  )
}
