type Props = {
  status: 'idle' | 'loading' | 'error'
  message?: string
}

export default function SearchStatus({ status, message }: Props) {
  if (status === 'idle' || !message) return null

  const isLoading = status === 'loading'

  return (
    <p
      role={isLoading ? 'status' : 'alert'}
      aria-live="polite"
      className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
        isLoading
          ? 'bg-fp-teal/15 text-fp-teal'
          : 'border border-amber-500/30 bg-amber-500/10 text-amber-100'
      }`}
    >
      {message}
    </p>
  )
}
