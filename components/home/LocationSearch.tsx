'use client'

import { Crosshair, Search } from 'lucide-react'

type Props = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled?: boolean
  onUseLocation?: () => void
}

export default function LocationSearch({
  value,
  onChange,
  onSubmit,
  disabled = false,
  onUseLocation,
}: Props) {
  return (
    <form
      className="mt-4 w-full"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="home-address-search" className="sr-only">
        Search by address, neighborhood, or place
      </label>
      <div className="flex h-12 w-full items-center gap-2 rounded-2xl border border-white/10 bg-[#141a18] px-3 focus-within:border-fp-teal/50 focus-within:ring-2 focus-within:ring-fp-teal/20">
        <Search className="h-5 w-5 shrink-0 text-white/40" aria-hidden="true" />
        <input
          id="home-address-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter an address, neighborhood, or place"
          className="min-w-0 flex-1 border-0 bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-60"
        />
        {onUseLocation && (
          <button
            type="button"
            onClick={onUseLocation}
            disabled={disabled}
            aria-label="Use current location"
            className="shrink-0 rounded-lg p-2 text-fp-teal transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Crosshair className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  )
}
