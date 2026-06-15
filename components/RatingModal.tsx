'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Stars({label, value, onChange}: {label:string, value:number, onChange:(v:number)=>void}) {
  return (
    <div style={{marginBottom:'14px'}}>
      <p style={{fontSize:'13px',fontWeight:'600',color:'#555',margin:'0 0 6px'}}>{label}</p>
      <div style={{display:'flex',gap:'8px'}}>
        {[1,2,3,4,5].map(i=>(
          <button key={i} onClick={()=>onChange(i)} style={{background:'none',border:'none',fontSize:'32px',cursor:'pointer',padding:0,lineHeight:1,color:i<=value?'#F59E0B':'#e0e0e0'}}>★</button>
        ))}
      </div>
    </div>
  )
}

export default function RatingModal({restroom, user, onClose, onDone, initialPinWorked}: {restroom:any, user:any, onClose:()=>void, onDone:()=>void, initialPinWorked?:boolean}) {
  const [cleanliness, setCleanliness] = useState(0)
  const [smell, setSmell] = useState(0)
  const [appearance, setAppearance] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const pinFailed = initialPinWorked === false

  const handleSubmit = async () => {
    if (!user) { setMsg('⚠️ Please sign in to rate'); return }
    if (!pinFailed && (!cleanliness||!smell||!appearance)) { setMsg('⚠️ Please rate all 3 categories'); return }
    setLoading(true)

    if (pinFailed) {
      await supabase.from('rating').upsert({
        restroom_id: restroom.id,
        user_id: user.id,
        cleanliness: 1, smell: 1, appearance: 1,
        pin_worked: false,
        comment,
      })
      await supabase.from('restroom').update({
        status: 'red',
        verified_note: 'PIN reported broken',
        status_note: 'PIN reported broken',
      }).eq('id', restroom.id)
    } else {
      const avg = Math.round((cleanliness+smell+appearance)/3*10)/10
      await supabase.from('rating').upsert({
        restroom_id: restroom.id,
        user_id: user.id,
        cleanliness, smell, appearance,
        pin_worked: true,
        comment,
      })
      await supabase.from('restroom').update({
        score: avg,
        stars: Math.round(avg),
        status: avg>=4.5?'green':avg>=3?'amber':'red',
        verified_note: 'Just rated',
      }).eq('id', restroom.id)
    }

    setLoading(false)
    onDone()
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'flex-end'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:'white',borderRadius:'20px 20px 0 0',padding:'24px 20px',width:'100%',maxHeight:'85vh',overflowY:'auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'20px'}}>
          <h2 style={{margin:0,fontSize:'18px',fontWeight:'700',color:'#0A2E1F'}}>
            {pinFailed ? '❌ Report broken PIN' : `⭐ Rate: ${restroom.name}`}
          </h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:'24px',cursor:'pointer',color:'#999'}}>✕</button>
        </div>

        {pinFailed ? (
          <>
            <div style={{background:'#FEE2E2',borderRadius:'12px',padding:'16px',marginBottom:'20px'}}>
              <p style={{margin:'0 0 6px',fontSize:'15px',fontWeight:'700',color:'#DC2626'}}>PIN not working at {restroom.name}</p>
              <p style={{margin:0,fontSize:'13px',color:'#999'}}>We'll mark this as broken so others know. Thank you for reporting!</p>
            </div>
            <div style={{marginBottom:'16px'}}>
              <p style={{fontSize:'13px',fontWeight:'600',color:'#555',margin:'0 0 6px'}}>Any details? (optional)</p>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="e.g. PIN changed, door was locked, staff not helpful..." style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'13px',color:'#1a1a1a',resize:'none',height:'80px',boxSizing:'border-box',fontFamily:"'Inter',system-ui,sans-serif",outline:'none'}}/>
            </div>
          </>
        ) : (
          <>
            <div style={{background:'#E1F5EE',borderRadius:'12px',padding:'12px 14px',marginBottom:'20px'}}>
              <p style={{margin:0,fontSize:'13px',color:'#1D9E75',fontWeight:'600'}}>✅ Great! You used this restroom — how was it?</p>
            </div>
            <Stars label="🧹 Cleanliness" value={cleanliness} onChange={setCleanliness}/>
            <Stars label="👃 Smell" value={smell} onChange={setSmell}/>
            <Stars label="👁️ Appearance" value={appearance} onChange={setAppearance}/>
            <div style={{marginBottom:'14px'}}>
              <p style={{fontSize:'13px',fontWeight:'600',color:'#555',margin:'0 0 6px'}}>Comment (optional)</p>
              <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Any notes..." style={{width:'100%',padding:'10px',borderRadius:'8px',border:'1px solid #e0e0e0',fontSize:'13px',color:'#1a1a1a',resize:'none',height:'70px',boxSizing:'border-box',fontFamily:"'Inter',system-ui,sans-serif",outline:'none'}}/>
            </div>
          </>
        )}

        {msg&&<p style={{fontSize:'13px',color:'#DC2626',margin:'0 0 10px',fontWeight:'500'}}>{msg}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{width:'100%',background:pinFailed?'#DC2626':'#1D9E75',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',opacity:loading?0.7:1}}>
          {loading?'Submitting...':(pinFailed?'Report broken PIN ❌':'Submit Rating ⭐')}
        </button>
      </div>
    </div>
  )
}
