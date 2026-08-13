'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User } from 'lucide-react'
import Logo from './Logo'
import AuthModal from './home/AuthModal'
import { supabase } from '../lib/supabase'
import { useLang } from '../lib/LanguageContext'
import { signOutSafely } from '../lib/authSignOut'

function HeaderDivider({ className = '' }: { className?: string }) {
  return (
    <span
      className={`mx-1 hidden h-4 w-px shrink-0 bg-fp-border lg:block ${className}`}
      aria-hidden="true"
    />
  )
}

function NavSeparator() {
  return <span className="mx-0.5 hidden h-3.5 w-px shrink-0 bg-fp-border/80 lg:block" aria-hidden="true" />
}

function NavLink({ href, children, onClick }: { href: string; children: ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-full px-3 py-2 text-sm font-medium text-fp-ink no-underline transition-colors hover:bg-white hover:text-fp-teal"
    >
      {children}
    </Link>
  )
}

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

  const primaryLinks = [
    { href: '/map', label: t.findRestroom },
    { href: '/business', label: t.forBusinesses },
    { href: '/restrooms/california', label: 'Guides' },
    { href: '/events', label: t.events },
  ] as const

  return (
    <>
      {!isRestroomDetail && (
        <header className="sticky top-0 z-50 border-b border-fp-border bg-fp-white/95 backdrop-blur-md">
          <div className="mx-auto flex min-h-[64px] max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
            <div className="shrink-0">
              <Logo height={isHome ? 36 : 40} />
            </div>

            <div className="hidden items-center lg:flex">
              <nav
                className="flex items-center rounded-full border border-fp-border bg-fp-surface px-1.5 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                aria-label="Main navigation"
              >
                {primaryLinks.map((link, index) => (
                  <span key={link.href} className="flex items-center">
                    {index > 0 ? <NavSeparator /> : null}
                    <NavLink href={link.href}>{link.label}</NavLink>
                  </span>
                ))}
              </nav>

              <HeaderDivider className="mx-4" />

              {user ? (
                <div className="flex items-center rounded-full border border-fp-border bg-white py-1 pl-1.5 pr-1.5 shadow-sm">
                  <Link
                    href="/profile"
                    className="flex max-w-[148px] items-center gap-2 rounded-full px-2 py-1.5 no-underline transition-colors hover:bg-fp-teal-tint"
                    aria-label="Your profile"
                  >
                    <span
                      className="h-7 w-7 shrink-0 rounded-full ring-2 ring-white"
                      style={{ background: profileColor }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-sm font-semibold text-fp-ink">{displayName}</span>
                  </Link>

                  <HeaderDivider className="mx-1.5" />

                  <Link
                    href="/profile"
                    className="rounded-full px-3 py-2 text-sm font-semibold text-fp-teal no-underline transition-colors hover:bg-fp-teal-tint hover:text-fp-teal-dark"
                  >
                    {t.inviteFriends}
                  </Link>

                  <HeaderDivider className="mx-1.5" />

                  <button
                    type="button"
                    onClick={() => void handleSignOut()}
                    disabled={signingOut}
                    className="rounded-full px-3 py-2 text-sm font-medium text-fp-gray-600 transition-colors hover:bg-fp-surface hover:text-fp-ink disabled:opacity-60"
                  >
                    {signingOut ? 'Signing out…' : t.signOut}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full border border-fp-border bg-white p-1 shadow-sm">
                  <button
                    type="button"
                    onClick={openSignIn}
                    className="rounded-full px-4 py-2 text-sm font-medium text-fp-ink transition-colors hover:bg-fp-surface"
                  >
                    {isHome ? t.signIn : 'Log in'}
                  </button>
                  {!isHome && (
                    <>
                      <HeaderDivider className="mx-0" />
                      <button
                        type="button"
                        onClick={openSignUp}
                        className="rounded-full bg-fp-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fp-teal-dark"
                      >
                        {t.signUp}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 lg:hidden">
              {isHome && !user && (
                <button
                  type="button"
                  onClick={openSignIn}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-full border border-fp-border bg-fp-white px-3 text-sm font-semibold text-fp-ink transition-colors hover:border-fp-teal/50 hover:bg-fp-teal-tint"
                >
                  <User className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">{t.signIn}</span>
                </button>
              )}
              <button
                type="button"
                className="flex min-h-11 min-w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-fp-border bg-white p-2"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                aria-label="Open menu"
              >
                <span className="block h-0.5 w-5 bg-fp-ink" />
                <span className="block h-0.5 w-5 bg-fp-ink" />
                <span className="block h-0.5 w-5 bg-fp-ink" />
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav
              className="border-t border-fp-border bg-fp-white px-4 py-4 lg:hidden"
              aria-label="Mobile navigation"
            >
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-fp-gray-400">
                Explore
              </p>
              <div className="mb-4 flex flex-col gap-1 rounded-2xl border border-fp-border bg-fp-surface p-2">
                {primaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-fp-ink no-underline transition-colors hover:bg-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/contact"
                  className="rounded-xl px-3 py-3 text-sm font-medium text-fp-ink no-underline transition-colors hover:bg-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
              </div>

              <div className="my-4 h-px bg-fp-border" aria-hidden="true" />

              {user ? (
                <>
                  <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-fp-gray-400">
                    Account
                  </p>
                  <div className="flex flex-col gap-1 rounded-2xl border border-fp-border bg-white p-2">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 rounded-xl px-3 py-3 no-underline transition-colors hover:bg-fp-teal-tint"
                      onClick={() => setMenuOpen(false)}
                    >
                      <span
                        className="h-8 w-8 shrink-0 rounded-full"
                        style={{ background: profileColor }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-semibold text-fp-ink">{displayName}</span>
                    </Link>
                    <Link
                      href="/profile"
                      className="rounded-xl px-3 py-3 text-sm font-semibold text-fp-teal no-underline transition-colors hover:bg-fp-teal-tint"
                      onClick={() => setMenuOpen(false)}
                    >
                      {t.inviteFriends}
                    </Link>
                    <button
                      type="button"
                      disabled={signingOut}
                      onClick={() => {
                        void handleSignOut().then((ok) => {
                          if (ok) setMenuOpen(false)
                        })
                      }}
                      className="rounded-xl px-3 py-3 text-left text-sm font-medium text-fp-gray-600 transition-colors hover:bg-fp-surface disabled:opacity-60"
                    >
                      {signingOut ? 'Signing out…' : t.signOut}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-fp-gray-400">
                    Account
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        openSignIn()
                        setMenuOpen(false)
                      }}
                      className="rounded-xl border border-fp-border bg-white px-4 py-3 text-left text-sm font-medium text-fp-ink"
                    >
                      {t.signIn}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openSignUp()
                        setMenuOpen(false)
                      }}
                      className="rounded-xl bg-fp-teal px-4 py-3 text-sm font-semibold text-white"
                    >
                      {t.signUp}
                    </button>
                  </div>
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
