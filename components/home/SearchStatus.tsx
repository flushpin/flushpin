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
          ? 'bg-fp-teal-tint text-fp-teal-dark'
          : 'border border-amber-200 bg-amber-50 text-amber-800'
      }`}
    >
      {message}
    </p>
  )
}
