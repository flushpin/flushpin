'use client'
import { useState, useEffect, useRef } from 'react'
import { useLang } from '../lib/LanguageContext'

const FALLBACK_STATS = { venues: 69795, cities: 251 }

async function fetchLiveStats(): Promise<{ venues: number; cities: number }> {
  const res = await fetch('/api/stats')
  if (!res.ok) throw new Error('Stats fetch failed')
  const data = await res.json()
  return { venues: data.venues, cities: data.cities }
}

function useCountUp(target: number, duration: number = 2000, enabled: boolean = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    started.current = false
    setCount(0)
  }, [target, enabled])

  useEffect(() => {
    if (!enabled) return
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
  }, [target, duration, enabled])

  return { count, ref }
}

export default function CounterSection() {
  const { t } = useLang()
  const [stats, setStats] = useState(FALLBACK_STATS)
  const [loading, setLoading] = useState(true)
  const [pulse, setPulse] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchLiveStats()
      .then((live) => {
        if (!cancelled) setStats(live)
      })
      .catch(() => {
        if (!cancelled) setStats(FALLBACK_STATS)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1400)
    return () => clearInterval(interval)
  }, [])

  const { count: venues, ref: venuesRef } = useCountUp(stats.venues, 2000, !loading)
  const { count: cities, ref: citiesRef } = useCountUp(stats.cities, 2000, !loading)

  const renderValue = (value: number) => {
    if (loading) {
      return (
        <span style={{ fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: '48px', fontWeight: '700', color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
          ...
        </span>
      )
    }
    return (
      <>
        {value.toLocaleString()}
        <span style={{ color: '#1D9E75', fontSize: '36px' }}>+</span>
      </>
    )
  }

  return (
    <section style={{padding:'0 40px 70px',maxWidth:'920px',margin:'0 auto'}}>
      <div style={{background:'linear-gradient(135deg,#0A2E1F 0%,#1a4a32 100%)',borderRadius:'20px',padding:'40px 32px',position:'relative',overflow:'hidden'}}>

        <div style={{position:'absolute',inset:0,opacity:0.06}}>
          {[...Array(24)].map((_,i)=>(
            <div key={i} style={{position:'absolute',width:'6px',height:'6px',borderRadius:'50%',background:'white',left:`${(i%6)*20+5}%`,top:`${Math.floor(i/6)*28+10}%`}}/>
          ))}
        </div>

        <div style={{display:'flex',justifyContent:'center',marginBottom:'28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'8px',background:'rgba(29,158,117,0.2)',border:'1px solid rgba(29,158,117,0.4)',borderRadius:'20px',padding:'6px 16px'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'#1D9E75',boxShadow:pulse?'0 0 0 4px rgba(29,158,117,0.3)':'0 0 0 0px rgba(29,158,117,0)',transition:'box-shadow 0.7s ease'}}/>
            <span style={{fontSize:'12px',fontWeight:'700',color:'#5DCAA5',letterSpacing:'0.5px'}}>LIVE · CALIFORNIA</span>
          </div>
        </div>

        <div style={{display:'flex',gap:'16px',justifyContent:'center',alignItems:'stretch',maxWidth:'520px',margin:'0 auto 32px',width:'100%'}}>
          <div ref={venuesRef} style={{textAlign:'center',flex:'1',minWidth:'160px'}}>
            <div style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'48px',fontWeight:'700',color:'white',letterSpacing:'-2px',lineHeight:1}}>
              {renderValue(venues)}
            </div>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#9FE1CB',marginTop:'8px'}}>{t.stats.venuesTitle}</div>
            <div style={{fontSize:'12px',color:'#5DCAA5',marginTop:'4px'}}>{t.stats.venuesSub}</div>
          </div>

          <div style={{width:'1px',background:'rgba(255,255,255,0.1)',alignSelf:'stretch',margin:'0 8px',flexShrink:0}}/>

          <div ref={citiesRef} style={{textAlign:'center',flex:'1',minWidth:'160px'}}>
            <div style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'48px',fontWeight:'700',color:'white',letterSpacing:'-2px',lineHeight:1}}>
              {renderValue(cities)}
            </div>
            <div style={{fontSize:'14px',fontWeight:'700',color:'#9FE1CB',marginTop:'8px'}}>{t.stats.citiesTitle}</div>
            <div style={{fontSize:'12px',color:'#5DCAA5',marginTop:'4px'}}>{t.stats.citiesSub}</div>
          </div>
        </div>

        <div style={{textAlign:'center'}}>
          <p style={{fontSize:'13px',color:'#5DCAA5',margin:0,fontStyle:'italic'}}>
            "Finally, I don't have to ask the barista anymore." — FlushPin user
          </p>
        </div>

      </div>
    </section>
  )
}
