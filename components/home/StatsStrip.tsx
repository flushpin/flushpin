const stats = [
  { value: '34,000+', label: 'restroom locations' },
  { value: 'Worldwide', label: 'live location data' },
  { value: 'Community', label: 'verified access info' },
]

export default function StatsStrip() {
  return (
    <section className="w-full bg-fp-teal-tint px-4 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 text-center sm:grid-cols-3">
        {stats.map(({ value, label }) => (
          <div key={label}>
            <p className="text-[40px] font-bold leading-tight text-fp-ink">{value}</p>
            <p className="mt-1 text-sm text-fp-teal-dark">{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
