'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PromoModal({ restroom, onComplete }: { restroom: any, onComplete: () => void }) {
  const [promo, setPromo] = useState<any>(null)
  const [seconds, setSeconds] = useState(3)
  const [loading, setLoading] = useState(true)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))

  useEffect(() => { fetchPromo() }, [])

  useEffect(() => {
    if (!promo) return
    if (seconds <= 0) return
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [promo, seconds])

  const fetchPromo = async () => {
    // Önce restroom_id ile bak
    let data = null
    const { data: d1 } = await supabase
      .from('promotion')
      .select('*')
      .eq('restroom_id', restroom.id)
      .eq('active', true)
      .limit(1)
      .single()
    
    if (d1) {
      data = d1
    } else {
      // restroom_id yoksa business_name ile eşleştir
      const cleanName = restroom.name?.toLowerCase().replace(/[^a-z0-9]/g,'') || ''
      const { data: allPromos } = await supabase
        .from('promotion')
        .select('*')
        .eq('active', true)
        .is('restroom_id', null)
      
      if (allPromos) {
        data = allPromos.find((p:any) => {
          const pName = p.business_name?.toLowerCase().replace(/[^a-z0-9]/g,'') || ''
          return cleanName.includes(pName) || pName.includes(cleanName)
        }) || null
      }
    }

    if (data) {
      setPromo(data)
      await supabase.from('promotion_event').insert({
        promotion_id: data.id,
        event_type: 'view',
        session_id: sessionId,
      }).then(() => {})
      await supabase.from('promotion').update({ views: (data.views || 0) + 1 }).eq('id', data.id)
    } else {
      onComplete()
    }
    setLoading(false)
  }

  const handleClick = async () => {
    if (!promo) return
    await supabase.from('promotion_event').insert({
      promotion_id: promo.id,
      event_type: 'click',
      session_id: sessionId,
    })
    await supabase.from('promotion').update({ clicks: (promo.clicks || 0) + 1 }).eq('id', promo.id)
    if (promo.cta_url) window.open(promo.cta_url, '_blank')
  }

  if (loading) return null
  if (!promo) return null

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:60,display:'flex',alignItems:'flex-end'}}>
      <div style={{background:'white',borderRadius:'20px 20px 0 0',padding:'28px 24px',width:'100%'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <span style={{fontSize:'11px',color:'#bbb',fontWeight:'600',letterSpacing:'0.5px'}}>SPONSORED · LOCAL OFFER</span>
          <div style={{background:seconds>0?'#F59E0B':'#1D9E75',color:'white',borderRadius:'20px',padding:'4px 12px',fontSize:'12px',fontWeight:'700',minWidth:'60px',textAlign:'center'}}>
            {seconds > 0 ? `${seconds}s` : 'Ready ✓'}
          </div>
        </div>
        <div style={{background:'linear-gradient(135deg,#f0faf6 0%,#e8f5e9 100%)',borderRadius:'14px',padding:'20px',marginBottom:'20px',border:'1px solid #9FE1CB'}}>
          <p style={{fontSize:'11px',fontWeight:'600',color:'#1D9E75',margin:'0 0 8px',letterSpacing:'0.5px'}}>{promo.business_name?.toUpperCase()}</p>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#0A2E1F',margin:'0 0 8px',lineHeight:'1.3'}}>{promo.headline}</p>
          {promo.subtext && <p style={{fontSize:'13px',color:'#666',margin:'0 0 14px',lineHeight:'1.6'}}>{promo.subtext}</p>}
          {promo.cta_url && (
            <button onClick={handleClick} style={{background:'#1D9E75',color:'white',border:'none',padding:'10px 20px',borderRadius:'9px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
              {promo.cta_text || 'See offer'} →
            </button>
          )}
        </div>
        <button
          onClick={onComplete}
          disabled={seconds > 0}
          style={{width:'100%',background:seconds>0?'#f5f5f5':'#0A2E1F',color:seconds>0?'#bbb':'white',border:'none',padding:'14px',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:seconds>0?'not-allowed':'pointer',transition:'all 0.3s'}}
        >
          {seconds > 0 ? `Show access code in ${seconds}s...` : 'Show access code →'}
        </button>
        <p style={{fontSize:'11px',color:'#ccc',textAlign:'center',margin:'10px 0 0'}}>Ads help keep FlushPin free for everyone</p>
      </div>
    </div>
  )
}
