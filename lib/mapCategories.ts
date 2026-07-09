export type MapCategorySlug = 'coffee' | 'fast-food' | 'pharmacy' | 'grocery' | 'gas' | 'mall'

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
      "mcdonald",
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
    types: ['supermarket', 'grocery_store', 'grocery', 'market'],
    keywords: ['market', 'grocery', 'trader joe', 'whole foods', 'albertsons', 'ralphs', 'vons', 'safeway'],
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
    types: ['shopping_mall', 'mall'],
    keywords: ['mall', 'plaza', 'shopping center', 'galleria', 'outlet', 'town center'],
  },
}

export const MAP_CATEGORY_SLUGS = Object.keys(MAP_CATEGORY_CONFIG) as MapCategorySlug[]

export function isMapCategorySlug(value: string | null | undefined): value is MapCategorySlug {
  return !!value && value in MAP_CATEGORY_CONFIG
}

export function matchesMapCategory(
  place: { name?: string; address?: string; type?: string },
  slug: MapCategorySlug,
): boolean {
  const config = MAP_CATEGORY_CONFIG[slug]
  const type = (place.type || '').toLowerCase()

  if (config.types.some((t) => type === t || type.includes(t))) {
    return true
  }

  const haystack = `${(place.name || '').toLowerCase()} ${(place.address || '').toLowerCase()}`
  return config.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))
}
