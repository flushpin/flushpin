type AuthStatusKind = 'idle' | 'loading' | 'error' | 'success' | 'info'

type Props = {
  kind: AuthStatusKind
  message?: string
}

export default function AuthStatus({ kind, message }: Props) {
  if (kind === 'idle' || !message) return null

  const styles: Record<Exclude<AuthStatusKind, 'idle'>, string> = {
    loading: 'border-fp-teal/25 bg-fp-teal-tint text-fp-teal-dark',
    error: 'border-red-200 bg-red-50 text-red-800',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    info: 'border-fp-border bg-fp-teal-tint text-fp-ink',
  }

  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      className={`rounded-2xl border px-4 py-3 text-sm font-medium leading-relaxed ${styles[kind]}`}
    >
      {kind === 'loading' ? (
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-fp-teal/30 border-t-fp-teal"
            aria-hidden="true"
          />
          {message}
        </span>
      ) : (
        message
      )}
    </p>
  )
}
