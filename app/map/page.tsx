'use client'
import { useState, useEffect } from 'react'

const RESTROOMS = [
  { id:1, name:"Philz Coffee", address:"Irvine Spectrum Center, Irvine", lat:33.6494, lng:-117.7425, pin:"2580", score:5.0, stars:5, status:"green", verified:"Today", type:"cafe", accessible:true },
  { id:2, name:"Panera Bread", address:"Culver Dr, Irvine", lat:33.6831, lng:-117.7674, pin:"1379", score:3.1, stars:3, status:"amber", verified:"3 days ago", type:"cafe", accessible:true },
  { id:3, name:"Starbucks", address:"Alton Pkwy, Irvine", lat:33.6762, lng:-117.7831, pin:"4521", score:4.8, stars:5, status:"green", verified:"Today", type:"cafe", accessible:true },
  { id:4, name:"Barnes & Noble", address:"Irvine Spectrum, Irvine", lat:33.6501, lng:-117.7401, pin:"", score:2.1, stars:2, status:"red", verified:"Unknown", type:"retail", accessible:false },
  { id:5, name:"Target", address:"Barranca Pkwy, Irvine", lat:33.6901, lng:-117.8201, pin:"open", score:4.2, stars:4, status:"green", verified:"Yesterday", type:"retail", accessible:true },
  { id:6, name:"Chipotle", address:"Jamboree Rd, Irvine", lat:33.6621, lng:-117.8101, pin:"3847", score:3.8, stars:4, status:"amber", verified:"2 days ago", type:"restaurant", accessible:true },
  { id:7, name:"Whole Foods", address:"Michelson Dr, Irvine", lat:33.6589, lng:-117.8312, pin:"open", score:4.6, stars:5, status:"green", verified:"Today", type:"grocery", accessible:true },
  { id:8, name:"McDonald's", address:"Culver Dr, Irvine", lat:33.6712, lng:-117.7901, pin:"1234", score:2.8, stars:3, status:"amber", verified:"5 days ago", type:"restaurant", accessible:true },
]

function getDistance(lat1:number, lng1:number, lat2:number, lng2:number) {
  const R = 3958.8
  const dLat = (lat2-lat1) * Math.PI/180
  const dLng = (lng2-lng1) * Math.PI/180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const Logo = () => (
  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
    <div style={{width:'32px',height:'32px',background:'#1D9E75',borderRadius:'8px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'2px'}}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'2px',width:'18px'}}>
        {[1,1,1,1,1,1,0,1,0].map((v,i)=>(<div key={i} style={{width:'4px',height:'4px',borderRadius:'50%',background:v?'rgba(255,255,255,0.95)':'rgba(255,255,255,0.15)'}}/>))}
      </div>
      <div style={{width:0,height:0,borderLeft:'4px solid transparent',borderRight:'4px solid transparent',borderTop:'6px solid #1D9E75',marginTop:'-1px'}}/>
    </div>
    <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'18px',fontWeight:'700',color:'#0A2E1F',letterSpacing:'-0.5px'}}>Flush<span style={{color:'#1D9E75'}}>Pin</span></span>
  </div>
)

export default function FindPage() {
  const [userLat, setUserLat] = useState(33.6846)
  const [userLng, setUserLng] = useState(-117.7892)
  const [locationName, setLocationName] = useState('Irvine, CA')
  const [filter, setFilter] = useState('all')
  const [unit, setUnit] = useState<'mi'|'km'>('mi')
  const [selected, setSelected] = useState<any>(null)
  const [showPin, setShowPin] = useState(false)
  const [emergency, setEmergency] = useState(false)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true)
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLat(pos.coords.latitude)
          setUserLng(pos.coords.longitude)
          setLocationName('Your location')
          setLocating(false)
        },
        () => setLocating(false)
      )
    }
  }, [])

  const withDistance = RESTROOMS.map(r => ({
    ...r,
    distance: getDistance(userLat, userLng, r.lat, r.lng)
  })).sort((a,b) => a.distance - b.distance)

  const filtered = withDistance.filter(r => {
    if (emergency) return r.status === 'green'
    if (filter === 'verified') return r.status === 'green'
    if (filter === 'accessible') return r.accessible
    if (filter === 'pin') return r.pin && r.pin !== 'open' && r.pin !== ''
    return true
  })

  const formatDist = (d:number) => unit === 'mi' ? `${d.toFixed(1)} mi` : `${(d*1.609).toFixed(1)} km`

  const statusColor = (s:string) => s==='green'?'#1D9E75':s==='amber'?'#D97706':'#DC2626'
  const statusLabel = (s:string) => s==='green'?'Verified':s==='amber'?'Needs update':'Unknown PIN'

  const openDirections = (r:any) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${r.lat},${r.lng}&dirflg=d`
      : `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8f9fa',fontFamily:"'Inter',system-ui,sans-serif"}}>

      <nav style={{background:'white',borderBottom:'1px solid #f0f0f0',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:10}}>
        <a href="/" style={{textDecoration:'none'}}><Logo/></a>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <button onClick={()=>setUnit(unit==='mi'?'km':'mi')} style={{background:'#f5f5f5',border:'none',padding:'6px 12px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',color:'#555'}}>
            {unit === 'mi' ? 'Switch to km' : 'Switch to mi'}
          </button>
          <button onClick={()=>setEmergency(!emergency)} style={{background:emergency?'#DC2626':'white',color:emergency?'white':'#DC2626',border:'2px solid #DC2626',padding:'6px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>
            🚨 {emergency?'Emergency ON':'Emergency'}
          </button>
        </div>
      </nav>

      <div style={{background:'white',padding:'14px 20px',borderBottom:'1px solid #f0f0f0'}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}>
          <span style={{fontSize:'13px',color:'#1D9E75'}}>📍</span>
          <span style={{fontSize:'13px',color:'#555',fontWeight:'500'}}>{locating ? 'Finding your location...' : locationName}</span>
          <button onClick={()=>{
            setLocating(true)
            navigator.geolocation.getCurrentPosition(pos=>{setUserLat(pos.coords.latitude);setUserLng(pos.coords.longitude);setLocationName('Your location');setLocating(false)},()=>setLocating(false))
          }} style={{background:'none',border:'none',color:'#1D9E75',fontSize:'12px',cursor:'pointer',fontWeight:'600',marginLeft:'auto'}}>
            Update location
          </button>
        </div>
        <div style={{display:'flex',gap:'8px',overflowX:'auto',paddingBottom:'2px'}}>
          {[
            {id:'all',label:'All'},
            {id:'verified',label:'Verified today'},
            {id:'accessible',label:'Accessible ♿'},
            {id:'pin',label:'Has PIN'},
          ].map(f=>(
            <button key={f.id} onClick={()=>setFilter(f.id)} style={{background:filter===f.id?'#0A2E1F':'#f5f5f5',color:filter===f.id?'white':'#555',border:'none',padding:'7px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap',flexShrink:0}}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {emergency && (
        <div style={{background:'#FEF2F2',borderBottom:'1px solid #FCA5A5',padding:'10px 20px'}}>
          <p style={{fontSize:'13px',fontWeight:'700',color:'#DC2626',margin:0}}>🚨 Emergency mode — showing nearest verified restrooms only</p>
        </div>
      )}

      <div style={{padding:'16px 16px 100px'}}>
        <p style={{fontSize:'13px',color:'#999',marginBottom:'12px',fontWeight:'500'}}>{filtered.length} restrooms near you</p>

        {filtered.map(r=>(
          <div key={r.id} onClick={()=>{setSelected(r===selected?null:r);setShowPin(false)}} style={{background:'white',borderRadius:'14px',marginBottom:'10px',boxShadow:'0 1px 6px rgba(0,0,0,0.06)',overflow:'hidden',cursor:'pointer',border:selected?.id===r.id?'2px solid #1D9E75':'2px solid transparent'}}>
            <div style={{padding:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'8px'}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                    <div style={{width:'8px',height:'8px',borderRadius:'50%',background:statusColor(r.status),flexShrink:0}}/>
                    <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'15px',fontWeight:'700',color:'#0A2E1F'}}>{r.name}</span>
                    {r.accessible && <span style={{fontSize:'12px'}}>♿</span>}
                  </div>
                  <p style={{fontSize:'12px',color:'#999',margin:'0 0 8px',paddingLeft:'16px'}}>{r.address}</p>
                  <div style={{display:'flex',gap:'8px',alignItems:'center',paddingLeft:'16px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'12px',color:'#D97706',fontWeight:'500'}}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)} {r.score}</span>
                    <span style={{fontSize:'11px',background:r.status==='green'?'#E1F5EE':r.status==='amber'?'#FEF3C7':'#FEE2E2',color:statusColor(r.status),padding:'2px 8px',borderRadius:'10px',fontWeight:'600'}}>{statusLabel(r.status)}</span>
                  </div>
                </div>
                <div style={{textAlign:'right',flexShrink:0,marginLeft:'12px'}}>
                  <p style={{fontSize:'14px',fontWeight:'700',color:'#0A2E1F',margin:'0 0 2px'}}>{formatDist(r.distance)}</p>
                  <p style={{fontSize:'11px',color:'#bbb',margin:0}}>away</p>
                </div>
              </div>
            </div>

            {selected?.id===r.id && (
              <div style={{borderTop:'1px solid #f5f5f5',padding:'14px 16px',background:'#fafafa'}}>
                {!showPin ? (
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={e=>{e.stopPropagation();setShowPin(true)}} style={{flex:1,background:'#1D9E75',color:'white',border:'none',padding:'11px',borderRadius:'9px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>
                      {r.pin?'Get the PIN':'Report unknown PIN'}
                    </button>
                    <button onClick={e=>{e.stopPropagation();openDirections(r)}} style={{flex:1,background:'#0A2E1F',color:'white',border:'none',padding:'11px',borderRadius:'9px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>
                      Get Directions →
                    </button>
                  </div>
                ):(
                  <div onClick={e=>e.stopPropagation()}>
                    {r.pin && r.pin!=='open' ? (
                      <div style={{background:'#E1F5EE',borderRadius:'10px',padding:'16px',textAlign:'center',marginBottom:'10px'}}>
                        <p style={{fontSize:'11px',color:'#0F6E56',fontWeight:'600',margin:'0 0 6px',letterSpacing:'1px'}}>RESTROOM PIN</p>
                        <p style={{fontSize:'40px',fontWeight:'700',color:'#085041',letterSpacing:'10px',margin:0}}>{r.pin}</p>
                        <p style={{fontSize:'11px',color:'#888',margin:'6px 0 0'}}>Verified {r.verified}</p>
                      </div>
                    ):r.pin==='open'?(
                      <div style={{background:'#E1F5EE',borderRadius:'10px',padding:'14px',textAlign:'center',marginBottom:'10px'}}>
                        <p style={{fontSize:'16px',fontWeight:'700',color:'#085041',margin:0}}>No PIN needed</p>
                        <p style={{fontSize:'12px',color:'#888',margin:'4px 0 0'}}>Open access restroom</p>
                      </div>
                    ):(
                      <div style={{background:'#FEE2E2',borderRadius:'10px',padding:'14px',textAlign:'center',marginBottom:'10px'}}>
                        <p style={{fontSize:'14px',fontWeight:'700',color:'#DC2626',margin:0}}>PIN unknown</p>
                        <p style={{fontSize:'12px',color:'#888',margin:'4px 0 0'}}>Ask staff or help us update it</p>
                      </div>
                    )}
                    <div style={{display:'flex',gap:'8px',marginBottom:'8px'}}>
                      <button style={{flex:1,background:'#f0faf6',color:'#1D9E75',border:'1px solid #9FE1CB',padding:'9px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>PIN worked ✅</button>
                      <button style={{flex:1,background:'#FEE2E2',color:'#DC2626',border:'1px solid #FCA5A5',padding:'9px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>PIN failed ❌</button>
                      <button style={{flex:1,background:'#FEF3C7',color:'#D97706',border:'1px solid #FCD34D',padding:'9px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>Update 🔄</button>
                    </div>
                    <button onClick={()=>openDirections(r)} style={{width:'100%',background:'#0A2E1F',color:'white',border:'none',padding:'11px',borderRadius:'9px',fontSize:'14px',fontWeight:'700',cursor:'pointer'}}>
                      Get Directions →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
