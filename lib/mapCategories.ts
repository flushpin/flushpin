export type MapCategorySlug =
  | 'coffee'
  | 'fast-food'
  | 'pharmacy'
  | 'grocery'
  | 'gas'
  | 'mall'
  | 'restaurant'
  | 'public'

export type MapCategoryConfig = {
  label: string
  slug: MapCategorySlug
  href: string
  /** Values from restroom `type` (Google primaryType or OSM amenity). */
  types: string[]
  /** Case-insensitive fallback match on name + address. */
  keywords: string[]
}

export const MAP_CATEGORY_CONFIG: Record<MapCategorySlug, MapCategoryConfig> = {
  coffee: {
    label: 'Coffee shops',
    slug: 'coffee',
    href: '/map?category=coffee',
    types: ['cafe', 'coffee_shop', 'coffee'],
    keywords: ['starbucks', 'coffee', 'cafe', 'peet', 'blue bottle', 'dutch bros', 'philz'],
  },
  'fast-food': {
    label: 'Fast food',
    slug: 'fast-food',
    href: '/map?category=fast-food',
    types: ['fast_food', 'fast_food_restaurant', 'hamburger_restaurant', 'meal_takeaway'],
    keywords: [
      'mcdonald',
      'burger',
      'taco',
      'chipotle',
      'kfc',
      'subway',
      'wendy',
      'in-n-out',
      'jack in the box',
      'popeyes',
      'arby',
      'del taco',
    ],
  },
  pharmacy: {
    label: 'Pharmacies',
    slug: 'pharmacy',
    href: '/map?category=pharmacy',
    types: ['pharmacy', 'drugstore'],
    keywords: ['cvs', 'walgreens', 'pharmacy', 'rite aid'],
  },
  grocery: {
    label: 'Grocery',
    slug: 'grocery',
    href: '/map?category=grocery',
    types: ['supermarket', 'grocery_store', 'grocery', 'market', 'convenience_store'],
    keywords: ['market', 'grocery', 'trader joe', 'whole foods', 'albertsons', 'ralphs', 'vons', 'safeway', 'target', 'costco'],
  },
  gas: {
    label: 'Gas stations',
    slug: 'gas',
    href: '/map?category=gas',
    types: ['fuel', 'gas_station'],
    keywords: ['gas', 'shell', 'chevron', 'arco', '76', 'mobil', 'exxon', 'valero', 'texaco'],
  },
  mall: {
    label: 'Shopping malls',
    slug: 'mall',
    href: '/map?category=mall',
    types: ['shopping_mall', 'mall', 'department_store'],
    keywords: ['mall', 'plaza', 'shopping center', 'galleria', 'outlet', 'town center'],
  },
  restaurant: {
    label: 'Restaurants',
    slug: 'restaurant',
    href: '/map?category=restaurant',
    types: [
      'restaurant',
      'american_restaurant',
      'italian_restaurant',
      'mexican_restaurant',
      'chinese_restaurant',
      'japanese_restaurant',
      'indian_restaurant',
      'thai_restaurant',
      'pizza_restaurant',
      'seafood_restaurant',
      'steak_house',
      'bar_and_grill',
    ],
    keywords: ['restaurant', 'grill', 'kitchen', 'bistro', 'sushi', 'ramen', 'taqueria'],
  },
  public: {
    label: 'Public restrooms',
    slug: 'public',
    href: '/map?category=public',
    types: ['public_restroom', 'library', 'park', 'toilets'],
    keywords: ['public restroom', 'restroom', 'toilet', 'library', 'park'],
  },
}

export const MAP_CATEGORY_SLUGS = Object.keys(MAP_CATEGORY_CONFIG) as MapCategorySlug[]

export function isMapCategorySlug(value: string | null | undefined): value is MapCategorySlug {
  return !!value && value in MAP_CATEGORY_CONFIG
}

function placeTypeTokens(place: {
  name?: string
  address?: string
  type?: string
  types?: string[]
}): string[] {
  const tokens = new Set<string>()
  if (place.type) tokens.add(place.type.toLowerCase())
  for (const t of place.types ?? []) {
    if (t) tokens.add(String(t).toLowerCase())
  }
  return [...tokens]
}

function haystack(place: { name?: string; address?: string; type?: string; types?: string[] }): string {
  const typePart = placeTypeTokens(place).join(' ')
  return `${typePart} ${(place.name || '').toLowerCase()} ${(place.address || '').toLowerCase()}`.trim()
}

export function matchesMapCategory(
  place: {
    name?: string
    address?: string
    type?: string
    types?: string[]
    category_group?: string
  },
  slug: MapCategorySlug,
): boolean {
  if (slug === 'public') {
    return place.category_group === 'public_restroom'
  }

  const config = MAP_CATEGORY_CONFIG[slug]
  const tokens = placeTypeTokens(place)
  const text = haystack(place)

  if (slug === 'restaurant') {
    const isFastFood = tokens.some(
      (t) => t.includes('fast_food') || t === 'meal_takeaway' || t === 'hamburger_restaurant',
    )
    const isCafe = tokens.some((t) => t === 'cafe' || t === 'coffee_shop' || t.includes('coffee'))
    if (isFastFood || isCafe) return false
  }

  if (slug === 'coffee') {
    const isFastFood = tokens.some((t) => t.includes('fast_food'))
    if (isFastFood) return false
  }

  if (config.types.some((t) => tokens.some((token) => token === t || token.includes(t)))) {
    return true
  }

  return config.keywords.some((keyword) => text.includes(keyword.toLowerCase()))
}
