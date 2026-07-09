'use client'

import Link from 'next/link'
import { useLang } from '../lib/LanguageContext'

const STATS = [
  { valueKey: 'metricScansValue' as const, labelKey: 'metricScans' as const },
  { valueKey: 'metricPeakValue' as const, labelKey: 'metricPeak' as const },
  { valueKey: 'metricOffersValue' as const, labelKey: 'metricOffers' as const },
  { valueKey: 'metricRepeatValue' as const, labelKey: 'metricRepeat' as const },
]

export default function OwnerPitchSection() {
  const { t } = useLang()
  const p = t.home

  return (
    <section className="bg-[#161c1a] rounded-3xl p-10 md:p-14 grid md:grid-cols-2 gap-10 items-start shadow-[0_28px_72px_rgba(7,25,23,.2)]">
      <div>
        <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-6 font-[Manrope,Inter,system-ui,sans-serif]">
          {p.businessTitle}
        </h2>
        <p className="text-gray-300 text-base leading-relaxed mb-2">
          {p.ownerPitchDescBefore}{' '}
          <span className="text-white font-semibold">{p.ownerPitchStat1}</span>{' '}
          {p.ownerPitchDescMid1}{' '}
          <span className="text-white font-semibold">{p.ownerPitchStat2}</span>.
          {' '}{p.ownerPitchDescMid2}{' '}
          <span className="text-white font-semibold">{p.ownerPitchStat3}</span>{' '}
          {p.ownerPitchDescAfter}
        </p>
        <p className="text-gray-500 text-xs mb-8">{p.ownerPitchSources}</p>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/business"
            className="bg-[#5eae9d] hover:bg-[#4d9887] text-[#0e1513] font-semibold rounded-full px-6 py-3 text-sm transition no-underline"
          >
            <span className="block text-[10px] uppercase tracking-wide font-bold opacity-80">
              {p.businessPlanSmall}
            </span>
            {p.businessPlanStrong}
          </Link>
          <Link
            href="/contact"
            className="bg-white hover:bg-gray-100 text-[#0e1513] font-semibold rounded-full px-6 py-3 text-sm transition no-underline"
          >
            <span className="block text-[10px] uppercase tracking-wide font-bold opacity-60">
              {p.partnershipSmall}
            </span>
            {p.partnershipStrong}
          </Link>
        </div>
      </div>

      <div className="bg-[#1e2523] rounded-2xl p-6 border border-white/5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <span className="text-[#5eae9d] text-xs font-bold uppercase tracking-wide">
            {p.dashboardSampleLabel}
          </span>
          <span className="text-gray-500 text-[10px] uppercase tracking-wide text-right">
            {p.dashboardPreviewNote}
          </span>
        </div>

        <div className="space-y-2 mb-6">
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white/40 w-[85%]" />
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[#5eae9d] w-[62%]" />
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-white/40 w-[38%]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {STATS.map(({ valueKey, labelKey }) => (
            <div
              key={labelKey}
              className="bg-[#161c1a] rounded-xl p-4 border border-white/5"
            >
              <div className="text-white text-2xl font-bold">{p[valueKey]}</div>
              <div className="text-gray-400 text-xs mt-1">{p[labelKey]}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
