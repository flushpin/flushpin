'use client'

import { Plus, Share, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  type BeforeInstallPromptEvent,
  canOfferPwaInstall,
  isIosSafari,
  isStandalone,
  markInstallDismissed,
} from '../../lib/pwa'

export default function AddFlushPinToPhone() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIosSheet, setShowIosSheet] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const syncVisibility = (hasPrompt: boolean) => {
      setVisible(canOfferPwaInstall(hasPrompt))
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault()
      const promptEvent = event as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      syncVisibility(true)
    }

    const onInstalled = () => {
      setDeferredPrompt(null)
      setVisible(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    syncVisibility(false)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (isIosSafari()) {
      setShowIosSheet(true)
      return
    }

    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)

    if (outcome === 'accepted') {
      setVisible(false)
      return
    }

    markInstallDismissed()
    setVisible(false)
  }, [deferredPrompt])

  if (!visible) return null

  return (
    <>
      <button
        type="button"
        onClick={() => void handleInstall()}
        className="mt-6 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition-colors hover:border-fp-teal/40 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal md:mx-auto md:max-w-sm"
      >
        <Plus className="h-4 w-4 shrink-0 text-fp-teal" aria-hidden="true" />
        Add FlushPin to Phone
      </button>

      {showIosSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-a2hs-title"
          onClick={() => setShowIosSheet(false)}
        >
          <div
            className="w-full max-w-sm rounded-t-2xl rounded-b-xl border border-white/10 bg-[#121816] p-5 text-white shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Share className="h-5 w-5 shrink-0 text-fp-teal" aria-hidden="true" />
                <h2 id="ios-a2hs-title" className="text-lg font-bold leading-snug">
                  Add FlushPin to your Home Screen
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowIosSheet(false)}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-white/75">
              Tap the Share button, then select &ldquo;Add to Home Screen.&rdquo;
            </p>
            <button
              type="button"
              onClick={() => setShowIosSheet(false)}
              className="mt-5 flex min-h-11 w-full items-center justify-center rounded-xl bg-fp-teal px-4 py-2.5 text-sm font-semibold text-white hover:bg-fp-teal-dark"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  )
}
