import BusinessStickerSection from '../components/home/BusinessStickerSection'
import BuiltForTheRoad from '../components/home/BuiltForTheRoad'
import HomeHero from '../components/home/HomeHero'
import HowItWorks from '../components/home/HowItWorks'
import StatsStrip from '../components/home/StatsStrip'
import TripStopsCard from '../components/home/TripStopsCard'
import HomeInviteCta from '../components/share/HomeInviteCta'
import { isTripStopsEnabled } from '../lib/serverReleaseFlags'

export default function HomePage() {
  const tripStopsEnabled = isTripStopsEnabled()

  return (
    <main className="bg-fp-surface">
      <HomeHero />
      <div className="bg-fp-white">
        {tripStopsEnabled ? <TripStopsCard /> : null}
        <BuiltForTheRoad />
        <StatsStrip />
        <HowItWorks />
        <HomeInviteCta />
        <BusinessStickerSection />
      </div>
    </main>
  )
}
