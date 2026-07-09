'use client'

import { useState } from 'react'
import Logo from '../../components/Logo'
import LanguageToggle from '../../components/LanguageToggle'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/LanguageContext'
import {
  formatEmailTemplate,
  isAlreadyRegisteredError,
  isUnconfirmedEmailError,
} from '../../lib/auth-errors'

const COLORS = [
  { id: 'emerald', hex: '#10B981', label: 'Emerald' },
  { id: 'sky', hex: '#0EA5E9', label: 'Sky' },
  { id: 'violet', hex: '#8B5CF6', label: 'Violet' },
  { id: 'rose', hex: '#F43F5E', label: 'Rose' },
  { id: 'amber', hex: '#F59E0B', label: 'Amber' },
  { id: 'slate', hex: '#64748B', label: 'Slate' },
  { id: 'teal', hex: '#1D9E75', label: 'Teal' },
  { id: 'pride', hex: 'linear-gradient(135deg,#FF6B6B,#FFD93D,#6BCB77,#4D96FF,#C77DFF)', label: 'Pride' },
]

type Screen = 'main' | 'email' | 'signin' | 'confirm' | 'forgot'

export default function SignUp() {
  const { t } = useLang()
  const s = t.signup
  const [screen, setScreen] = useState<Screen>('main')
  const [selectedColor, setSelectedColor] = useState('teal')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')

  const selectedColorHex = COLORS.find((c) => c.id === selectedColor)?.hex ?? '#1D9E75'

  const handleOAuthSignIn = async (provider: 'google') => {
    setMessage('')
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    if (error) setMessage(error.message)
  }

  const handleSignUp = async () => {
    if (!name.trim()) {
      setMessage(t.home.enterFullName)
      return
    }
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name.trim(),
          profile_color: selectedColorHex,
        },
      },
    })
    if (error) {
      setMessage(isAlreadyRegisteredError(error) ? t.home.emailRegistered : error.message)
    } else {
      if (data.session) await supabase.auth.signOut()
      setPendingEmail(email)
      setScreen('confirm')
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(isUnconfirmedEmailError(error) ? s.confirmEmailRequired : error.message)
    } else if (data.session) {
      window.location.href = '/map'
    }
    setLoading(false)
  }

  const SignupLogo = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
      <Logo height={36} />
    </div>
  )

  const LangBar = () => (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
      <LanguageToggle />
    </div>
  )

  const card = { background: 'white', borderRadius: '20px', padding: '40px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }
  const wrap = { minHeight: '100vh', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: "'Inter',system-ui,sans-serif" }
  const input = { width: '100%', padding: '14px 16px', borderRadius: '10px', border: '1.5px solid #e5e5e5', fontSize: '15px', marginBottom: '12px', outline: 'none', boxSizing: 'border-box' as const }
  const btnGreen = { width: '100%', background: '#1D9E75', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginBottom: '14px' }
  const h2style = { fontFamily: "'Space Grotesk','Inter',sans-serif", fontSize: '24px', fontWeight: '700', color: '#0A2E1F', textAlign: 'center' as const, marginBottom: '8px', letterSpacing: '-0.5px' }
  const errorStyle = { fontSize: '13px', color: '#DC2626', fontWeight: '700', textAlign: 'center' as const, marginBottom: '14px', lineHeight: '1.5' }

  if (screen === 'confirm') {
    return (
      <main style={wrap}>
        <div style={card}>
          <LangBar />
          <SignupLogo />
          <h2 style={h2style}>{s.confirmAlmostDone}</h2>
          <p style={{ color: '#555', fontSize: '15px', textAlign: 'center', marginBottom: '28px', lineHeight: '1.6' }}>
            {formatEmailTemplate(s.confirmEmailSent, pendingEmail)}
          </p>
          <button
            type="button"
            onClick={() => {
              setPassword('')
              setMessage('')
              setScreen('signin')
            }}
            style={{ ...btnGreen, marginBottom: 0 }}
          >
            {s.backToSignIn}
          </button>
        </div>
      </main>
    )
  }

  if (screen === 'forgot') {
    return (
      <main style={wrap}>
        <div style={card}>
          <LangBar />
          <SignupLogo />
          <h2 style={h2style}>{s.resetTitle}</h2>
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '28px', lineHeight: '1.6' }}>{s.resetDesc}</p>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder={s.yourEmail} style={input} />
          <button type="button" style={btnGreen}>{s.sendReset}</button>
          <button type="button" onClick={() => setScreen('signin')} style={{ width: '100%', background: 'transparent', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer' }}>{s.backToSignIn}</button>
        </div>
      </main>
    )
  }

  if (screen === 'signin') {
    return (
      <main style={wrap}>
        <div style={card}>
          <LangBar />
          <SignupLogo />
          <h2 style={h2style}>{t.welcomeBack}</h2>
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>{s.welcomeDesc}</p>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={s.emailAddress} style={input} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={s.password} style={{ ...input, marginBottom: '20px' }} />
          {message && <p style={errorStyle}>{message}</p>}
          <button type="button" onClick={handleSignIn} disabled={loading} style={{ ...btnGreen, marginBottom: '16px', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : s.signIn}
          </button>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
            <span onClick={() => { setMessage(''); setScreen('email') }} style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: '600' }}>{t.home.needAccount}</span>
          </p>
          <p onClick={() => setScreen('forgot')} style={{ textAlign: 'center', fontSize: '13px', color: '#bbb', cursor: 'pointer' }}>{s.forgotPassword}</p>
        </div>
      </main>
    )
  }

  if (screen === 'email') {
    return (
      <main style={wrap}>
        <div style={card}>
          <LangBar />
          <SignupLogo />
          <h2 style={h2style}>{s.createTitle}</h2>
          <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>{s.createDesc}</p>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#bbb', letterSpacing: '1px', marginBottom: '12px' }}>{s.pickColor}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '22px' }}>
            {COLORS.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                title={c.label}
                style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', background: c.hex, border: selectedColor === c.id ? '3px solid #0A2E1F' : '3px solid transparent', boxSizing: 'border-box', flexShrink: 0 }}
              />
            ))}
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={s.yourName} style={input} />
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder={s.emailAddress} style={input} />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={s.password} style={{ ...input, marginBottom: '20px' }} />
          {message && <p style={errorStyle}>{message}</p>}
          <button type="button" onClick={handleSignUp} disabled={loading} style={{ ...btnGreen, marginBottom: '16px', opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : s.createAccount}
          </button>
          <p style={{ textAlign: 'center', fontSize: '13px', color: '#888' }}>
            {s.alreadyHave}{' '}
            <span onClick={() => { setMessage(''); setScreen('signin') }} style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: '600' }}>{s.signIn}</span>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main style={wrap}>
      <div style={card}>
        <LangBar />
        <SignupLogo />
        <h2 style={{ ...h2style, fontSize: '26px' }}>{s.welcomeTitle}</h2>
        <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '32px', lineHeight: '1.6' }}>{s.welcomeDesc}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => handleOAuthSignIn('google')} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e5e5', borderRadius: '11px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#333' }}>
            <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            {t.continueGoogle}
          </button>
        </div>
        {message && <p style={{ ...errorStyle, margin: '-10px 0 18px' }}>{message}</p>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          <span style={{ color: '#ccc', fontSize: '13px' }}>{s.or}</span>
          <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
        </div>
        <button onClick={() => setScreen('email')} style={{ width: '100%', background: '#f8f8f8', border: '1.5px solid #e5e5e5', borderRadius: '11px', padding: '14px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', color: '#333', marginBottom: '16px' }}>{s.signUpWithEmail}</button>
        <p style={{ textAlign: 'center', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
          {s.alreadyHave}{' '}
          <span onClick={() => setScreen('signin')} style={{ color: '#1D9E75', cursor: 'pointer', fontWeight: '600' }}>{s.signIn}</span>
        </p>
        <p onClick={() => setScreen('forgot')} style={{ textAlign: 'center', fontSize: '13px', color: '#bbb', cursor: 'pointer' }}>{s.forgotPassword}</p>
      </div>
    </main>
  )
}
