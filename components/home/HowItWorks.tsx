const steps = [
  {
    number: 1,
    title: 'Find restrooms nearby.',
    description:
      'Use your location or search an address to see places around you — cafés, gas stations, malls, and more.',
  },
  {
    number: 2,
    title: 'Know the access rule.',
    description:
      'Code, customers only, ask staff, open access, or temporarily locked. No guessing at the restroom door.',
  },
  {
    number: 3,
    title: 'Help the next person.',
    description:
      'Signed-in users can add and update access information so the next traveler finds what they need faster.',
  },
]

export default function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <div className="grid gap-10 md:grid-cols-3">
        {steps.map(({ number, title, description }) => (
          <div key={number}>
            <span className="text-3xl font-bold text-fp-teal">{number}</span>
            <h3 className="mt-4 text-lg font-semibold text-fp-ink">{title}</h3>
            <p className="mt-2 text-base leading-relaxed text-fp-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
