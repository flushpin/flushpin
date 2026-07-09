'use client'

import { useEffect, useState } from 'react'
import Logo from '../Logo'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/LanguageContext'
import {
  formatEmailTemplate,
  isAlreadyRegisteredError,
  isUnconfirmedEmailError,
} from '../../lib/auth-errors'

const COLOR_OPTIONS = [
  '#E74C3C', '#E67E22', '#F1C40F', '#2ECC71', '#1ABC9C',
  '#3498DB', '#9B59B6', '#E91E63', '#FF5722', '#00BCD4',
  '#8BC34A', '#FF9800', '#795548', '#607D8B', '#0A2E1F',
]

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
  const [view, setView] = useState<'form' | 'confirm'>('form')
  const [pendingEmail, setPendingEmail] = useState('')

  useEffect(() => {
    if (!open) {
      setView('form')
      setMessage('')
    }
  }, [open])

  if (!open) return null

  const handleOAuthSignIn = async (provider: 'google') => {
    setMessage('')
    const redirectTo = typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })
    if (error) setMessage(error.message)
  }

  const handleSignUp = async () => {
    if (!fullName.trim()) {
      setMessage(t.home.enterFullName)
      return
    }
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim(), profile_color: selectedColor } },
    })
    if (error) {
      setMessage(isAlreadyRegisteredError(error) ? t.home.emailRegistered : error.message)
    } else {
      if (data.session) await supabase.auth.signOut()
      setPendingEmail(email)
      setView('confirm')
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setMessage('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(isUnconfirmedEmailError(error) ? t.home.confirmEmailRequired : error.message)
    } else if (data.session) {
      onClose()
      setMessage('')
    }
    setLoading(false)
  }

  const handleBackToSignIn = () => {
    setView('form')
    setMessage('')
    setPassword('')
    onModeChange('signin')
  }

  const inputClass =
    'w-full rounded-lg border border-fp-border px-4 py-3 text-base text-fp-ink outline-none focus:ring-2 focus:ring-fp-teal'

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-fp-ink/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="fp-card max-h-[92vh] w-full max-w-md overflow-y-auto bg-fp-white"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        <div className="flex items-center justify-between border-b border-fp-border px-6 py-4">
          <Logo height={34} href="" />
          <button
            type="button"
            aria-label={t.home.close}
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-fp-border text-fp-gray-600 hover:text-fp-ink"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-6">
          {view === 'confirm' ? (
            <div className="text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fp-teal">
                {t.home.authAccountLabel}
              </p>
              <h2 id="auth-modal-title" className="mb-4 text-2xl font-bold text-fp-ink">
                {t.home.confirmAlmostDone}
              </h2>
              <p className="mb-8 text-sm leading-relaxed text-fp-gray-600">
                {formatEmailTemplate(t.home.confirmEmailSent, pendingEmail)}
              </p>
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="w-full rounded-lg bg-fp-teal px-4 py-3 text-base font-semibold text-white hover:bg-fp-teal-dark"
              >
                {t.home.backToSignIn}
              </button>
            </div>
          ) : (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-fp-teal">
                {t.home.authAccountLabel}
              </p>
              <h2 id="auth-modal-title" className="mb-6 text-2xl font-bold text-fp-ink">
                {mode === 'signup' ? t.joinFlushPin : t.welcomeBack}
              </h2>

              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                className="mb-5 w-full rounded-lg border border-fp-border bg-fp-white px-4 py-3 text-sm font-semibold text-fp-ink hover:border-fp-teal"
              >
                {t.continueGoogle}
              </button>

              <div className="flex flex-col gap-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label htmlFor="auth-full-name" className="mb-2 block text-sm font-semibold text-fp-ink">
                        {t.fullName}
                      </label>
                      <input
                        id="auth-full-name"
                        className={inputClass}
                        placeholder={t.home.namePlaceholder}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <span className="mb-2 block text-sm font-semibold text-fp-ink">{t.home.profileColor}</span>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setSelectedColor(color)}
                            className="h-8 w-8 rounded-full"
                            style={{
                              background: color,
                              border: selectedColor === color ? '3px solid var(--fp-ink)' : '3px solid transparent',
                            }}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
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
                    className={inputClass}
                    placeholder={t.home.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="auth-password" className="mb-2 block text-sm font-semibold text-fp-ink">
                    {t.password}
                  </label>
                  <input
                    id="auth-password"
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                {message && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{message}</p>
                )}

                <button
                  type="button"
                  onClick={mode === 'signup' ? handleSignUp : handleSignIn}
                  disabled={loading}
                  className="rounded-lg bg-fp-teal px-4 py-3 text-base font-semibold text-white hover:bg-fp-teal-dark disabled:opacity-70"
                >
                  {loading ? '...' : mode === 'signup' ? t.createAccount : t.signIn}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onModeChange(mode === 'signup' ? 'signin' : 'signup')
                    setMessage('')
                  }}
                  className="bg-transparent text-sm font-semibold text-fp-teal hover:text-fp-teal-dark"
                >
                  {mode === 'signup' ? t.home.alreadyHaveAccount : t.home.needAccount}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
