'use client'

import { useEffect, useId, useRef } from 'react'
import { useLang } from '@/lib/LanguageContext'

type Props = {
  open: boolean
  onClose: () => void
}

/**
 * Premium thank-you dialog shown only after a confirmed amenity contribution.
 * Copy comes from LanguageContext — never hardcode locale strings here.
 */
export default function ContributionThankYouModal({ open, onClose }: Props) {
  const { t } = useLang()
  const copy = t.amenityThanks
  const titleId = useId()
  const bodyId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    const frame = window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus()
    })

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="presentation"
      data-testid="amenity-thanks-backdrop"
    >
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        onClick={(event) => event.stopPropagation()}
        data-testid="amenity-thanks-modal"
      >
        <p className={styles.kicker}>FlushPin</p>
        <h2 id={titleId} className={styles.title}>
          {copy.title}
        </h2>
        <p id={bodyId} className={styles.body}>
          {copy.body}
        </p>
        <p className={styles.support}>{copy.support}</p>
        <button
          ref={closeBtnRef}
          type="button"
          className={styles.button}
          onClick={onClose}
        >
          {copy.button}
        </button>
        <p className={styles.footer}>{copy.footer}</p>
      </div>
    </div>
  )
}

const styles = {
  backdrop:
    'fixed inset-0 z-[120] flex items-end justify-center bg-black/55 px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-8 sm:items-center sm:pb-8',
  dialog:
    'w-full max-w-[360px] rounded-[28px] border border-white/10 bg-[#111816] px-6 pb-6 pt-7 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]',
  kicker:
    'm-0 mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7dceb8]',
  title: 'm-0 mb-3 text-[1.65rem] font-semibold tracking-[-0.03em] text-white',
  body: 'm-0 mb-3 text-[15px] leading-relaxed text-white/88',
  support: 'm-0 mb-6 text-[13px] leading-relaxed text-white/55',
  button:
    'w-full rounded-full bg-[#00a886] px-5 py-3.5 text-[15px] font-semibold text-[#04140f] transition hover:bg-[#12b892] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9fe1cb]',
  footer: 'm-0 mt-4 text-[12px] leading-relaxed text-white/40',
} as const
