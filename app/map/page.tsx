'use client'
import { useEffect, useRef, useState } from 'react'

const RESTROOMS = [
  { id: 1, name: "Philz Coffee", address: "Irvine Spectrum Center", lat: 33.6494, lng: -117.7425, pin: "2580", score: 5.0, stars: 5, status: "green", verified: "Today" },
  { id: 2, name: "Panera Bread", address: "Culver Dr, Irvine", lat: 33.6831, lng: -117.7674, pin: "1379", score: 3.1, stars: 3, status: "amber", verified: "3 days ago" },
  { id: 3, name: "Starbucks", address: "Alton Pkwy, Irvine", lat: 33.6762, lng: -117.7831, pin: "4521", score: 4.8, stars: 5, status: "green", verified: "Today" },
  { id: 4, name: "Barnes & Noble", address: "Irvine Spectrum", lat: 33.6501, lng: -117.7401, pin: "", score: 2.1, stars: 2, status: "red", verified: "Unknown" },
  { id: 5, name: "Target", address: "Barranca Pkwy, Irvine", lat: 33.6901, lng: -117.8201, pin: "open", score: 4.2, stars: 4, status: "green", verified: "Yesterday" },
  { id: 6, name: "Chipotle", address: "Jamboree Rd, Irvine", lat: 33.6621, lng: -117.8101, pin: "3847", score: 3.8, stars: 4, status: "amber", verified: "2 days ago" },
]

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

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [showPin, setShowPin] = useState(false)
  const [emergency, setEmergency] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}`
    script.async = true
    script.onload = () => {
      if (!mapRef.current) return
      const g = (window as any).google
      const m = new g.maps.Map(mapRef.current, {
        center: { lat: 33.6846, lng: -117.7892 },
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ]
      })
      setMap(m)
      RESTROOMS.forEach(r => {
        const color = r.status === 'green' ? '#1D9E75' : r.status === 'amber' ? '#D97706' : '#DC2626'
        const marker = new g.maps.Marker({
          position: { lat: r.lat, lng: r.lng },
          map: m,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
          title: r.name,
        })
        marker.addListener('click', () => {
          setSelected(r)
          setShowPin(false)
        })
      })
    }
    document.head.appendChild(script)
  }, [])

  const filtered = emergency
    ? RESTROOMS.filter(r => r.status === 'green').sort((a,b) => b.score - a.score)
    : filter === 'all' ? RESTROOMS : RESTROOMS.filter(r => r.status === filter)

  const statusColor = (s: string) => s === 'green' ? '#1D9E75' : s === 'amber' ? '#D97706' : '#DC2626'
  const statusLabel = (s: string) => s === 'green' ? 'Verified' : s === 'amber' ? 'Outdated' : 'Unknown'

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',fontFamily:"'Inter',system-ui,sans-serif",background:'#fff'}}>

      <nav style={{padding:'12px 20px',borderBottom:'1px solid #f0f0f0',display:'flex',alignItems:'center',justifyContent:'space-between',background:'white',zIndex:10}}>
        <a href="/" style={{textDecoration:'none'}}><Logo/></a>
        <button
          onClick={()=>setEmergency(!emergency)}
          style={{background:emergency?'#DC2626':'#fff',color:emergency?'white':'#DC2626',border:'2px solid #DC2626',padding:'8px 16px',borderRadius:'8px',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
          {emergency ? '🚨 Emergency ON' : '🚨 Emergency'}
        </button>
      </nav>

      <div style={{display:'flex',gap:'8px',padding:'10px 16px',borderBottom:'1px solid #f5f5f5',overflowX:'auto'}}>
        {[
          {id:'all',label:'All restrooms'},
          {id:'green',label:'Verified today'},
          {id:'amber',label:'Needs update'},
          {id:'red',label:'Unknown PIN'},
        ].map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{background:filter===f.id?'#0A2E1F':'#f5f5f5',color:filter===f.id?'white':'#555',border:'none',padding:'7px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',cursor:'pointer',whiteSpace:'nowrap'}}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,display:'flex',overflow:'hidden'}}>

        <div style={{width:'300px',overflowY:'auto',borderRight:'1px solid #f0f0f0',flexShrink:0}}>
          {emergency && (
            <div style={{background:'#FEF2F2',borderBottom:'1px solid #FCA5A5',padding:'10px 14px'}}>
              <p style={{fontSize:'12px',fontWeight:'700',color:'#DC2626',margin:0}}>🚨 Emergency mode — showing nearest clean restrooms</p>
            </div>
          )}
          {filtered.map(r=>(
            <div
              key={r.id}
              onClick={()=>{setSelected(r);setShowPin(false)}}
              style={{padding:'14px 16px',borderBottom:'1px solid #f5f5f5',cursor:'pointer',background:selected?.id===r.id?'#F0FAF6':'white'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'5px'}}>
                <div style={{width:'8px',height:'8px',borderRadius:'50%',background:statusColor(r.status),flexShrink:0}}/>
                <span style={{fontSize:'13px',fontWeight:'700',color:'#0A2E1F'}}>{r.name}</span>
              </div>
              <div style={{fontSize:'11px',color:'#999',marginBottom:'7px'}}>{r.address}</div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{background:r.status==='green'?'#E1F5EE':r.status==='amber'?'#FEF3C7':'#FEE2E2',color:statusColor(r.status),fontSize:'11px',fontWeight:'600',padding:'3px 8px',borderRadius:'20px'}}>{statusLabel(r.status)}</span>
                <span style={{fontSize:'11px',color:'#D97706'}}>{'★'.repeat(r.stars)}{'☆'.repeat(5-r.stars)} {r.score}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{flex:1,position:'relative'}}>
          <div ref={mapRef} style={{width:'100%',height:'100%'}}/>

          {selected && (
            <div style={{position:'absolute',bottom:'20px',left:'50%',transform:'translateX(-50%)',background:'white',borderRadius:'16px',padding:'20px',boxShadow:'0 8px 32px rgba(0,0,0,0.15)',width:'320px',zIndex:5}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                <div>
                  <h3 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'16px',fontWeight:'700',color:'#0A2E1F',margin:'0 0 4px'}}>{selected.name}</h3>
                  <p style={{fontSize:'12px',color:'#999',margin:0}}>{selected.address}</p>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:'#f5f5f5',border:'none',borderRadius:'50%',width:'28px',height:'28px',cursor:'pointer',fontSize:'14px'}}>✕</button>
              </div>

              <div style={{display:'flex',gap:'8px',marginBottom:'14px'}}>
                <span style={{background:'#E1F5EE',color:'#085041',fontSize:'12px',fontWeight:'600',padding:'4px 10px',borderRadius:'20px'}}>
                  {selected.score}/5.0 ⭐
                </span>
                <span style={{background:selected.status==='green'?'#E1F5EE':selected.status==='amber'?'#FEF3C7':'#FEE2E2',color:statusColor(selected.status),fontSize:'12px',fontWeight:'600',padding:'4px 10px',borderRadius:'20px'}}>
                  {statusLabel(selected.status)}
                </span>
              </div>

              {!showPin ? (
                <button
                  onClick={()=>setShowPin(true)}
                  style={{width:'100%',background:'#1D9E75',color:'white',border:'none',padding:'13px',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer'}}>
                  {selected.pin ? 'Get the PIN' : 'Report unknown PIN'}
                </button>
              ) : (
                <div>
                  {selected.pin && selected.pin !== 'open' ? (
                    <div style={{background:'#E1F5EE',borderRadius:'10px',padding:'16px',textAlign:'center',marginBottom:'10px'}}>
                      <p style={{fontSize:'11px',color:'#0F6E56',fontWeight:'600',margin:'0 0 6px',letterSpacing:'1px'}}>RESTROOM PIN</p>
                      <p style={{fontSize:'36px',fontWeight:'700',color:'#085041',letterSpacing:'8px',margin:0}}>{selected.pin}</p>
                      <p style={{fontSize:'11px',color:'#888',margin:'6px 0 0'}}>Verified {selected.verified}</p>
                    </div>
                  ) : selected.pin === 'open' ? (
                    <div style={{background:'#E1F5EE',borderRadius:'10px',padding:'16px',textAlign:'center',marginBottom:'10px'}}>
                      <p style={{fontSize:'18px',fontWeight:'700',color:'#085041',margin:0}}>No PIN needed</p>
                      <p style={{fontSize:'12px',color:'#888',margin:'4px 0 0'}}>Open access restroom</p>
                    </div>
                  ) : (
                    <div style={{background:'#FEE2E2',borderRadius:'10px',padding:'16px',textAlign:'center',marginBottom:'10px'}}>
                      <p style={{fontSize:'14px',fontWeight:'700',color:'#DC2626',margin:0}}>PIN unknown</p>
                      <p style={{fontSize:'12px',color:'#888',margin:'4px 0 0'}}>Ask staff or help us update it</p>
                    </div>
                  )}
                  <div style={{display:'flex',gap:'8px'}}>
                    <button style={{flex:1,background:'#f5f5f5',color:'#555',border:'none',padding:'10px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>PIN worked ✅</button>
                    <button style={{flex:1,background:'#f5f5f5',color:'#DC2626',border:'none',padding:'10px',borderRadius:'8px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>PIN failed ❌</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
