'use client'

import { useEffect } from 'react'

/** Apple popup/redirect callback target — primary sign-in completes in the popup. */
export default function AppleAuthCallbackPage() {
  useEffect(() => {
    document.title = 'FlushPin — Apple Sign In'
  }, [])

  return (
    <main className="flex min-h-screen items-center justify-center bg-fp-surface px-6">
      <p className="text-center text-sm font-medium text-fp-gray-600">
        Completing Apple Sign In… You can close this window if it does not redirect automatically.
      </p>
    </main>
  )
}
