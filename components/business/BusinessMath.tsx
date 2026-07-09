import { ArrowRight } from 'lucide-react'

const stats = [
  { value: '20 code asks a day', label: '' },
  { value: '600 offer views a month', label: '' },
  { value: 'and every single one is standing inside your store.', label: '' },
]

export default function BusinessMath() {
  return (
    <section className="bg-fp-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl text-center">
        <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">Small numbers add up</h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-6 md:flex-row md:gap-4">
          {stats.map(({ value }, index) => (
            <div key={value} className="flex items-center gap-4">
              <p className="max-w-xs text-xl font-bold leading-snug text-fp-ink md:text-2xl">{value}</p>
              {index < stats.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-fp-teal md:block" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-base leading-relaxed text-fp-gray-600">
          No ad you can buy puts your offer in front of a customer who is already through your door.
          This one does.
        </p>
      </div>
    </section>
  )
}
