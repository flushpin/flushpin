import { DoorOpen, LockOpen, Users, type LucideIcon } from 'lucide-react'

type Update = {
  status: string
  icon: LucideIcon
  venue: string
  city: string
  quote: string
  time: string
}

// TODO: wire to Supabase recent pin_submissions later.
const updates: Update[] = [
  {
    status: 'Code verified',
    icon: LockOpen,
    venue: 'Blue Bottle Coffee',
    city: 'San Francisco',
    quote: 'Door code still works — staff said it changes monthly.',
    time: '2 hours ago',
  },
  {
    status: 'Customers only',
    icon: Users,
    venue: 'Target',
    city: 'Irvine',
    quote: 'Restroom is at the back near customer service. No code needed.',
    time: '5 hours ago',
  },
  {
    status: 'Open access',
    icon: DoorOpen,
    venue: 'Whole Foods Market',
    city: 'Los Angeles',
    quote: 'Clean and accessible. No purchase required.',
    time: 'Yesterday',
  },
]

export default function RecentUpdates() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <h2 className="mb-8 text-2xl font-bold text-fp-ink">Recent community updates</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {updates.map(({ status, icon: Icon, venue, city, quote, time }) => (
          <article key={`${venue}-${city}`} className="fp-card flex flex-col gap-4 p-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-fp-teal-tint px-3 py-1 text-xs font-medium text-fp-teal-dark">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {status}
            </span>
            <div>
              <p className="text-base font-semibold text-fp-ink">
                {venue} · {city}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fp-gray-600">{quote}</p>
              <p className="mt-3 text-sm text-fp-gray-400">{time}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
