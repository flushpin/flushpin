'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MapPin, Search } from 'lucide-react'

export default function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    router.push(`/map?q=${encodeURIComponent(query)}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex h-14 w-full max-w-[560px] items-center gap-2 rounded-full border border-fp-border bg-fp-white px-4 focus-within:ring-2 focus-within:ring-fp-teal focus-within:ring-offset-2"
    >
      <MapPin className="h-5 w-5 shrink-0 text-fp-gray-400" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a city, business, or place…"
        aria-label="Search a city, business, or place"
        className="min-w-0 flex-1 border-0 bg-transparent text-base text-fp-ink outline-none placeholder:text-fp-gray-400"
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fp-teal text-white transition-colors hover:bg-fp-teal-dark"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>
    </form>
  )
}
