'use client'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({name:'',email:'',subject:'',message:''})
  const [sent, setSent] = useState(false)

  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20}}>
        <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:"10px"}}>
          <div style={{width:"34px",height:"34px",background:"#1D9E75",borderRadius:"9px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:"2px"}}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"2px",width:"18px"}}>
              {[1,1,1,1,1,1,0,1,0].map((v,i)=>(<div key={i} style={{width:"4px",height:"4px",borderRadius:"50%",background:v?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.15)"}}/>))}
            </div>
            <div style={{width:0,height:0,borderLeft:"3px solid transparent",borderRight:"3px solid transparent",borderTop:"5px solid #1D9E75",marginTop:"-1px"}}/>
          </div>
          <span style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"18px",fontWeight:"700",color:"#0A2E1F"}}>Flush<span style={{color:"#1D9E75"}}>Pin</span></span>
        </a>
        <a href="/" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>← Back to home</a>
      </nav>

      <div style={{maxWidth:"760px",margin:"0 auto",padding:"48px 24px 80px"}}>
        <div style={{marginBottom:"40px"}}>
          <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(28px,5vw,40px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>Contact Us</h1>
          <p style={{fontSize:"16px",color:"#666",lineHeight:"1.7"}}>Have a question, feedback, or want to list your business? We'd love to hear from you.</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:"32px"}}>
          
          {/* Contact info */}
          <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>
            <div style={{background:"#f8f8f8",borderRadius:"14px",padding:"24px",border:"1px solid #eee"}}>
              <div style={{fontSize:"24px",marginBottom:"12px"}}>📍</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:"#0A2E1F",marginBottom:"6px"}}>Office Address</div>
              <div style={{fontSize:"14px",color:"#666",lineHeight:"1.7"}}>
                400 Spectrum Center Drive<br/>
                Irvine, CA 92618<br/>
                United States
              </div>
            </div>

            <div style={{background:"#f8f8f8",borderRadius:"14px",padding:"24px",border:"1px solid #eee"}}>
              <div style={{fontSize:"24px",marginBottom:"12px"}}>✉️</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:"#0A2E1F",marginBottom:"6px"}}>Email</div>
              <a href="mailto:admin@flushpin.com" style={{fontSize:"14px",color:"#1D9E75",textDecoration:"none",fontWeight:"600"}}>admin@flushpin.com</a>
              <div style={{fontSize:"12px",color:"#999",marginTop:"6px"}}>We respond within 24 hours</div>
            </div>

            <div style={{background:"#E1F5EE",borderRadius:"14px",padding:"24px",border:"1px solid #9FE1CB"}}>
              <div style={{fontSize:"24px",marginBottom:"12px"}}>🏢</div>
              <div style={{fontSize:"14px",fontWeight:"700",color:"#0A2E1F",marginBottom:"6px"}}>For Businesses</div>
              <div style={{fontSize:"13px",color:"#555",lineHeight:"1.6",marginBottom:"12px"}}>Want to list your business or learn about our business plans?</div>
              <a href="/business" style={{background:"#1D9E75",color:"white",padding:"9px 18px",borderRadius:"8px",textDecoration:"none",fontSize:"13px",fontWeight:"700",display:"inline-block"}}>View business plans →</a>
            </div>
          </div>

          {/* Contact form */}
          <div>
            {sent ? (
              <div style={{background:"#E1F5EE",borderRadius:"16px",padding:"40px 24px",textAlign:"center",border:"1px solid #9FE1CB"}}>
                <div style={{fontSize:"48px",marginBottom:"16px"}}>✅</div>
                <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"22px",fontWeight:"700",color:"#0A2E1F",marginBottom:"10px"}}>Message sent!</h2>
                <p style={{fontSize:"14px",color:"#555",lineHeight:"1.7"}}>Thank you for reaching out. We'll get back to you at <strong>{form.email}</strong> within 24 hours.</p>
                <button onClick={()=>{setSent(false);setForm({name:'',email:'',subject:'',message:''})}} style={{marginTop:"20px",background:"#1D9E75",color:"white",border:"none",padding:"10px 24px",borderRadius:"9px",fontSize:"14px",fontWeight:"600",cursor:"pointer"}}>Send another message</button>
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                <h2 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"20px",fontWeight:"700",color:"#0A2E1F",margin:"0 0 4px"}}>Send us a message</h2>
                
                {[
                  {label:"Your name",key:"name",placeholder:"Jane Smith",type:"text"},
                  {label:"Email address",key:"email",placeholder:"you@example.com",type:"email"},
                  {label:"Subject",key:"subject",placeholder:"e.g. Business listing inquiry",type:"text"},
                ].map(field=>(
                  <div key={field.key}>
                    <label style={{fontSize:"12px",fontWeight:"600",color:"#444",marginBottom:"6px",display:"block"}}>{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e=>setForm(p=>({...p,[field.key]:e.target.value}))}
                      style={{width:"100%",padding:"11px 14px",borderRadius:"9px",border:"1px solid #e0e0e0",fontSize:"14px",outline:"none",boxSizing:"border-box",color:"#1a1a1a",fontFamily:"'Inter',system-ui,sans-serif"}}
                    />
                  </div>
                ))}

                <div>
                  <label style={{fontSize:"12px",fontWeight:"600",color:"#444",marginBottom:"6px",display:"block"}}>Message</label>
                  <textarea
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={e=>setForm(p=>({...p,message:e.target.value}))}
                    style={{width:"100%",padding:"11px 14px",borderRadius:"9px",border:"1px solid #e0e0e0",fontSize:"14px",outline:"none",boxSizing:"border-box",color:"#1a1a1a",resize:"none",height:"120px",fontFamily:"'Inter',system-ui,sans-serif"}}
                  />
                </div>

                <button
                  onClick={()=>{if(form.name&&form.email&&form.message)setSent(true)}}
                  style={{background:"#1D9E75",color:"white",border:"none",padding:"14px",borderRadius:"10px",fontSize:"15px",fontWeight:"700",cursor:"pointer"}}
                >
                  Send message →
                </button>
                <p style={{fontSize:"11px",color:"#aaa",margin:0,textAlign:"center"}}>We'll respond within 24 hours · admin@flushpin.com</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer style={{background:"#0A2E1F",padding:"28px 20px",textAlign:"center"}}>
        <div style={{display:"flex",gap:"20px",justifyContent:"center",flexWrap:"wrap"}}>
          <a href="/privacy" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Privacy Policy</a>
          <a href="/terms" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Terms of Service</a>
          <a href="/contact" style={{color:"#5DCAA5",fontSize:"13px",textDecoration:"none"}}>Contact</a>
        </div>
        <p style={{color:"#2D6A4F",fontSize:"11px",marginTop:"12px"}}>© 2025 FlushPin. All rights reserved.</p>
      </footer>
    </main>
  )
}
