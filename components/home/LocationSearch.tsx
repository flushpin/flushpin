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
      className="mt-1 w-full"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <label htmlFor="home-address-search" className="sr-only">
        Search by address, neighborhood, or place
      </label>
      <div className="flex h-14 w-full items-center gap-2 rounded-full border border-fp-border bg-white px-4 shadow-[0_8px_24px_rgba(27,27,33,0.04)] focus-within:border-fp-teal focus-within:ring-4 focus-within:ring-fp-teal/15">
        <Search className="h-5 w-5 shrink-0 text-fp-gray-400" aria-hidden="true" />
        <input
          id="home-address-search"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter an address, neighborhood, or place"
          className="min-w-0 flex-1 border-0 bg-transparent text-[15px] text-fp-ink outline-none placeholder:text-fp-gray-400 disabled:opacity-60"
        />
        {onUseLocation && (
          <button
            type="button"
            onClick={onUseLocation}
            disabled={disabled}
            aria-label="Use current location"
            className="shrink-0 rounded-full p-2 text-fp-teal-dark transition-colors hover:bg-fp-teal-tint disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Crosshair className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  )
}
