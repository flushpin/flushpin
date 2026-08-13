'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../../lib/supabase'
import { useLang } from '../../lib/LanguageContext'
import {
  formatEmailTemplate,
  isAlreadyRegisteredError,
  isUnconfirmedEmailError,
} from '../../lib/auth-errors'
import { validatePasswordConfirmation } from '../../lib/authPassword'
import {
  cleanAuthParamsFromUrl,
  getPasswordResetRedirectUrl,
  isPasswordRecoveryEvent,
  isRecoveryHash,
  isRecoverySearch,
} from '../../lib/authRecovery'
import AuthShell, {
  PROFILE_COLORS,
  authInputClass,
  authPrimaryButtonClass,
  authSecondaryButtonClass,
  authTitleClass,
} from '../../components/auth/AuthShell'
import AuthStatus from '../../components/auth/AuthStatus'
import GoogleSignInButton from '../../components/auth/GoogleSignInButton'
import ShareFlushPin from '../../components/share/ShareFlushPin'

type Screen = 'main' | 'email' | 'signin' | 'confirm' | 'forgot' | 'update'

function AuthPage({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,#f4fbf9_0%,#ffffff_48%,#f7faf9_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-fp-teal/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[#b8ebe0]/35 blur-3xl"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[420px]">{children}</div>
    </main>
  )
}

function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3" aria-hidden="true">
      <div className="h-px flex-1 bg-fp-border" />
      <span className="text-xs font-medium uppercase tracking-wide text-fp-gray-400">{label}</span>
      <div className="h-px flex-1 bg-fp-border" />
    </div>
  )
}

function TextLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-semibold text-fp-teal hover:text-fp-teal-dark"
    >
      {children}
    </button>
  )
}

export default function SignUp() {
  const { t } = useLang()
  const s = t.signup
  const [screen, setScreen] = useState<Screen>('main')
  const [selectedColor, setSelectedColor] = useState('teal')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [statusKind, setStatusKind] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [loading, setLoading] = useState(false)
  const [pendingEmail, setPendingEmail] = useState('')
  const [recoveryReady, setRecoveryReady] = useState(false)

  const selectedColorHex = PROFILE_COLORS.find((c) => c.id === selectedColor)?.hex ?? '#00A886'

  const clearStatus = () => {
    setMessage('')
    setStatusKind('idle')
  }

  const setError = (text: string) => {
    setStatusKind('error')
    setMessage(text)
  }

  useEffect(() => {
    let cancelled = false

    const enterRecovery = () => {
      if (cancelled) return
      setRecoveryReady(true)
      setScreen('update')
      clearStatus()
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (isPasswordRecoveryEvent(event)) enterRecovery()
    })

    async function bootstrapRecovery() {
      if (typeof window === 'undefined') return

      const params = new URLSearchParams(window.location.search)
      if (params.get('view') === 'forgot') {
        setScreen('forgot')
      }

      if (isRecoveryHash(window.location.hash) || isRecoverySearch(window.location.search)) {
        enterRecovery()
      }

      // PKCE: exchange ?code= when present (safe if already consumed — show update if session exists).
      const code = params.get('code')
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          // Client may have already exchanged via detectSessionInUrl — check session.
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData.session) {
            enterRecovery()
          } else {
            setScreen('forgot')
            setError(s.updateInvalidLink)
          }
        } else if (data.session) {
          enterRecovery()
        }
        const cleaned = cleanAuthParamsFromUrl(window.location.href)
        window.history.replaceState({}, '', cleaned)
        return
      }

      if (isRecoveryHash(window.location.hash)) {
        const cleaned = cleanAuthParamsFromUrl(window.location.href)
        window.history.replaceState({}, '', cleaned)
      }
    }

    void bootstrapRecovery()
    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- bootstrap once on mount
  }, [])

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

  const handleSignUp = async () => {
    if (!name.trim()) {
      setError(t.home.enterFullName)
      return
    }
    setLoading(true)
    setStatusKind('loading')
    setMessage('Creating your account…')
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
      setError(isAlreadyRegisteredError(error) ? t.home.emailRegistered : error.message)
    } else {
      if (data.session) await supabase.auth.signOut()
      setPendingEmail(email)
      setScreen('confirm')
      clearStatus()
    }
    setLoading(false)
  }

  const handleSignIn = async () => {
    setLoading(true)
    setStatusKind('loading')
    setMessage('Signing you in…')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(isUnconfirmedEmailError(error) ? s.confirmEmailRequired : error.message)
    } else if (data.session) {
      setStatusKind('success')
      setMessage('Signed in — opening the map…')
      window.location.href = '/map'
    }
    setLoading(false)
  }

  const handlePasswordReset = async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      setError(s.yourEmail)
      return
    }
    setLoading(true)
    setStatusKind('loading')
    setMessage('Sending reset link…')
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://www.flushpin.com'
    const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
      redirectTo: getPasswordResetRedirectUrl(origin),
    })
    if (error) {
      setError(error.message)
    } else {
      setStatusKind('success')
      setMessage(s.resetSent)
    }
    setLoading(false)
  }

  const handleUpdatePassword = async () => {
    const check = validatePasswordConfirmation(newPassword, confirmPassword)
    if (!check.ok) {
      setError(check.message)
      return
    }

    setLoading(true)
    setStatusKind('loading')
    setMessage('Updating password…')

    const { data: sessionData } = await supabase.auth.getSession()
    if (!sessionData.session && !recoveryReady) {
      setError(s.updateInvalidLink)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // End recovery session so the user signs in with the new password.
    await supabase.auth.signOut()
    setNewPassword('')
    setConfirmPassword('')
    setPassword('')
    setRecoveryReady(false)
    setScreen('signin')
    setStatusKind('success')
    setMessage(s.updateSuccess)
    setLoading(false)
  }

  const statusMessage = message
  const statusDisplay =
    loading && statusKind !== 'error'
      ? ('loading' as const)
      : statusKind === 'error'
        ? ('error' as const)
        : statusKind === 'success'
          ? ('success' as const)
          : statusKind === 'loading'
            ? ('loading' as const)
            : ('idle' as const)

  if (screen === 'update') {
    return (
      <AuthPage>
        <AuthShell>
          <h1 className={`${authTitleClass} mb-2`}>{s.updateTitle}</h1>
          <p className="mb-6 text-sm leading-relaxed text-fp-gray-600">{s.updateDesc}</p>
          <AuthStatus kind={statusDisplay} message={statusMessage} />
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.newPassword}
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={authInputClass}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="mb-2 block text-sm font-semibold text-fp-ink"
              >
                {s.confirmPassword}
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={authInputClass}
                autoComplete="new-password"
              />
            </div>
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={loading}
              className={authPrimaryButtonClass}
            >
              {loading ? 'Updating…' : s.updatePassword}
            </button>
            <button
              type="button"
              onClick={() => {
                clearStatus()
                setScreen('forgot')
              }}
              className="text-center text-sm font-semibold text-fp-gray-600 hover:text-fp-ink"
            >
              {s.forgotPassword}
            </button>
          </div>
        </AuthShell>
      </AuthPage>
    )
  }

  if (screen === 'confirm') {
    return (
      <AuthPage>
        <AuthShell>
          <div className="text-center">
            <div
              className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700"
              aria-hidden="true"
            >
              ✓
            </div>
            <h1 className={`${authTitleClass} mb-3`}>{s.confirmAlmostDone}</h1>
            <AuthStatus
              kind="success"
              message={formatEmailTemplate(s.confirmEmailSent, pendingEmail)}
            />
            <div className="mt-5 text-left">
              <ShareFlushPin surface="signup_success" variant="compact" />
            </div>
            <button
              type="button"
              onClick={() => {
                setPassword('')
                clearStatus()
                setScreen('signin')
              }}
              className={`${authPrimaryButtonClass} mt-6`}
            >
              {s.backToSignIn}
            </button>
          </div>
        </AuthShell>
      </AuthPage>
    )
  }

  if (screen === 'forgot') {
    return (
      <AuthPage>
        <AuthShell>
          <h1 className={`${authTitleClass} mb-2`}>{s.resetTitle}</h1>
          <p className="mb-6 text-sm leading-relaxed text-fp-gray-600">{s.resetDesc}</p>
          <AuthStatus kind={statusDisplay} message={statusMessage} />
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="reset-email" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.yourEmail}
              </label>
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={s.yourEmail}
                className={authInputClass}
                autoComplete="email"
              />
            </div>
            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={loading}
              className={authPrimaryButtonClass}
            >
              {loading ? 'Sending…' : s.sendReset}
            </button>
            <button
              type="button"
              onClick={() => {
                clearStatus()
                setScreen('signin')
              }}
              className="text-center text-sm font-semibold text-fp-gray-600 hover:text-fp-ink"
            >
              {s.backToSignIn}
            </button>
          </div>
        </AuthShell>
      </AuthPage>
    )
  }

  if (screen === 'signin') {
    return (
      <AuthPage>
        <AuthShell>
          <h1 className={`${authTitleClass} mb-2`}>{t.welcomeBack}</h1>
          <p className="mb-6 text-sm leading-relaxed text-fp-gray-600">{s.welcomeDesc}</p>

          <div className="mb-5 flex flex-col gap-3">
            <GoogleSignInButton
              onClick={() => handleGoogleSignIn()}
              disabled={loading}
              label={t.continueGoogle}
            />
          </div>
          <Divider label={s.or} />

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="signin-email" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.emailAddress}
              </label>
              <input
                id="signin-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={s.emailAddress}
                className={authInputClass}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signin-password" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.password}
              </label>
              <input
                id="signin-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={s.password}
                className={authInputClass}
                autoComplete="current-password"
              />
            </div>
            <AuthStatus kind={statusDisplay} message={statusMessage} />
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className={authPrimaryButtonClass}
            >
              {loading ? 'Signing in…' : s.signIn}
            </button>
            <p className="text-center text-sm text-fp-gray-600">
              {t.home.needAccount}{' '}
              <TextLink
                onClick={() => {
                  clearStatus()
                  setScreen('email')
                }}
              >
                {s.createAccount}
              </TextLink>
            </p>
            <button
              type="button"
              onClick={() => {
                clearStatus()
                setScreen('forgot')
              }}
              className="text-center text-sm font-medium text-fp-gray-400 hover:text-fp-ink"
            >
              {s.forgotPassword}
            </button>
          </div>
        </AuthShell>
      </AuthPage>
    )
  }

  if (screen === 'email') {
    return (
      <AuthPage>
        <AuthShell>
          <h1 className={`${authTitleClass} mb-2`}>{s.createTitle}</h1>
          <p className="mb-6 text-sm leading-relaxed text-fp-gray-600">{s.createDesc}</p>

          <div className="mb-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-fp-gray-400">
              {s.pickColor}
            </p>
            <div className="flex flex-wrap gap-2.5" role="listbox" aria-label={s.pickColor}>
              {PROFILE_COLORS.map((c) => {
                const selected = selectedColor === c.id
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    title={c.label}
                    onClick={() => setSelectedColor(c.id)}
                    className="h-9 w-9 rounded-full transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal"
                    style={{
                      background: c.hex,
                      boxShadow: selected
                        ? '0 0 0 3px #fff, 0 0 0 5px #1b1b21'
                        : '0 0 0 2px transparent',
                      transform: selected ? 'scale(1.06)' : undefined,
                    }}
                    aria-label={c.label}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="signup-name" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.yourName}
              </label>
              <input
                id="signup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={s.yourName}
                className={authInputClass}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="signup-email" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.emailAddress}
              </label>
              <input
                id="signup-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={s.emailAddress}
                className={authInputClass}
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="signup-password" className="mb-2 block text-sm font-semibold text-fp-ink">
                {s.password}
              </label>
              <input
                id="signup-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={s.password}
                className={authInputClass}
                autoComplete="new-password"
              />
            </div>
            <AuthStatus kind={statusDisplay} message={statusMessage} />
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className={authPrimaryButtonClass}
            >
              {loading ? 'Creating…' : s.createAccount}
            </button>
            <p className="text-center text-sm text-fp-gray-600">
              {s.alreadyHave}{' '}
              <TextLink
                onClick={() => {
                  clearStatus()
                  setScreen('signin')
                }}
              >
                {s.signIn}
              </TextLink>
            </p>
          </div>
        </AuthShell>
      </AuthPage>
    )
  }

  return (
    <AuthPage>
      <AuthShell>
        <h1 className={`${authTitleClass} mb-2 text-center`}>{s.welcomeTitle}</h1>
        <p className="mb-7 text-center text-sm leading-relaxed text-fp-gray-600">{s.welcomeDesc}</p>

        <div className="flex flex-col gap-3">
          <GoogleSignInButton
            onClick={() => handleGoogleSignIn()}
            disabled={loading}
            label={t.continueGoogle}
          />
        </div>

        <AuthStatus kind={statusDisplay} message={statusMessage} />
        <Divider label={s.or} />

        <button
          type="button"
          onClick={() => {
            clearStatus()
            setScreen('email')
          }}
          className={`${authSecondaryButtonClass} mb-5`}
        >
          {s.signUpWithEmail}
        </button>

        <p className="mb-3 text-center text-sm text-fp-gray-600">
          {s.alreadyHave}{' '}
          <TextLink
            onClick={() => {
              clearStatus()
              setScreen('signin')
            }}
          >
            {s.signIn}
          </TextLink>
        </p>
        <button
          type="button"
          onClick={() => {
            clearStatus()
            setScreen('forgot')
          }}
          className="mx-auto block text-center text-sm font-medium text-fp-gray-400 hover:text-fp-ink"
        >
          {s.forgotPassword}
        </button>
      </AuthShell>
    </AuthPage>
  )
}
