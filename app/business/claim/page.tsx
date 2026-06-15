'use client'
import { useState } from 'react'

const FORMSPREE_ID = 'maqkrnep'

const Logo = () => (
  <img src="/logo.png" alt="FlushPin" className="h-12 w-auto" />
)

type RequestType = 'claim' | 'update' | 'removal'

const requestOptions = [
  {
    type: 'claim' as RequestType,
    icon: '🏢',
    title: 'Claim this listing',
    desc: 'I own this business and want to manage the restroom info.',
    color: '#E1F5EE',
    border: '#1D9E75',
  },
  {
    type: 'update' as RequestType,
    icon: '✏️',
    title: 'Update information',
    desc: 'The access info, PIN, or details are incorrect or outdated.',
    color: '#EEF2FF',
    border: '#6366F1',
  },
  {
    type: 'removal' as RequestType,
    icon: '🗑️',
    title: 'Request removal',
    desc: 'I want this location removed from FlushPin.',
    color: '#FEF2F2',
    border: '#EF4444',
  },
]

export default function ClaimPage() {
  const [requestType, setRequestType] = useState<RequestType | null>(null)
  const [form, setForm] = useState({
    name: '',
    business: '',
    address: '',
    email: '',
    phone: '',
    message: '',
  })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const inputStyle = {
    width: '100%',
    padding: '11px 14px',
    borderRadius: '9px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box' as const,
    color: '#1a1a1a',
    fontFamily: "'Inter',system-ui,sans-serif",
    marginTop: '6px',
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600' as const,
    color: '#444',
    display: 'block' as const,
  }

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.business || !requestType) return
    setSending(true)
    try {
      await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `FlushPin Business ${requestType.toUpperCase()} — ${form.business}`,
          type: requestType,
          name: form.name,
          business: form.business,
          address: form.address,
          email: form.email,
          phone: form.phone || '—',
          message: form.message || '—',
        }),
      })
      setSent(true)
    } catch {
      alert('Something went wrong. Please try again.')
    }
    setSending(false)
  }

  return (
    <main style={{margin:0,padding:0,fontFamily:"'Inter',system-ui,sans-serif",background:"#fff",minHeight:"100vh"}}>

      {/* Nav */}
      <nav style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20}}>
        <Logo />
        <a href="/business" style={{color:"#555",textDecoration:"none",fontSize:"14px",fontWeight:"500"}}>← Back to Business</a>
      </nav>

      <div style={{maxWidth:"600px",margin:"0 auto",padding:"48px 20px 80px"}}>

        {sent ? (
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{fontSize:"64px",marginBottom:"24px"}}>✅</div>
            <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"28px",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px"}}>
              Request received
            </h1>
            <p style={{fontSize:"16px",color:"#555",lineHeight:"1.7",marginBottom:"8px"}}>
              We'll review your request and follow up at <strong>{form.email}</strong> within 1–2 business days.
            </p>
            <p style={{fontSize:"14px",color:"#999",marginBottom:"32px"}}>
              FlushPin is committed to keeping business information accurate and respecting business owner requests.
            </p>
            <a href="/" style={{display:"inline-block",background:"#1D9E75",color:"white",padding:"12px 28px",borderRadius:"10px",fontSize:"15px",fontWeight:"700",textDecoration:"none"}}>
              Back to FlushPin
            </a>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{textAlign:"center",marginBottom:"40px"}}>
              <div style={{display:"inline-block",background:"#E1F5EE",color:"#0F6E56",fontSize:"13px",padding:"6px 18px",borderRadius:"20px",marginBottom:"16px",fontWeight:"600"}}>
                For Business Owners
              </div>
              <h1 style={{fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:"clamp(24px,5vw,36px)",fontWeight:"700",color:"#0A2E1F",marginBottom:"12px",letterSpacing:"-1px"}}>
                Own this location?
              </h1>
              <p style={{fontSize:"16px",color:"#666",lineHeight:"1.7",maxWidth:"480px",margin:"0 auto"}}>
                Claim your listing, update restroom access info, or request removal. We respond within 1–2 business days.
              </p>
            </div>

            {/* Disclaimer */}
            <div style={{background:"#F8FAFC",borderRadius:"12px",padding:"16px 20px",marginBottom:"32px",border:"1px solid #E2E8F0"}}>
              <p style={{fontSize:"13px",color:"#64748B",lineHeight:"1.7",margin:0}}>
                ℹ️ FlushPin displays community-submitted restroom access information. All listings may be claimed, updated, or removed by verified business owners. Information is not guaranteed to be current or accurate.
              </p>
            </div>

            {/* Request Type */}
            <div style={{marginBottom:"32px"}}>
              <p style={{fontSize:"14px",fontWeight:"700",color:"#0A2E1F",marginBottom:"14px"}}>What would you like to do?</p>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {requestOptions.map(opt => (
                  <button
                    key={opt.type}
                    onClick={() => setRequestType(opt.type)}
                    style={{
                      display:"flex",alignItems:"center",gap:"14px",
                      padding:"16px 18px",borderRadius:"12px",
                      border: requestType === opt.type ? `2px solid ${opt.border}` : "2px solid #E5E7EB",
                      background: requestType === opt.type ? opt.color : "white",
                      cursor:"pointer",textAlign:"left",
                      transition:"all 0.15s",
                    }}
                  >
                    <span style={{fontSize:"24px"}}>{opt.icon}</span>
                    <div>
                      <div style={{fontSize:"15px",fontWeight:"700",color:"#0A2E1F"}}>{opt.title}</div>
                      <div style={{fontSize:"13px",color:"#6B7280",marginTop:"2px"}}>{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            {requestType && (
              <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                <div style={{height:"1px",background:"#F0F0F0",margin:"0 0 8px"}} />
                <p style={{fontSize:"14px",fontWeight:"700",color:"#0A2E1F",margin:0}}>Your details</p>

                {[
                  {label:"Your name *",key:"name",placeholder:"John Smith",type:"text"},
                  {label:"Business name *",key:"business",placeholder:"e.g. Starbucks on Culver Dr",type:"text"},
                  {label:"Business address",key:"address",placeholder:"123 Main St, Irvine, CA",type:"text"},
                  {label:"Email address *",key:"email",placeholder:"you@business.com",type:"email"},
                  {label:"Phone (optional)",key:"phone",placeholder:"(949) 555-0123",type:"tel"},
                ].map(field => (
                  <div key={field.key}>
                    <label style={labelStyle}>{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(p => ({...p, [field.key]: e.target.value}))}
                      style={inputStyle}
                    />
                  </div>
                ))}

                <div>
                  <label style={labelStyle}>
                    {requestType === 'removal' ? 'Reason for removal (optional)' :
                     requestType === 'update' ? 'What needs to be updated?' :
                     'Additional notes (optional)'}
                  </label>
                  <textarea
                    placeholder={
                      requestType === 'removal' ? 'e.g. This location is permanently closed.' :
                      requestType === 'update' ? 'e.g. The PIN code is wrong. Current code is 1234.' :
                      'e.g. I am the owner and would like to manage this listing.'
                    }
                    value={form.message}
                    onChange={e => setForm(p => ({...p, message: e.target.value}))}
                    style={{...inputStyle, resize:"none", height:"100px", marginTop:"6px"}}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending || !form.name || !form.email || !form.business}
                  style={{
                    background: sending ? "#ccc" : "#1D9E75",
                    color:"white",border:"none",
                    padding:"15px",borderRadius:"11px",
                    fontSize:"15px",fontWeight:"700",cursor:"pointer",
                    opacity: (!form.name || !form.email || !form.business) ? 0.5 : 1,
                  }}
                >
                  {sending ? 'Sending...' : 'Submit request →'}
                </button>

                <p style={{fontSize:"12px",color:"#aaa",textAlign:"center",margin:0}}>
                  We respond within 1–2 business days. Your information is kept private.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <footer style={{background:"#0A2E1F",padding:"24px 20px",textAlign:"center"}}>
        <div style={{fontSize:"13px",color:"#5DCAA5",marginBottom:"4px"}}>FlushPin — Business Owner Portal</div>
        <div style={{fontSize:"11px",color:"#2D6A4F"}}>
          <a href="/terms" style={{color:"#2D6A4F",textDecoration:"none",marginRight:"12px"}}>Terms of Service</a>
          <a href="/privacy" style={{color:"#2D6A4F",textDecoration:"none"}}>Privacy Policy</a>
        </div>
      </footer>

    </main>
  )
}
