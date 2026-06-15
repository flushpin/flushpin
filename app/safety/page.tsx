import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.flushpin.com/safety',
  },
}

export default function SafetyPage() {
  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20}}>
        <a href="/" style={{textDecoration:"none"}}><img src="/logo.png" alt="FlushPin" className="h-12 w-auto" /></a>
        <a href="/" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>← Back to home</a>
      </nav>

      <div style={{maxWidth:"680px",margin:"0 auto",padding:"48px 24px 80px"}}>
        <div style={{textAlign:"center",marginBottom:"40px"}}>
          <div style={{display:"inline-block",background:"#FFF7ED",color:"#9A3412",fontSize:"13px",padding:"6px 18px",borderRadius:"20px",marginBottom:"16px",fontWeight:"600"}}>
            Safety & Community Notice
          </div>
          <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(26px,5vw,38px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>
            Using FlushPin safely
          </h1>
          <p style={{fontSize:"16px",color:"#666",lineHeight:"1.7",maxWidth:"500px",margin:"0 auto"}}>
            FlushPin helps you find restroom access information — but your safety always comes first.
          </p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:"16px",marginBottom:"48px"}}>
          {[
            {icon:"🏢", title:"We don't control listed locations", desc:"FlushPin does not own, operate, or inspect any restroom, business, or property listed on the platform. We are an information service only."},
            {icon:"📋", title:"Follow posted rules and staff instructions", desc:"Business rules always apply. Staff may override any information shown in the app. Always follow signage and staff directions."},
            {icon:"🚫", title:"Do not enter restricted or unsafe areas", desc:"Do not enter areas marked as employees only, closed, or restricted — even if the app shows access information for that location."},
            {icon:"🔒", title:"Do not force entry or bypass locks", desc:"Never force entry or attempt to bypass a lock. If the code doesn't work, ask staff for assistance."},
            {icon:"⚠️", title:"A code is not a guarantee", desc:"An access code does not guarantee permission to enter, safety of the location, or that the restroom is currently available. Conditions may have changed."},
            {icon:"🚨", title:"If you feel unsafe, leave immediately", desc:"If anything feels wrong — leave the area if safe to do so. Do not rely on the app in emergency situations."},
            {icon:"📞", title:"For emergencies, call 911", desc:"FlushPin is not an emergency service. For any urgent safety situation, contact local emergency services immediately."},
            {icon:"📍", title:"Report outdated or unsafe information", desc:"Help keep the community safe by reporting incorrect, outdated, or concerning information using the Report Issue button in the app."},
          ].map((item, i) => (
            <div key={i} style={{display:"flex",gap:"16px",background:"#F9FAFB",borderRadius:"14px",padding:"20px",border:"1px solid #E5E7EB"}}>
              <span style={{fontSize:"28px",flexShrink:0}}>{item.icon}</span>
              <div>
                <div style={{fontSize:"15px",fontWeight:"700",color:"#0A2E1F",marginBottom:"4px"}}>{item.title}</div>
                <div style={{fontSize:"14px",color:"#6B7280",lineHeight:"1.6"}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{background:"#0A2E1F",borderRadius:"16px",padding:"28px",textAlign:"center"}}>
          <div style={{fontSize:"32px",marginBottom:"12px"}}>🆘</div>
          <div style={{fontSize:"20px",fontWeight:"700",color:"white",marginBottom:"8px"}}>Emergency?</div>
          <div style={{fontSize:"15px",color:"#9FE1CB",marginBottom:"16px",lineHeight:"1.6"}}>If you or someone else is in immediate danger, do not wait. Call emergency services.</div>
          <a href="tel:911" style={{display:"inline-block",background:"#EF4444",color:"white",padding:"12px 32px",borderRadius:"10px",fontSize:"18px",fontWeight:"800",textDecoration:"none"}}>
            Call 911
          </a>
        </div>

        <div style={{marginTop:"32px",textAlign:"center"}}>
          <p style={{fontSize:"13px",color:"#9CA3AF",lineHeight:"1.7"}}>
            For questions about safety or to report a concern, contact us at{' '}
            <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>.
            {' '}Read our full <a href="/terms" style={{color:"#1D9E75"}}>Terms of Service</a>.
          </p>
        </div>
      </div>

      <footer style={{background:"#0A2E1F",padding:"28px 20px",textAlign:"center"}}>
        <div style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/privacy" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Privacy Policy</a>
          <a href="/terms" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Terms of Service</a>
          <a href="/safety" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Safety Notice</a>
          <a href="/business/claim" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Business Claims</a>
        </div>
        <p style={{color:"#2D6A4F",fontSize:"11px",marginTop:"12px"}}>© 2026 FlushPin. All rights reserved.</p>
      </footer>
    </main>
  )
}
