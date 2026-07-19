'use client'

import BusinessCta from '../components/home/BusinessCta'
import BuiltForTheRoad from '../components/home/BuiltForTheRoad'
import CategoryGrid from '../components/home/CategoryGrid'
import HeroSection from '../components/home/HeroSection'
import HowItWorks from '../components/home/HowItWorks'
import RecentUpdates from '../components/home/RecentUpdates'
import StatsStrip from '../components/home/StatsStrip'

export default function HomePage() {
  return (
    <main className="bg-fp-white">
      <HeroSection />
      <BuiltForTheRoad />
      <CategoryGrid />
      <StatsStrip />
      <RecentUpdates />
      <HowItWorks />
      <BusinessCta />
    </main>
  )
}
