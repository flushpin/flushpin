type Props = {
  onClick: () => void
  disabled?: boolean
  label: string
}

function AppleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.365 1.43c0 1.14-.42 2.23-1.23 3.05-.9.92-2.1 1.45-3.2 1.36-.05-1.2.45-2.4 1.28-3.22.9-.9 2.2-1.45 3.15-1.19zM20.5 17.2c-.6 1.35-.9 1.95-1.7 3.15-1.1 1.65-2.65 3.7-4.55 3.72-1.7.03-2.15-1.1-4.45-1.1-2.3 0-2.8 1.08-4.5 1.13-1.85.05-3.25-1.8-4.35-3.45C-1.2 17.4-.1 12.55 2.15 9.85c1.15-1.4 2.75-2.35 4.4-2.38 1.7-.03 3.3 1.15 4.45 1.15 1.15 0 2.95-1.42 4.95-1.2.85.04 3.2.35 4.7 2.6-3.95 2.15-3.3 7.7-.15 7.18z" />
    </svg>
  )
}

export default function AppleSignInButton({ onClick, disabled = false, label }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[52px] w-full items-center justify-center gap-3 rounded-2xl bg-[#111111] px-4 text-[15px] font-semibold text-white transition-opacity hover:bg-[#222222] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal disabled:cursor-not-allowed disabled:opacity-60"
    >
      <AppleMark />
      <span>{label}</span>
    </button>
  )
}
