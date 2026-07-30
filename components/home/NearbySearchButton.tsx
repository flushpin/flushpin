'use client'

import { ChevronRight, Loader2, MapPin } from 'lucide-react'

type Props = {
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

export default function NearbySearchButton({ loading = false, disabled = false, onClick }: Props) {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        aria-busy={loading}
        className="flex min-h-[58px] w-full items-center justify-between gap-3 rounded-2xl bg-fp-teal px-5 py-4 text-left font-bold text-white shadow-[0_10px_30px_rgba(0,168,134,0.35)] transition-all hover:bg-fp-teal-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.99]"
      >
        <span className="flex items-center gap-3">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
          )}
          <span className="text-lg">
            {loading ? 'Finding restrooms near you…' : 'Find Nearby Restrooms'}
          </span>
        </span>
        {!loading && <ChevronRight className="h-5 w-5 shrink-0 opacity-90" aria-hidden="true" />}
      </button>
      {!loading && (
        <p className="mt-2 text-center text-xs text-white/50">Using your current location</p>
      )}
    </div>
  )
}
