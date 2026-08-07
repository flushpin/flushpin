const features = [
  {
    title: 'Millions of places, live data',
    description:
      'Powered by real-time location data, FlushPin works in any city, any country.',
  },
  {
    title: 'Read and share door codes',
    description:
      'See PIN codes added by the community, and add ones you find to help the next person.',
  },
  {
    title: 'Family & EV friendly',
    description:
      'Perfect for road trips with kids and charging stops. Find a proper restroom while you wait, not a gamble.',
  },
]

export default function BuiltForTheRoad() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold text-fp-ink md:text-3xl">
          Built for real life on the road
        </h2>
        <p className="mt-4 text-base leading-relaxed text-fp-gray-600">
          Road-tripping with kids who can&apos;t wait? Charging your EV and wondering which nearby
          café actually has a clean, open restroom? FlushPin shows you verified restrooms around
          you in seconds — with access codes shared by travelers like you. No more begging for
          keys, no more locked doors, no more detours. From Irvine to rural Bavaria, if it&apos;s
          on the map, FlushPin can find it.
        </p>
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-3">
        {features.map(({ title, description }) => (
          <div key={title}>
            <h3 className="text-lg font-semibold text-fp-ink">{title}</h3>
            <p className="mt-2 text-base leading-relaxed text-fp-gray-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
