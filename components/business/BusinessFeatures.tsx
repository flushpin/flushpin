import { ChartBar, Megaphone, Users } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Your staff gets their time back',
    description: 'No more repeating the code. The sticker does the talking.',
  },
  {
    icon: Megaphone,
    title: 'A free ad screen you already own',
    description: 'Every scan shows your campaign first. Change it as often as you like.',
  },
  {
    icon: ChartBar,
    title: 'Numbers you never had before',
    description: 'See how many people scanned, at what hours, and which offers got attention.',
  },
]

export default function BusinessFeatures() {
  return (
    <section className="bg-fp-white px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-bold text-fp-ink md:text-3xl">What you get</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="fp-card p-6">
              <Icon className="h-6 w-6 text-fp-teal-dark" aria-hidden="true" />
              <h3 className="mt-4 text-lg font-semibold text-fp-ink">{title}</h3>
              <p className="mt-2 text-base leading-relaxed text-fp-gray-600">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
