/**
 * Restrained brand offers for restroom detail.
 * Only these four brands may show a promotions card, and only with a verified official URL.
 */

export type BrandPromotionKey = 'starbucks' | 'mcdonalds' | 'chipotle' | 'pandaExpress'

export type BrandPromotion = {
  key: BrandPromotionKey
  enabled: boolean
  brandLabel: string
  label: string
  supportingLine: string
  /** Official brand rewards / offers destination — never invent campaign copy. */
  url: string
  match: RegExp
}

export const BRAND_PROMOTIONS: Record<BrandPromotionKey, BrandPromotion> = {
  starbucks: {
    key: 'starbucks',
    enabled: true,
    brandLabel: 'Starbucks',
    label: 'View Starbucks offers',
    supportingLine: 'See current Starbucks Rewards offers on Starbucks.com.',
    url: 'https://www.starbucks.com/rewards',
    match: /\bstarbucks\b/i,
  },
  mcdonalds: {
    key: 'mcdonalds',
    enabled: true,
    brandLabel: "McDonald's",
    label: "View McDonald’s offers",
    supportingLine: 'See current deals on the official McDonald’s site.',
    url: 'https://www.mcdonalds.com/us/en-us/deals.html',
    match: /\bmc\s*donald'?s\b|\bmcdonalds\b/i,
  },
  chipotle: {
    key: 'chipotle',
    enabled: true,
    brandLabel: 'Chipotle',
    label: 'View Chipotle offers',
    supportingLine: 'See Chipotle Rewards on the official Chipotle site.',
    url: 'https://www.chipotle.com/rewards',
    match: /\bchipotle\b/i,
  },
  pandaExpress: {
    key: 'pandaExpress',
    enabled: true,
    brandLabel: 'Panda Express',
    label: 'View Panda Express offers',
    supportingLine: 'See Panda Rewards on the official Panda Express site.',
    url: 'https://www.pandaexpress.com/rewards',
    match: /\bpanda\s*express\b/i,
  },
}

export function normalizeBusinessName(name: string | null | undefined): string {
  return (name ?? '').trim()
}

/** Resolve an eligible brand promotion from a restroom / business name. */
export function resolveBrandPromotion(
  name: string | null | undefined,
): BrandPromotion | null {
  const normalized = normalizeBusinessName(name)
  if (!normalized) return null

  for (const promo of Object.values(BRAND_PROMOTIONS)) {
    if (!promo.enabled) continue
    if (!promo.url.startsWith('https://')) continue
    if (promo.match.test(normalized)) return promo
  }
  return null
}

export function openExternalOffer(url: string): void {
  if (typeof window === 'undefined') return
  if (!url.startsWith('https://')) return
  window.open(url, '_blank', 'noopener,noreferrer')
}
