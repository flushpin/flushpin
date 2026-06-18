'use client'
import { useState } from 'react'
import Logo from '../../components/Logo'
import { supabase } from '../../lib/supabase'
const COLORS = [
  {id:'emerald',hex:'#10B981',label:'Emerald'},
  {id:'sky',hex:'#0EA5E9',label:'Sky'},
  {id:'violet',hex:'#8B5CF6',label:'Violet'},
  {id:'rose',hex:'#F43F5E',label:'Rose'},
  {id:'amber',hex:'#F59E0B',label:'Amber'},
  {id:'slate',hex:'#64748B',label:'Slate'},
  {id:'teal',hex:'#1D9E75',label:'Teal'},
  {id:'pride',hex:'linear-gradient(135deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#C77DFF)',label:'Pride'},
]
export default function SignUp() {
  const [screen, setScreen] = useState('main')
  const [selectedColor, setSelectedColor] = useState('teal')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const handleOAuthSignIn = async (provider: 'google') => {
    setMessage('')
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    if (error) setMessage(error.message)
  }
  const SignupLogo = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
      <Logo height={36} />
    </div>
  )
  const card = {background:'white',borderRadius:'20px',padding:'40px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 24px rgba(0,0,0,0.08)'}
  const wrap = {minHeight:'100vh',background:'#f8f9fa',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px',fontFamily:"'Inter',system-ui,sans-serif"}
  const input = {width:'100%',padding:'14px 16px',borderRadius:'10px',border:'1.5px solid #e5e5e5',fontSize:'15px',marginBottom:'12px',outline:'none',boxSizing:'border-box' as const}
  const btnGreen = {width:'100%',background:'#1D9E75',color:'white',border:'none',padding:'14px',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',marginBottom:'14px'}
  const h2style = {fontFamily:"'Space Grotesk','Inter',sans-serif",fontSize:'24px',fontWeight:'700',color:'#0A2E1F',textAlign:'center' as const,marginBottom:'8px',letterSpacing:'-0.5px'}
  if (screen==='forgot') return (
    <main style={wrap}>
      <div style={card}>
        <SignupLogo/>
        <h2 style={h2style}>Reset your password</h2>
        <p style={{color:'#888',fontSize:'14px',textAlign:'center',marginBottom:'28px',lineHeight:'1.6'}}>Enter your email and we will send you a reset link.</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" style={input}/>
        <button style={btnGreen}>Send reset link</button>
        <button onClick={()=>setScreen('email')} style={{width:'100%',background:'transparent',border:'none',color:'#888',fontSize:'14px',cursor:'pointer'}}>Back to sign in</button>
      </div>
    </main>
  )
  if (screen==='email') return (
    <main style={wrap}>
      <div style={card}>
        <SignupLogo/>
        <h2 style={h2style}>Create your account</h2>
        <p style={{color:'#888',fontSize:'14px',textAlign:'center',marginBottom:'24px'}}>Join FlushPin. It is free.</p>
        <p style={{fontSize:'11px',fontWeight:'600',color:'#bbb',letterSpacing:'1px',marginBottom:'12px'}}>PICK YOUR COLOR</p>
        <div style={{display:'flex',gap:'10px',flexWrap:'wrap',marginBottom:'22px'}}>
          {COLORS.map(c=>(<div key={c.id} onClick={()=>setSelectedColor(c.id)} title={c.label} style={{width:'32px',height:'32px',borderRadius:'50%',cursor:'pointer',background:c.hex,border:selectedColor===c.id?'3px solid #0A2E1F':'3px solid transparent',boxSizing:'border-box',flexShrink:0}}/>))}
        </div>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={input}/>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email address" style={input}/>
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" style={{...input,marginBottom:'20px'}}/>
        <button style={{...btnGreen,marginBottom:'16px'}}>Create account</button>
        <p style={{textAlign:'center',fontSize:'13px',color:'#888'}}>Already have an account? <span onClick={()=>setScreen('main')} style={{color:'#1D9E75',cursor:'pointer',fontWeight:'600'}}>Sign in</span></p>
      </div>
    </main>
  )
  return (
    <main style={wrap}>
      <div style={card}>
        <SignupLogo/>
        <h2 style={{...h2style,fontSize:'26px'}}>Welcome to FlushPin</h2>
        <p style={{color:'#888',fontSize:'14px',textAlign:'center',marginBottom:'32px',lineHeight:'1.6'}}>Find restroom PINs and cleanliness scores near you.</p>
        <div style={{display:'flex',flexDirection:'column',gap:'12px',marginBottom:'24px'}}>
          <button onClick={() => handleOAuthSignIn('google')} style={{width:'100%',background:'white',border:'1.5px solid #e5e5e5',borderRadius:'11px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px',color:'#333'}}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
        {message && <p style={{fontSize:'13px',color:'#DC2626',fontWeight:'700',textAlign:'center',margin:'-10px 0 18px'}}>{message}</p>}
        <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'24px'}}>
          <div style={{flex:1,height:'1px',background:'#f0f0f0'}}/>
          <span style={{color:'#ccc',fontSize:'13px'}}>or</span>
          <div style={{flex:1,height:'1px',background:'#f0f0f0'}}/>
        </div>
        <button onClick={()=>setScreen('email')} style={{width:'100%',background:'#f8f8f8',border:'1.5px solid #e5e5e5',borderRadius:'11px',padding:'14px',fontSize:'15px',fontWeight:'600',cursor:'pointer',color:'#333',marginBottom:'16px'}}>Sign up with email</button>
        <p style={{textAlign:'center',fontSize:'13px',color:'#888',marginBottom:'8px'}}>Already have an account? <span style={{color:'#1D9E75',cursor:'pointer',fontWeight:'600'}}>Sign in</span></p>
        <p onClick={()=>setScreen('forgot')} style={{textAlign:'center',fontSize:'13px',color:'#bbb',cursor:'pointer'}}>Forgot your password?</p>
      </div>
    </main>
  )
}
