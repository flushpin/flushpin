'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import Logo from './Logo'
import AuthModal from './home/AuthModal'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'
import { signOutSafely } from '../lib/authSignOut'

export default function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''
  const { t } = useLang()
  const [user, setUser] = useState<{ user_metadata?: { full_name?: string; profile_color?: string }; email?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  const [signingOut, setSigningOut] = useState(false)
  const [signOutError, setSignOutError] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async (): Promise<boolean> => {
    setSigningOut(true)
    setSignOutError('')
    const result = await signOutSafely(supabase)
    if (!result.ok) {
      setSignOutError(result.message || t.signup.signOutFailed)
      setSigningOut(false)
      return false
    }
    // Clear UI only after Supabase confirms sign-out succeeded.
    setUser(null)
    setSigningOut(false)
    return true
  }

  const openSignIn = () => {
    setAuthMode('signin')
    setShowAuth(true)
  }

  const openSignUp = () => {
    setAuthMode('signup')
    setShowAuth(true)
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ mode: 'signin' | 'signup' }>).detail
      if (detail?.mode === 'signin') openSignIn()
      else if (detail?.mode === 'signup') openSignUp()
    }
    window.addEventListener('flushpin:open-auth', handler)
    return () => window.removeEventListener('flushpin:open-auth', handler)
  }, [])

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const profileColor = user?.user_metadata?.profile_color || '#00A886'
  const isRestroomDetail = pathname.startsWith('/restroom/')

  const navLinks = (
    <>
      <Link
        href="/map"
        className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal"
      >
        Find a Restroom
      </Link>
      <Link
        href="/business"
        className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal"
      >
        {t.forBusinesses}
      </Link>
      <Link
        href="/restrooms/california"
        className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal"
      >
        Guides
      </Link>
      <Link
        href="/events"
        className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal"
      >
        {t.events}
      </Link>
    </>
  )

  return (
    <>
      {!isRestroomDetail && (
      <header className="fp-safe-top sticky top-0 z-50 border-b border-fp-border bg-fp-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="shrink-0">
            <Logo height={isHome ? 36 : 40} variant="light" />
          </div>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {navLinks}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 no-underline"
                  aria-label="Your profile"
                >
                  <span
                    className="h-7 w-7 rounded-full"
                    style={{ background: profileColor }}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-fp-ink hover:text-fp-teal">
                    {displayName}
                  </span>
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-fp-teal no-underline hover:text-fp-teal-dark"
                >
                  Invite friends
                </Link>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="text-sm font-medium text-fp-ink hover:text-fp-teal disabled:opacity-60"
                >
                  {signingOut ? 'Signing out…' : t.signOut}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openSignIn}
                  className="text-sm font-medium text-fp-ink hover:text-fp-teal"
                >
                  {isHome ? 'Sign In' : 'Log in'}
                </button>
                {!isHome && (
                  <button
                    type="button"
                    onClick={openSignUp}
                    className="rounded-full bg-fp-teal px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-fp-teal-dark"
                  >
                    Sign up
                  </button>
                )}
              </>
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2 lg:hidden">
            {isHome && !user && (
              <button
                type="button"
                onClick={openSignIn}
                className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-fp-border bg-fp-white px-3 text-sm font-semibold text-fp-ink transition-colors hover:border-fp-teal/50 hover:bg-fp-teal-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal"
              >
                <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Sign In</span>
              </button>
            )}
            <button
              type="button"
              className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <span className="block h-0.5 w-6 bg-fp-ink" />
              <span className="block h-0.5 w-6 bg-fp-ink" />
              <span className="block h-0.5 w-6 bg-fp-ink" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav
            className="flex flex-col gap-4 border-t border-fp-border bg-fp-white px-4 py-4 lg:hidden"
            aria-label="Mobile navigation"
          >
            <Link
              href="/map"
              className="text-sm font-medium text-fp-ink no-underline"
              onClick={() => setMenuOpen(false)}
            >
              Find a Restroom
            </Link>
            <Link
              href="/business"
              className="text-sm font-medium text-fp-ink no-underline"
              onClick={() => setMenuOpen(false)}
            >
              {t.forBusinesses}
            </Link>
            <Link
              href="/restrooms/california"
              className="text-sm font-medium text-fp-ink no-underline"
              onClick={() => setMenuOpen(false)}
            >
              Guides
            </Link>
            <Link
              href="/events"
              className="text-sm font-medium text-fp-ink no-underline"
              onClick={() => setMenuOpen(false)}
            >
              {t.events}
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-fp-ink no-underline"
              onClick={() => setMenuOpen(false)}
            >
              Contact
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-fp-ink no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Your profile
                </Link>
                <Link
                  href="/profile"
                  className="text-sm font-medium text-fp-teal no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  Invite friends
                </Link>
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => {
                    void handleSignOut().then((ok) => {
                      if (ok) setMenuOpen(false)
                    })
                  }}
                  className="text-left text-sm font-medium text-fp-ink disabled:opacity-60"
                >
                  {signingOut ? 'Signing out…' : t.signOut}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    openSignIn()
                    setMenuOpen(false)
                  }}
                  className="text-left text-sm font-medium text-fp-ink"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openSignUp()
                    setMenuOpen(false)
                  }}
                  className="w-fit rounded-full bg-fp-teal px-5 py-2 text-sm font-semibold text-white"
                >
                  Sign up
                </button>
              </>
            )}
          </nav>
        )}
      </header>
      )}

      {signOutError ? (
        <div
          role="alert"
          className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm font-medium text-red-800"
        >
          {signOutError}
        </div>
      ) : null}

      <AuthModal
        open={showAuth}
        mode={authMode}
        onClose={() => setShowAuth(false)}
        onModeChange={setAuthMode}
      />
    </>
  )
}
