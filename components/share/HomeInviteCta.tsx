'use client'

import { Users } from 'lucide-react'
import ShareFlushPin from './ShareFlushPin'

/**
 * Optional homepage invite CTA — compact, brand-aligned, not a generic share widget.
 */
export default function HomeInviteCta() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16" aria-labelledby="home-invite-title">
      <div className="overflow-hidden rounded-[28px] border border-fp-border bg-gradient-to-br from-fp-white via-fp-white to-fp-teal-tint shadow-[var(--fp-shadow-soft)]">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
          <div className="flex flex-col justify-center px-6 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-fp-teal-tint text-fp-teal">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="m-0 mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-fp-teal">
              Invite friends
            </p>
            <h2
              id="home-invite-title"
              className="m-0 text-2xl font-semibold tracking-[-0.03em] text-fp-ink sm:text-3xl"
            >
              Know someone who needs FlushPin?
            </h2>
            <p className="m-0 mt-3 max-w-md text-[15px] leading-relaxed text-fp-gray-600">
              Help travelers, parents, caregivers, and coworkers find verified restrooms faster.
              Share FlushPin in one tap.
            </p>
          </div>
          <div className="border-t border-fp-border bg-fp-white/70 px-4 py-5 sm:px-6 sm:py-6 lg:border-l lg:border-t-0">
            <ShareFlushPin surface="homepage" variant="compact" hideTitle />
          </div>
        </div>
      </div>
    </section>
  )
}
