import BusinessCta from '../components/home/BusinessCta'
import BuiltForTheRoad from '../components/home/BuiltForTheRoad'
import HomeHero from '../components/home/HomeHero'
import HowItWorks from '../components/home/HowItWorks'
import RecentUpdates from '../components/home/RecentUpdates'
import StatsStrip from '../components/home/StatsStrip'

export default function HomePage() {
  return (
    <main className="bg-[#0a0f0e]">
      <HomeHero />
      <div className="bg-fp-white">
        <BuiltForTheRoad />
        <StatsStrip />
        <RecentUpdates />
        <HowItWorks />
        <BusinessCta />
      </div>
    </main>
  )
}
