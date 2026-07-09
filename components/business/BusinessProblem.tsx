import { Clock, Repeat, UserX } from 'lucide-react'

const problems = [
  {
    icon: Clock,
    text: 'Your staff stops what they\u2019re doing to say the code. Twenty, thirty times a day.',
  },
  {
    icon: Repeat,
    text: 'Customers forget it and come back to ask again. Lines slow down.',
  },
  {
    icon: UserX,
    text: 'The person asking was never greeted, never saw your menu, never bought a thing.',
  },
]

export default function BusinessProblem() {
  return (
    <section className="bg-fp-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">Sound familiar?</h2>
        <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
          {problems.map(({ icon: Icon, text }) => (
            <div key={text} className="fp-card p-6">
              <Icon className="h-6 w-6 text-fp-teal-dark" aria-hidden="true" />
              <p className="mt-4 text-base leading-relaxed text-fp-ink">{text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-base text-fp-gray-600">
          That&apos;s not a restroom problem. That&apos;s a missed-customer problem.
        </p>
      </div>
    </section>
  )
}
