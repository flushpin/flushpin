import type { ReactNode } from 'react'
import Logo from '../Logo'
import LanguageToggle from '../LanguageToggle'

type Props = {
  children: ReactNode
  /** Optional compact header for modal (close button on the right). */
  onClose?: () => void
  closeLabel?: string
  showLanguage?: boolean
  /** Pass empty string in modals to avoid navigating away mid-flow. */
  logoHref?: string
  className?: string
}

export default function AuthShell({
  children,
  onClose,
  closeLabel = 'Close',
  showLanguage = true,
  logoHref = '/',
  className = '',
}: Props) {
  return (
    <div
      className={`relative w-full max-w-[420px] overflow-hidden rounded-[28px] border border-fp-border/80 bg-fp-white shadow-[0_24px_64px_rgba(27,27,33,0.08)] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_top,rgba(0,168,134,0.12),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-3 px-6 pb-2 pt-6 sm:px-8">
        <Logo height={40} href={logoHref} variant="light" />
        <div className="flex items-center gap-2">
          {showLanguage ? <LanguageToggle /> : null}
          {onClose ? (
            <button
              type="button"
              aria-label={closeLabel}
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-fp-border bg-fp-white text-xl leading-none text-fp-gray-600 transition-colors hover:border-fp-teal/40 hover:text-fp-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal"
            >
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div className="relative px-6 pb-8 pt-4 sm:px-8">{children}</div>
    </div>
  )
}

export const authInputClass =
  'w-full rounded-2xl border border-fp-border bg-fp-white px-4 py-3.5 text-base text-fp-ink outline-none transition-colors placeholder:text-fp-gray-400 focus:border-fp-teal focus:ring-2 focus:ring-fp-teal/20'

export const authPrimaryButtonClass =
  'flex min-h-[52px] w-full items-center justify-center rounded-full bg-fp-teal px-5 text-[15px] font-semibold text-white transition-colors hover:bg-fp-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal disabled:cursor-not-allowed disabled:opacity-65'

export const authSecondaryButtonClass =
  'flex min-h-[52px] w-full items-center justify-center rounded-full border border-fp-border bg-fp-teal-tint px-5 text-[15px] font-semibold text-fp-ink transition-colors hover:border-fp-teal/35 hover:bg-[#e8f7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal'

/** Responsive title that wraps cleanly from 375px up — avoids FlushPin truncation. */
export const authTitleClass =
  'text-balance break-words text-[1.5rem] font-bold leading-tight tracking-tight text-fp-ink sm:text-[1.75rem] md:text-[2rem]'

export const PROFILE_COLORS = [
  { id: 'teal', hex: '#00A886', label: 'FlushPin teal' },
  { id: 'aqua', hex: '#14B8A6', label: 'Aqua' },
  { id: 'sky', hex: '#0EA5E9', label: 'Sky' },
  { id: 'emerald', hex: '#10B981', label: 'Emerald' },
  { id: 'amber', hex: '#F59E0B', label: 'Amber' },
  { id: 'coral', hex: '#F97316', label: 'Coral' },
  { id: 'rose', hex: '#F43F5E', label: 'Rose' },
  { id: 'slate', hex: '#64748B', label: 'Slate' },
] as const
