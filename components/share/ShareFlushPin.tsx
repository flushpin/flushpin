'use client'

import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { Check, Copy, Link2, Mail, MessageCircle, Share2, Smartphone } from 'lucide-react'
import {
  buildEmailShareUrl,
  buildShortShareMessage,
  buildSmsShareUrl,
  buildWhatsAppShareUrl,
  canUseNativeShare,
  copyShareLink,
  FLUSHPIN_SHARE_URL,
  nativeShareFlushPin,
  type ShareMethod,
  type ShareSurface,
} from '@/lib/shareFlushPin'
import { trackCopyLink, trackShareCompleted, trackShareOpened } from '@/lib/shareAnalytics'

type Variant = 'card' | 'compact' | 'embedded'

type Props = {
  surface: ShareSurface
  variant?: Variant
  className?: string
  /** When true, skip the outer “Share FlushPin” title (parent provides one). */
  hideTitle?: boolean
}

type ActionDef = {
  id: ShareMethod
  label: string
  description: string
  icon: typeof Share2
  accent: string
  onActivate: () => void | Promise<void>
}

const subscribeNoop = () => () => {}

export default function ShareFlushPin({
  surface,
  variant = 'card',
  className = '',
  hideTitle = false,
}: Props) {
  const titleId = useId()
  const openedRef = useRef(false)
  const [copied, setCopied] = useState(false)
  const nativeAvailable = useSyncExternalStore(subscribeNoop, canUseNativeShare, () => false)
  const [busy, setBusy] = useState<ShareMethod | null>(null)

  useEffect(() => {
    if (openedRef.current) return
    openedRef.current = true
    trackShareOpened(surface)
  }, [surface])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 2200)
    return () => window.clearTimeout(t)
  }, [copied])

  const message = buildShortShareMessage()

  const run = async (method: ShareMethod, fn: () => void | Promise<void>) => {
    setBusy(method)
    try {
      await fn()
    } finally {
      setBusy(null)
    }
  }

  const actions: ActionDef[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      description: 'Send a short invite',
      icon: MessageCircle,
      accent: 'bg-[#25D366]/10 text-[#128C7E]',
      onActivate: () => {
        trackShareCompleted('whatsapp', surface)
        window.open(buildWhatsAppShareUrl(message), '_blank', 'noopener,noreferrer')
      },
    },
    {
      id: 'sms',
      label: 'Messages',
      description: 'SMS or iMessage',
      icon: Smartphone,
      accent: 'bg-fp-teal-tint text-fp-teal-dark',
      onActivate: () => {
        trackShareCompleted('sms', surface)
        window.location.href = buildSmsShareUrl(message)
      },
    },
    {
      id: 'email',
      label: 'Email',
      description: 'A thoughtful note',
      icon: Mail,
      accent: 'bg-sky-50 text-sky-700',
      onActivate: () => {
        trackShareCompleted('email', surface)
        window.location.href = buildEmailShareUrl()
      },
    },
    {
      id: 'copy',
      label: copied ? 'Link copied' : 'Copy link',
      description: FLUSHPIN_SHARE_URL.replace(/^https?:\/\//, ''),
      icon: copied ? Check : Copy,
      accent: copied ? 'bg-emerald-50 text-emerald-700' : 'bg-fp-surface-muted text-fp-ink',
      onActivate: async () => {
        const ok = await copyShareLink()
        if (ok) {
          setCopied(true)
          trackCopyLink(surface)
        }
      },
    },
  ]

  if (nativeAvailable) {
    actions.push({
      id: 'native',
      label: 'More ways',
      description: 'System share sheet',
      icon: Share2,
      accent: 'bg-fp-teal text-white',
      onActivate: async () => {
        const result = await nativeShareFlushPin(message)
        if (result === 'shared') trackShareCompleted('native', surface)
      },
    })
  }

  const shell =
    variant === 'compact'
      ? 'rounded-2xl border border-fp-border bg-fp-white p-4 shadow-[var(--fp-shadow-soft)]'
      : variant === 'embedded'
        ? 'rounded-2xl border border-fp-border/80 bg-fp-white p-4 sm:p-5'
        : 'rounded-[26px] border border-fp-border bg-fp-white p-5 shadow-[var(--fp-shadow-lift)] sm:p-7'

  return (
    <section
      className={`${shell} ${className}`}
      aria-labelledby={hideTitle ? undefined : titleId}
      data-testid="share-flushpin"
      data-surface={surface}
    >
      {!hideTitle ? (
        <header className={variant === 'compact' ? 'mb-3' : 'mb-5'}>
          <p className="m-0 mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
            Invite friends
          </p>
          <h3
            id={titleId}
            className={
              variant === 'compact'
                ? 'm-0 text-lg font-semibold tracking-[-0.02em] text-fp-ink'
                : 'm-0 text-xl font-semibold tracking-[-0.03em] text-fp-ink sm:text-2xl'
            }
          >
            Share FlushPin
          </h3>
          <p
            className={
              variant === 'compact'
                ? 'm-0 mt-1.5 text-sm leading-relaxed text-fp-gray-600'
                : 'm-0 mt-2 max-w-md text-[15px] leading-relaxed text-fp-gray-600'
            }
          >
            Recommend FlushPin to friends, family, and coworkers in one tap.
          </p>
        </header>
      ) : null}

      <ul className="m-0 grid list-none gap-2.5 p-0 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.id === 'copy' && copied ? Check : action.icon
          const isBusy = busy === action.id
          return (
            <li key={action.id}>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => void run(action.id, action.onActivate)}
                className="group flex w-full min-h-[64px] items-center gap-3 rounded-2xl border border-fp-border bg-fp-surface px-3.5 py-3 text-left transition hover:border-fp-teal/40 hover:bg-fp-teal-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal disabled:opacity-70"
                aria-label={action.label}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${action.accent}`}
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-fp-ink">{action.label}</span>
                  <span className="mt-0.5 block truncate text-xs text-fp-gray-600">
                    {action.description}
                  </span>
                </span>
                <Link2
                  className="h-4 w-4 shrink-0 text-fp-gray-400 opacity-0 transition group-hover:opacity-100"
                  aria-hidden="true"
                />
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
