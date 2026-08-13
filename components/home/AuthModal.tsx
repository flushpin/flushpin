'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/LanguageContext'
import {
  formatEmailTemplate,
  isAlreadyRegisteredError,
  isUnconfirmedEmailError,
} from '../../lib/auth-errors'
import AuthShell, {
  PROFILE_COLORS,
  authInputClass,
  authPrimaryButtonClass,
  authTitleClass,
} from '../auth/AuthShell'
import AuthStatus from '../auth/AuthStatus'
import GoogleSignInButton from '../auth/GoogleSignInButton'
import AppleSignInButton from '../auth/AppleSignInButton'
import { signInWithAppleOAuth } from '../../lib/appleAuth'
import ShareFlushPin from '../share/ShareFlushPin'

type AuthModalProps = {
  open: boolean
  mode: 'signin' | 'signup'
  onClose: () => void
  onModeChange: (mode: 'signin' | 'signup') => void
}

export default function AuthModal({ open, mode, onClose, onModeChange }: AuthModalProps) {
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [selectedColor, setSelectedColor] = useState('#00A886')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [statusKind, setStatusKind] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [view, setView] = useState<'form' | 'confirm'>('form')
  const [pendingEmail, setPendingEmail] = useState('')

  const resetModalState = () => {
    setView('form')
    setMessage('')
    setStatusKind('idle')
    setLoading(false)
  }

  const handleClose = () => {
    resetModalState()
    onClose()
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // handleClose resets local UI then calls onClose — intentional on Escape.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avoid rebinding on every render
  }, [open, onClose])

  if (!open) return null

  const setError = (text: string) => {
    setStatusKind('error')
    setMessage(text)
  }

  const handleGoogleSignIn = async () => {
    setStatusKind('loading')
    setMessage('Connecting to Google…')
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${origin}/map` },
    })
    if (error) setError(error.message)
  }

  const handleAppleSignIn = async () => {
    setLoading(true)
    setStatusKind('loading')
    setMessage('Connecting to Apple…')
    const { error } = await signInWithAppleOAuth()
    if (error) {
      setError(error)
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setError(t.home.enterFullName)
      return
    }
    setLoading(true)
    setStatusKind('loading')
    setMessage('Creating your account…')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), profile_color: selectedColor } },
    })
    if (error) {
      setError(isAlreadyRegisteredError(error) ? t.home.emailRegistered : error.message)
    } else {
      if (data.session) await supabase.auth.signOut()
      setPendingEmail(email)
      setView('confirm')
      setStatusKind('success')
      setMessage('')
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setStatusKind('loading')
    setMessage('Signing you in…')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(isUnconfirmedEmailError(error) ? t.home.confirmEmailRequired : error.message)
    } else if (data.session) {
      setStatusKind('success')
      setMessage('Signed in')
      onClose()
    }
    setLoading(false)
  }

  const handleBackToSignIn = () => {
    setView('form')
    setMessage('')
    setStatusKind('idle')
    setPassword('')
    onModeChange('signin')
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#1b1b21]/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="max-h-[min(92vh,880px)] w-full overflow-y-auto sm:w-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <AuthShell
          onClose={handleClose}
          closeLabel={t.home.close}
          showLanguage={false}
          logoHref=""
          className="mx-auto max-h-[min(92vh,880px)] rounded-b-none sm:rounded-[28px]"
        >
          {view === 'confirm' ? (
            <div className="text-center">
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700"
                aria-hidden="true"
              >
                ✓
              </div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-fp-teal">
                {t.home.authAccountLabel}
              </p>
              <h2 id="auth-modal-title" className={`${authTitleClass} mb-3`}>
                {t.home.confirmAlmostDone}
              </h2>
              <AuthStatus
                kind="success"
                message={formatEmailTemplate(t.home.confirmEmailSent, pendingEmail)}
              />
              <div className="mt-5 text-left">
                <ShareFlushPin surface="signup_success" variant="compact" />
              </div>
              <button type="button" onClick={handleBackToSignIn} className={`${authPrimaryButtonClass} mt-6`}>
                {t.home.backToSignIn}
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-fp-teal">
                {t.home.authAccountLabel}
              </p>
              <h2 id="auth-modal-title" className={`${authTitleClass} mb-2`}>
                {mode === 'signup' ? t.joinFlushPin : t.welcomeBack}
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-fp-gray-600">
                {mode === 'signup'
                  ? 'Create a free account to save PINs and share updates.'
                  : 'Sign in to continue finding restrooms near you.'}
              </p>

              <div className="flex flex-col gap-3">
                <GoogleSignInButton
                  onClick={() => handleGoogleSignIn()}
                  disabled={loading}
                  label={t.continueGoogle}
                />
                <AppleSignInButton
                  onClick={() => void handleAppleSignIn()}
                  disabled={loading}
                  label={t.continueApple}
                />
              </div>

              <div className="my-5 flex items-center gap-3" aria-hidden="true">
                <div className="h-px flex-1 bg-fp-border" />
                <span className="text-xs font-medium uppercase tracking-wide text-fp-gray-400">or</span>
                <div className="h-px flex-1 bg-fp-border" />
              </div>

              <div className="flex flex-col gap-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label htmlFor="auth-full-name" className="mb-2 block text-sm font-semibold text-fp-ink">
                        {t.fullName}
                      </label>
                      <input
                        id="auth-full-name"
                        className={authInputClass}
                        placeholder={t.home.namePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        autoComplete="name"
                      />
                    </div>
                    <div>
                      <span className="mb-2 block text-sm font-semibold text-fp-ink">{t.home.profileColor}</span>
                      <div className="flex flex-wrap gap-2.5" role="listbox" aria-label={t.home.profileColor}>
                        {PROFILE_COLORS.map((color) => {
                          const selected = selectedColor === color.hex
                          return (
                            <button
                              key={color.id}
                              type="button"
                              role="option"
                              aria-selected={selected}
                              title={color.label}
                              onClick={() => setSelectedColor(color.hex)}
                              className="h-9 w-9 rounded-full transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal"
                              style={{
                                background: color.hex,
                                boxShadow: selected
                                  ? '0 0 0 3px #fff, 0 0 0 5px #1b1b21'
                                  : '0 0 0 2px transparent',
                                transform: selected ? 'scale(1.06)' : undefined,
                              }}
                              aria-label={color.label}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="auth-email" className="mb-2 block text-sm font-semibold text-fp-ink">
                    {t.email}
                  </label>
                  <input
                    id="auth-email"
                    type="email"
                    className={authInputClass}
                    placeholder={t.home.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className="mb-2 block text-sm font-semibold text-fp-ink">
                    {t.password}
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    className={authInputClass}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>

                <AuthStatus
                  kind={loading ? 'loading' : statusKind === 'error' ? 'error' : statusKind}
                  message={message}
                />

                <button
                  type="button"
                  onClick={mode === 'signup' ? handleSignUp : handleSignIn}
                  disabled={loading}
                  className={authPrimaryButtonClass}
                >
                  {loading ? (mode === 'signup' ? 'Creating…' : 'Signing in…') : mode === 'signup' ? t.createAccount : t.signIn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onModeChange(mode === 'signup' ? 'signin' : 'signup')
                    setMessage('')
                    setStatusKind('idle')
                  }}
                  className="bg-transparent text-center text-sm font-semibold text-fp-teal hover:text-fp-teal-dark"
                >
                  {mode === 'signup' ? t.home.alreadyHaveAccount : t.home.needAccount}
                </button>

                {mode === 'signin' ? (
                  <a
                    href="/signup?view=forgot"
                    className="text-center text-sm font-medium text-fp-gray-400 no-underline hover:text-fp-ink"
                    onClick={handleClose}
                  >
                    {t.signup.forgotPassword}
                  </a>
                ) : null}
              </div>
            </>
          )}
        </AuthShell>
      </div>
    </div>
  )
}
