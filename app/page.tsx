export default function Home() {
  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>

      <nav style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 40px",borderBottom:"1px solid #f0f0f0"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <div style={{width:"42px",height:"42px",background:"#1D9E75",borderRadius:"11px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"4px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"3px",width:"24px"}}>
              {[1,1,1,1,1,1,0,1,0].map((v,i)=>(
                <div key={i} style={{width:"6px",height:"6px",borderRadius:"50%",background:v?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.15)"}}/>
              ))}
            </div>
            <div style={{width:0,height:0,borderLeft:"5px solid transparent",borderRight:"5px solid transparent",borderTop:"8px solid #1D9E75",marginTop:"-1px"}}/>
          </div>
          <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"22px",fontWeight:"700",color:"#0A2E1F",letterSpacing:"-0.5px"}}>
            Flush<span style={{color:"#1D9E75"}}>Pin</span>
          </span>
        </div>
        <div style={{display:"flex",gap:"16px",alignItems:"center"}}>
          <a href="/business" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>For Businesses</a>
          <a href="/map" style={{background:"#1D9E75",color:"white",padding:"10px 22px",borderRadius:"9px",textDecoration:"none",fontSize:"14px",fontWeight:"600"}}>Find a Restroom</a>
        </div>
      </nav>

      <section style={{textAlign:"center",padding:"90px 20px 70px",background:"linear-gradient(180deg,#f0faf6 0%,#fff 100%)"}}>
        <div style={{display:"inline-block",background:"#E1F5EE",color:"#0F6E56",fontSize:"13px",padding:"6px 18px",borderRadius:"20px",marginBottom:"28px",fontWeight:"600",letterSpacing:"0.3px"}}>
          Now in Orange County, CA
        </div>
        <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"56px",fontWeight:"700",color:"#0A2E1F",lineHeight:"1.15",marginBottom:"22px",letterSpacing:"-2px"}}>
          Get the PIN.<br/>
          <span style={{color:"#1D9E75"}}>Use a clean restroom.</span>
        </h1>
        <p style={{fontSize:"18px",color:"#666",maxWidth:"500px",margin:"0 auto 44px",lineHeight:"1.7",fontWeight:"400"}}>
          Find restroom PIN codes at nearby businesses. See real cleanliness scores. Help your community.
        </p>
        <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/map" style={{background:"#1D9E75",color:"white",padding:"15px 36px",borderRadius:"11px",textDecoration:"none",fontSize:"16px",fontWeight:"700",letterSpacing:"-0.3px"}}>Find a Restroom</a>
          <a href="/business" style={{background:"white",color:"#0A2E1F",padding:"15px 36px",borderRadius:"11px",textDecoration:"none",fontSize:"16px",border:"1.5px solid #e0e0e0",fontWeight:"600"}}>For Businesses</a>
        </div>
      </section>

      <section style={{padding:"0 40px 70px",maxWidth:"920px",margin:"0 auto"}}>
        <div style={{background:"#E1F5EE",borderRadius:"18px",padding:"28px",border:"1px solid #9FE1CB"}}>
          <p style={{fontSize:"13px",color:"#0F6E56",fontWeight:"600",marginBottom:"18px"}}>Restrooms near you — Irvine, CA</p>
          <div style={{display:"flex",gap:"14px",flexWrap:"wrap"}}>
            {[
              {name:"Philz Coffee",area:"Irvine Spectrum · 0.1 mi",pin:"2580",stars:"★★★★★",score:"5.0",dot:"#1D9E75",blur:false},
              {name:"Panera Bread",area:"Culver Dr · 0.4 mi",pin:"1379",stars:"★★★☆☆",score:"3.1",dot:"#D97706",blur:false},
              {name:"Barnes & Noble",area:"Alton Pkwy · 0.7 mi",pin:"????",stars:"",score:"",dot:"#DC2626",blur:true},
            ].map((r,i)=>(
              <div key={i} style={{background:"white",borderRadius:"13px",padding:"16px 18px",flex:"1",minWidth:"165px",boxShadow:"0 2px 10px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"7px"}}>
                  <div style={{width:"10px",height:"10px",borderRadius:"50%",background:r.dot,flexShrink:0}}/>
                  <span style={{fontSize:"13px",fontWeight:"700",color:"#0A2E1F",fontFamily:"'Space Grotesk','Inter',sans-serif"}}>{r.name}</span>
                </div>
                <div style={{fontSize:"11px",color:"#999",marginBottom:"11px"}}>{r.area}</div>
                <div style={{background:r.blur?"#f5f5f5":"#E1F5EE",color:r.blur?"#bbb":"#085041",fontSize:"15px",fontWeight:"700",padding:"6px 13px",borderRadius:"8px",display:"inline-block",letterSpacing:"2.5px",filter:r.blur?"blur(4px)":"none"}}>{r.pin}</div>
                {r.blur && <div style={{fontSize:"11px",color:"#DC2626",marginTop:"7px",fontWeight:"500"}}>PIN unknown. Tap to report.</div>}
                {r.stars && <div style={{color:"#D97706",fontSize:"12px",marginTop:"7px",fontWeight:"500"}}>{r.stars} {r.score}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:"20px 40px 70px",maxWidth:"920px",margin:"0 auto"}}>
        <h2 style={{textAlign:"center",fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"32px",fontWeight:"700",color:"#0A2E1F",marginBottom:"10px",letterSpacing:"-1px"}}>Everything you need on the map.</h2>
        <p style={{textAlign:"center",color:"#999",marginBottom:"40px",fontSize:"15px"}}>Find it. Rate it. Flush it.</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:"16px"}}>
          {[
            {icon:"🔑",title:"Get the PIN",desc:"See the restroom PIN for any nearby business instantly."},
            {icon:"⭐",title:"Cleanliness score",desc:"Real ratings from real people who were just there."},
            {icon:"📍",title:"Map view",desc:"Filter by distance, rating, and accessibility."},
            {icon:"🚨",title:"Emergency mode",desc:"Need one now? Get the nearest clean restroom fast."},
          ].map((f,i)=>(
            <div key={i} style={{background:"#f8f8f8",borderRadius:"14px",padding:"24px",border:"1px solid #eee"}}>
              <div style={{fontSize:"30px",marginBottom:"14px"}}>{f.icon}</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:"#0A2E1F",marginBottom:"7px",fontFamily:"'Space Grotesk','Inter',sans-serif"}}>{f.title}</div>
              <div style={{fontSize:"13px",color:"#888",lineHeight:"1.65"}}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{padding:"0 40px 70px",maxWidth:"920px",margin:"0 auto"}}>
        <div style={{background:"#0A2E1F",borderRadius:"18px",padding:"32px 36px",display:"flex",alignItems:"center",gap:"24px",flexWrap:"wrap"}}>
          <div style={{width:"64px",height:"64px",background:"#1D9E75",borderRadius:"16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"4px",flexShrink:0}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"3px",width:"30px"}}>
              {[1,1,1,1,1,1,0,1,0].map((v,i)=>(
                <div key={i} style={{width:"7px",height:"7px",borderRadius:"50%",background:v?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.15)"}}/>
              ))}
            </div>
            <div style={{width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"10px solid #1D9E75",marginTop:"-1px"}}/>
          </div>
          <div style={{flex:1,minWidth:"200px"}}>
            <div style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"white",marginBottom:"8px"}}>The FlushPin Award</div>
            <div style={{fontSize:"14px",color:"#9FE1CB",lineHeight:"1.7",marginBottom:"14px"}}>Businesses with a FlushScore of 4.8 or above earn our Certified Clean badge. Displayed on their profile and as a door sticker customers can trust.</div>
            <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"#1D9E75",color:"white",fontSize:"12px",padding:"7px 16px",borderRadius:"20px",fontWeight:"600"}}>FlushScore 4.8 or above</div>
          </div>
        </div>
      </section>

      <section style={{padding:"0 40px 70px",maxWidth:"920px",margin:"0 auto",textAlign:"center"}}>
        <p style={{fontSize:"12px",fontWeight:"600",color:"#bbb",marginBottom:"14px",letterSpacing:"1px"}}>STARTING IN ORANGE COUNTY</p>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",justifyContent:"center"}}>
          {["Irvine","Newport Beach","Anaheim","Santa Ana","Huntington Beach","Costa Mesa","More coming"].map((c,i)=>(
            <span key={i} style={{background:i<2?"#E1F5EE":"#f5f5f5",color:i<2?"#0F6E56":"#aaa",border:i<2?"1px solid #9FE1CB":"1px solid #eee",borderRadius:"20px",fontSize:"13px",padding:"7px 18px",fontWeight:i<2?"600":"400"}}>{c}</span>
          ))}
        </div>
      </section>

      <footer style={{background:"#0A2E1F",padding:"36px 40px",textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",marginBottom:"10px"}}>
          <div style={{width:"32px",height:"32px",background:"#1D9E75",borderRadius:"8px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"3px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"2px",width:"18px"}}>
              {[1,1,1,1,1,1,0,1,0].map((v,i)=>(
                <div key={i} style={{width:"4px",height:"4px",borderRadius:"50%",background:v?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.15)"}}/>
              ))}
            </div>
            <div style={{width:0,height:0,borderLeft:"4px solid transparent",borderRight:"4px solid transparent",borderTop:"6px solid #1D9E75",marginTop:"-1px"}}/>
          </div>
          <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"white",letterSpacing:"-0.5px"}}>FlushPin</span>
        </div>
        <div style={{fontSize:"12px",color:"#5DCAA5",letterSpacing:"0.5px",marginBottom:"6px"}}>flushpin.com — Orange County, California</div>
        <div style={{fontSize:"11px",color:"#2D6A4F"}}>Find it. Rate it. Flush it.</div>
      </footer>

    </main>
  )
}
