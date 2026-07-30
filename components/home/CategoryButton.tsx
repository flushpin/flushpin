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
  iconClassName = 'text-fp-teal',
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
      className={`flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fp-teal disabled:cursor-not-allowed disabled:opacity-60 ${
        active
          ? 'border-fp-teal bg-fp-teal/15 text-white shadow-[0_0_0_1px_rgba(0,168,134,0.4)]'
          : 'border-white/10 bg-[#141a18] text-white/90 hover:border-fp-teal/40 hover:bg-[#1a2220]'
      }`}
    >
      <Icon className={`h-6 w-6 ${iconClassName}`} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
