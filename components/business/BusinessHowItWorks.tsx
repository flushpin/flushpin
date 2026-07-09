import { BadgePercent, LockOpen, QrCode } from 'lucide-react'

const steps = [
  {
    icon: QrCode,
    title: 'Customer scans',
    description: 'We give you a QR sticker. Put it by the register or the restroom door.',
  },
  {
    icon: BadgePercent,
    title: 'They see your offer',
    description:
      'Before the code appears, they see your message: \u201CCroissant $1 off with any coffee \u2014 today only.\u201D You write it, you change it anytime.',
  },
  {
    icon: LockOpen,
    title: 'They get the code',
    description: 'The code shows on their phone. Your staff never gets interrupted again.',
  },
]

export default function BusinessHowItWorks() {
  return (
    <section className="bg-fp-teal-tint px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-fp-ink md:text-3xl">
          How FlushPin fixes it — 3 steps
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="fp-card bg-fp-white p-6">
              <span className="text-sm font-semibold text-fp-teal">Step {index + 1}</span>
              <Icon className="mt-4 h-7 w-7 text-fp-teal-dark" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-fp-ink">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-fp-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
