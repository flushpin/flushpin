'use client'
import { useState } from 'react'
import Logo from '../../components/Logo'
import { supabase } from '../../lib/supabase'

function getEmailTrust(email: string): 'generic' | 'business' {
  const genericDomains = ['gmail.com','yahoo.com','hotmail.com','outlook.com','aol.com','icloud.com','me.com','mac.com']
  const domain = email.split('@')[1]?.toLowerCase()
  return genericDomains.includes(domain) ? 'generic' : 'business'
}

export default function OptOutPage() {
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    contact_title: '',
    city: '',
    email: '',
    reason: '',
    authorized: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setError('')
    if (!form.business_name || !form.contact_name || !form.email || !form.city) {
      setError('Please fill in all required fields.')
      return
    }
    if (!form.authorized) {
      setError('Please confirm that you are authorized to act on behalf of this business.')
      return
    }

    setLoading(true)

    const trust = getEmailTrust(form.email)
    const status = 'pending'

    await supabase.from('optout_requests').insert({
      business_name: form.business_name.trim(),
      contact_name: form.contact_name.trim(),
      contact_title: form.contact_title.trim(),
      city: form.city.trim(),
      email: form.email.trim(),
      reason: form.reason.trim(),
      status,
      email_trust: trust,
    })

    await supabase.from('restroom')
      .update({ opt_out: true, status: 'opted_out' })
      .ilike('name', `%${form.business_name.trim()}%`)

    setLoading(false)
    setSubmitted(true)
  }

  const inputStyle = {
    width:'100%', padding:'11px 14px', borderRadius:'9px',
    border:'1px solid #e0e0e0', fontSize:'14px',
    fontFamily:"'Inter',system-ui,sans-serif", outline:'none',
    boxSizing:'border-box' as const, color:'#1a1a1a', background:'white'
  }
  const labelStyle = { fontSize:'12px', fontWeight:'600' as const, color:'#444', marginBottom:'6px', display:'block' as const }

  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#f8f9fa",minHeight:"100vh"}}>

      {/* NAV */}
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20}}>
        <Logo height={32} />
        <a href="/" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>← Back to home</a>
      </nav>

      <div style={{maxWidth:"660px",margin:"0 auto",padding:"40px 20px 80px"}}>

        {submitted ? (
          <div style={{background:"white",borderRadius:"18px",padding:"40px 28px",textAlign:"center",boxShadow:"0 2px 12px rgba(0,0,0,0.06)"}}>
            <div style={{fontSize:"56px",marginBottom:"16px"}}>✅</div>
            <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"26px",fontWeight:"700",color:"#0A2E1F",marginBottom:"14px"}}>Request received</h1>
            <div style={{background:"#E1F5EE",borderRadius:"12px",padding:"20px",marginBottom:"20px",border:"1px solid #9FE1CB",textAlign:"left"}}>
              <p style={{fontSize:"14px",color:"#0F6E56",fontWeight:"700",margin:"0 0 8px"}}>Status: Pending verification</p>
              <p style={{fontSize:"14px",color:"#555",lineHeight:"1.7",margin:0}}>
                <strong>{form.business_name}</strong> will be marked as <strong>"Restroom not publicly available"</strong> on FlushPin. Our team will verify your request and update the listing accordingly.
              </p>
            </div>
            {getEmailTrust(form.email) === 'business' && (
              <div style={{background:"#EEF2FF",borderRadius:"10px",padding:"14px",marginBottom:"16px",border:"1px solid #C7D2FE"}}>
                <p style={{fontSize:"13px",color:"#4338CA",margin:0,fontWeight:"600"}}>🏢 Business domain detected — higher trust request</p>
              </div>
            )}
            <p style={{fontSize:"13px",color:"#999",lineHeight:"1.7"}}>
              A confirmation has been logged for <strong>{form.email}</strong>. To reverse this decision, contact <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{marginBottom:"28px"}}>
              <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(24px,5vw,34px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>Business Opt-Out</h1>
              <p style={{fontSize:"15px",color:"#666",lineHeight:"1.7",margin:0}}>
                If you prefer your business restroom not to be listed on FlushPin, submit this form. Your listing will be updated to show <strong>"Restroom not publicly available"</strong> — your business remains on the map but users will not be directed there for restroom access.
              </p>
            </div>

            {/* Legal notice */}
            <div style={{background:"#FEF3C7",borderRadius:"12px",padding:"16px 18px",marginBottom:"24px",border:"1px solid #FCD34D"}}>
              <p style={{fontSize:"13px",color:"#92400E",margin:0,lineHeight:"1.7"}}>
                ⚖️ <strong>Legal notice:</strong> By submitting this request, you represent and warrant that you are an authorized representative of the business. FlushPin reserves the right to verify ownership or management authority before updating any listing.
              </p>
            </div>

            {/* Form */}
            <div style={{background:"white",borderRadius:"18px",padding:"28px",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",display:"flex",flexDirection:"column",gap:"16px"}}>

              <div>
                <label style={labelStyle}>Business Name *</label>
                <input style={inputStyle} placeholder="e.g. Starbucks on Culver Dr, Irvine" value={form.business_name} onChange={e=>setForm(p=>({...p,business_name:e.target.value}))}/>
              </div>

              <div>
                <label style={labelStyle}>City *</label>
                <input style={inputStyle} placeholder="e.g. Irvine, CA" value={form.city} onChange={e=>setForm(p=>({...p,city:e.target.value}))}/>
              </div>

              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px"}}>
                <div>
                  <label style={labelStyle}>Your Full Name *</label>
                  <input style={inputStyle} placeholder="Jane Smith" value={form.contact_name} onChange={e=>setForm(p=>({...p,contact_name:e.target.value}))}/>
                </div>
                <div>
                  <label style={labelStyle}>Your Title</label>
                  <input style={inputStyle} placeholder="Owner, Manager, GM..." value={form.contact_title} onChange={e=>setForm(p=>({...p,contact_title:e.target.value}))}/>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Email Address *</label>
                <input style={inputStyle} type="email" placeholder="you@yourbusiness.com" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/>
                {form.email && form.email.includes('@') && (
                  <p style={{fontSize:"11px",margin:"6px 0 0",color:getEmailTrust(form.email)==='business'?'#4338CA':'#D97706',fontWeight:"600"}}>
                    {getEmailTrust(form.email)==='business'?'🏢 Business domain — higher trust':'⚠️ Personal email — request may require additional verification'}
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Reason</label>
                <textarea
                  placeholder="e.g. Employees only, customers only, temporary closure, security concerns, private facility, under renovation..."
                  value={form.reason}
                  onChange={e=>setForm(p=>({...p,reason:e.target.value}))}
                  style={{...inputStyle, resize:'none', height:'90px'}}
                />
              </div>

              {/* Authorization checkbox */}
              <div style={{background:"#f8f8f8",borderRadius:"10px",padding:"14px 16px",border:"1px solid #eee"}}>
                <label style={{display:"flex",alignItems:"flex-start",gap:"12px",cursor:"pointer"}}>
                  <input
                    type="checkbox"
                    checked={form.authorized}
                    onChange={e=>setForm(p=>({...p,authorized:e.target.checked}))}
                    style={{width:"18px",height:"18px",marginTop:"2px",cursor:"pointer",flexShrink:0,accentColor:"#1D9E75"}}
                  />
                  <span style={{fontSize:"13px",color:"#444",lineHeight:"1.6"}}>
                    <strong>I confirm that I am authorized to act on behalf of this business</strong> and that the information provided is accurate. I understand this request will be officially logged.
                  </span>
                </label>
              </div>

              {/* Disclaimer */}
              <div style={{borderTop:"1px solid #f0f0f0",paddingTop:"14px"}}>
                <p style={{fontSize:"12px",color:"#aaa",margin:0,lineHeight:"1.7"}}>
                  ℹ️ FlushPin does not guarantee restroom access. Information is community-based and may change at any time. Opt-out requests are reviewed and processed within 2 business days.
                </p>
              </div>

              {error && (
                <div style={{background:"#FEE2E2",borderRadius:"9px",padding:"12px 14px",border:"1px solid #FCA5A5"}}>
                  <p style={{fontSize:"13px",color:"#DC2626",margin:0,fontWeight:"600"}}>{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{background:"#1D9E75",color:"white",border:"none",padding:"15px",borderRadius:"10px",fontSize:"15px",fontWeight:"700",cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1}}
              >
                {loading ? 'Submitting...' : 'Submit opt-out request →'}
              </button>

              <p style={{fontSize:"12px",color:"#aaa",textAlign:"center",margin:0}}>
                Questions? <a href="mailto:admin@flushpin.com" style={{color:"#1D9E75"}}>admin@flushpin.com</a>
              </p>
            </div>
          </>
        )}
      </div>

    </main>
  )
}
