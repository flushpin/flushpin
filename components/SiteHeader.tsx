'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import AuthModal from './home/AuthModal'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'

export default function SiteHeader() {
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

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''
  const profileColor = user?.user_metadata?.profile_color || '#00A886'

  const navLinks = (
    <>
      <Link href="/map" className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal">
        Find a Restroom
      </Link>
      <Link href="/business" className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal">
        {t.forBusinesses}
      </Link>
      <Link href="/restrooms/california" className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal">
        Guides
      </Link>
      <Link href="/events" className="text-sm font-medium text-fp-ink no-underline hover:text-fp-teal">
        {t.events}
      </Link>
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-fp-border bg-fp-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <Logo height={40} />

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {navLinks}
            {user ? (
              <div className="flex items-center gap-3">
                <span
                  className="h-7 w-7 rounded-full"
                  style={{ background: profileColor }}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-fp-ink">{displayName}</span>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-sm font-medium text-fp-ink hover:text-fp-teal"
                >
                  {t.signOut}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openSignIn}
                  className="text-sm font-medium text-fp-ink hover:text-fp-teal"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={openSignUp}
                  className="rounded-full bg-fp-teal px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-fp-teal-dark"
                >
                  Sign up
                </button>
              </>
            )}
          </nav>

          <button
            type="button"
            className="flex flex-col gap-1.5 p-2 lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-expanded={menuOpen}
            aria-label="Open menu"
          >
            <span className="block h-0.5 w-6 bg-fp-ink" />
            <span className="block h-0.5 w-6 bg-fp-ink" />
            <span className="block h-0.5 w-6 bg-fp-ink" />
          </button>
        </div>

        {menuOpen && (
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

      <AuthModal
        open={showAuth}
        mode={authMode}
        onClose={() => setShowAuth(false)}
        onModeChange={setAuthMode}
      />
    </>
  )
}
