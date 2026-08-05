import type { LucideIcon } from 'lucide-react'

type Props = {
  label: string
  icon: LucideIcon
  iconClassName?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  ariaLabel: string
}

export default function CategoryButton({
  label,
  icon: Icon,
  iconClassName = 'text-fp-teal-dark',
  active = false,
  disabled = false,
  onClick,
  ariaLabel,
}: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex min-h-[92px] flex-col items-center justify-center gap-2.5 rounded-[1.25rem] border px-3 py-4 text-sm font-semibold tracking-tight transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? 'border-fp-teal bg-fp-teal-tint text-fp-ink shadow-[0_8px_24px_rgba(0,168,134,0.12)]'
          : 'border-fp-border bg-white/90 text-fp-ink shadow-[0_4px_16px_rgba(27,27,33,0.03)] hover:border-fp-teal/35 hover:bg-fp-teal-tint/70'
      }`}
    >
      <Icon className={`h-6 w-6 ${iconClassName}`} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
