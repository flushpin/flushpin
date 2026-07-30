'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import Logo from './Logo'
import AuthModal from './home/AuthModal'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'

export default function SiteHeader() {
  const pathname = usePathname()
  const isHome = pathname === '/' || pathname === ''
  const { t } = useLang()
  const [user, setUser] = useState<{ user_metadata?: { full_name?: string; profile_color?: string }; email?: string } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null))
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
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
        className={`text-sm font-medium no-underline hover:text-fp-teal ${isHome ? 'text-white/80' : 'text-fp-ink'}`}
      >
        Find a Restroom
      </Link>
      <Link
        href="/business"
        className={`text-sm font-medium no-underline hover:text-fp-teal ${isHome ? 'text-white/80' : 'text-fp-ink'}`}
      >
        {t.forBusinesses}
      </Link>
      <Link
        href="/restrooms/california"
        className={`text-sm font-medium no-underline hover:text-fp-teal ${isHome ? 'text-white/80' : 'text-fp-ink'}`}
      >
        Guides
      </Link>
      <Link
        href="/events"
        className={`text-sm font-medium no-underline hover:text-fp-teal ${isHome ? 'text-white/80' : 'text-fp-ink'}`}
      >
        {t.events}
      </Link>
    </>
  )

  return (
    <>
      {!isRestroomDetail && (
      <header
        className={`fp-safe-top sticky top-0 z-50 border-b ${
          isHome ? 'border-white/10 bg-[#0a0f0e]/95 backdrop-blur-md' : 'border-fp-border bg-fp-white'
        }`}
      >
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 md:px-6">
          <div className="shrink-0">
            <Logo height={isHome ? 36 : 40} variant={isHome ? 'dark' : 'light'} />
          </div>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {navLinks}
            {user ? (
              <div className="flex items-center gap-3">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{ background: profileColor }}
                  aria-hidden="true"
                />
                <span className={`text-sm font-medium ${isHome ? 'text-white' : 'text-fp-ink'}`}>
                  {displayName}
                </span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className={`text-sm font-medium hover:text-fp-teal ${isHome ? 'text-white/80' : 'text-fp-ink'}`}
                >
                  {t.signOut}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openSignIn}
                  className={`text-sm font-medium hover:text-fp-teal ${isHome ? 'text-white/80' : 'text-fp-ink'}`}
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

          {isHome ? (
            <div className="flex shrink-0 items-center lg:hidden">
              {user ? (
                <div className="flex min-h-11 items-center gap-2">
                  <span
                    className="h-9 w-9 shrink-0 rounded-full"
                    style={{ background: profileColor }}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col items-end leading-tight">
                    <span className="max-w-[80px] truncate text-xs font-semibold text-white sm:max-w-[112px]">
                      {displayName}
                    </span>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="text-[11px] font-medium text-fp-teal hover:underline"
                    >
                      {t.signOut}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={openSignIn}
                  className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:border-fp-teal/50 hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal"
                >
                  <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 p-2 lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <span className="block h-0.5 w-6 bg-fp-ink" />
              <span className="block h-0.5 w-6 bg-fp-ink" />
              <span className="block h-0.5 w-6 bg-fp-ink" />
            </button>
          )}
        </div>

        {menuOpen && !isHome && (
          <nav
            className="flex flex-col gap-4 border-t border-fp-border px-4 py-4 lg:hidden"
            aria-label="Mobile navigation"
          >
            <Link href="/map" className="text-sm font-medium text-fp-ink no-underline" onClick={() => setMenuOpen(false)}>
              Find a Restroom
            </Link>
            <Link href="/business" className="text-sm font-medium text-fp-ink no-underline" onClick={() => setMenuOpen(false)}>
              {t.forBusinesses}
            </Link>
            <Link href="/restrooms/california" className="text-sm font-medium text-fp-ink no-underline" onClick={() => setMenuOpen(false)}>
              Guides
            </Link>
            <Link href="/events" className="text-sm font-medium text-fp-ink no-underline" onClick={() => setMenuOpen(false)}>
              {t.events}
            </Link>
            {user ? (
              <button type="button" onClick={handleSignOut} className="text-left text-sm font-medium text-fp-ink">
                {t.signOut}
              </button>
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
                  Log in
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

      <AuthModal
        open={showAuth}
        mode={authMode}
        onClose={() => setShowAuth(false)}
        onModeChange={setAuthMode}
      />
    </>
  )
}
