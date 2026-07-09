import BusinessHero from './BusinessHero'
import BusinessProblem from './BusinessProblem'
import BusinessHowItWorks from './BusinessHowItWorks'
import BusinessMath from './BusinessMath'
import BusinessFeatures from './BusinessFeatures'
import BusinessPricing from './BusinessPricing'
import BusinessFaq from './BusinessFaq'
import BusinessFinalCta from './BusinessFinalCta'

export default function BusinessPageContent() {
  return (
    <main className="bg-fp-white">
      <BusinessHero />
      <BusinessProblem />
      <BusinessHowItWorks />
      <BusinessMath />
      <BusinessFeatures />
      <BusinessPricing />
      <BusinessFaq />
      <BusinessFinalCta />
    </main>
  )
}
