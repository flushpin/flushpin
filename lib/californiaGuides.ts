export type CaliforniaGuideRegion = {
  slug: string
  name: string
  shortName: string
  description: string
  intro: string
  mapQuery: string
  landmarks: {
    name: string
    area: string
    accessHint: string
    bestFor: string
    mapQuery: string
  }[]
  businessAngle: string
}

export const californiaGuideRegions: CaliforniaGuideRegion[] = [
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    shortName: 'LA',
    description:
      'Find restroom access around Los Angeles visitor areas including Hollywood, Santa Monica, Venice, Griffith Park, Downtown LA, and The Grove.',
    intro:
      'Los Angeles restroom access is spread across parks, beaches, shopping centers, cafes, museums, and neighborhood businesses. This guide helps visitors start with the busiest areas, then open FlushPin to check nearby access notes.',
    mapQuery: 'Los Angeles restroom',
    businessAngle:
      'In LA, a visitor looking for a bathroom is often already near a cafe, bakery, market, or quick-service counter. FlushPin can turn that moment into a QR scan, a short offer, and a measurable local campaign.',
    landmarks: [
      {
        name: 'Hollywood Sign and Griffith Observatory area',
        area: 'Hollywood Hills / Griffith Park',
        accessHint:
          'Start with park facilities, visitor areas, and nearby cafe corridors. Access may vary by trailhead, hour, and posted park rules.',
        bestFor: 'Tourists, hikers, rideshare drivers, and families before or after the viewpoint.',
        mapQuery: 'Hollywood Sign Griffith Observatory restroom',
      },
      {
        name: 'Hollywood Walk of Fame',
        area: 'Hollywood Boulevard',
        accessHint:
          'Check museums, shopping centers, hotels, fast-casual restaurants, and verified FlushPin listings near Hollywood Boulevard.',
        bestFor: 'Visitors walking between attractions who need a quick indoor option.',
        mapQuery: 'Hollywood Walk of Fame restroom',
      },
      {
        name: 'Santa Monica Pier',
        area: 'Santa Monica',
        accessHint:
          'Look for pier, beach, park, and nearby restaurant options. Beach and public facilities can be busy on weekends.',
        bestFor: 'Beach visitors, families, tourists, and delivery workers around the pier.',
        mapQuery: 'Santa Monica Pier restroom',
      },
      {
        name: 'Venice Beach Boardwalk',
        area: 'Venice',
        accessHint:
          'Start with beach facilities, boardwalk businesses, coffee shops, and nearby public areas; check live access before walking far.',
        bestFor: 'Beachgoers, walkers, tourists, and street retail visitors.',
        mapQuery: 'Venice Beach restroom',
      },
      {
        name: 'The Grove and Farmers Market',
        area: 'Fairfax',
        accessHint:
          'Shopping centers and food halls are usually the first places to check. Business rules and hours still apply.',
        bestFor: 'Shoppers, parents, tourists, and lunch traffic.',
        mapQuery: 'The Grove Los Angeles restroom',
      },
      {
        name: 'Downtown LA and Grand Central Market',
        area: 'DTLA',
        accessHint:
          'Check food halls, hotels, coffee shops, museums, and transit-adjacent businesses with current access notes.',
        bestFor: 'Office visitors, tourists, transit riders, and delivery drivers.',
        mapQuery: 'Grand Central Market Los Angeles restroom',
      },
    ],
  },
  {
    slug: 'san-francisco',
    name: 'San Francisco',
    shortName: 'San Francisco',
    description:
      'Find restroom access around San Francisco visitor areas including Pier 39, Fisherman’s Wharf, Ferry Building, Union Square, Golden Gate Park, and the Mission.',
    intro:
      'San Francisco is dense, walkable, and full of visitor traffic, which makes restroom planning important. This guide points people to the areas worth checking first, then sends them to FlushPin for live nearby access.',
    mapQuery: 'San Francisco restroom',
    businessAngle:
      'In San Francisco, restroom access can be a daily retail pressure point. A QR access flow gives businesses a calmer way to set expectations, reduce repeated staff interruptions, and show a relevant offer before the code.',
    landmarks: [
      {
        name: 'Pier 39 and Fisherman’s Wharf',
        area: 'Northeast waterfront',
        accessHint:
          'Check pier facilities, shopping areas, restaurants, hotels, and nearby verified listings. Tourist volume can change the best option quickly.',
        bestFor: 'Tourists, families, tour groups, and waterfront shoppers.',
        mapQuery: 'Pier 39 Fisherman’s Wharf restroom',
      },
      {
        name: 'Ferry Building',
        area: 'Embarcadero',
        accessHint:
          'Look around the market hall, waterfront businesses, transit areas, and cafes near the Embarcadero.',
        bestFor: 'Commuters, food hall visitors, tourists, and market shoppers.',
        mapQuery: 'Ferry Building San Francisco restroom',
      },
      {
        name: 'Union Square',
        area: 'Downtown San Francisco',
        accessHint:
          'Start with department stores, hotels, cafes, shopping centers, and public-facing venues with current access notes.',
        bestFor: 'Shoppers, tourists, hotel visitors, and downtown workers.',
        mapQuery: 'Union Square San Francisco restroom',
      },
      {
        name: 'Golden Gate Park',
        area: 'Richmond / Sunset',
        accessHint:
          'Park facilities, museums, gardens, and nearby commercial streets are the first places to check.',
        bestFor: 'Families, walkers, museum visitors, and cyclists.',
        mapQuery: 'Golden Gate Park restroom',
      },
      {
        name: 'Mission District and Dolores Park',
        area: 'Mission',
        accessHint:
          'Check park facilities, cafes, taquerias, bakeries, bars, and local shops. Access rules may be customer-only.',
        bestFor: 'Weekend park visitors, neighborhood shoppers, and food traffic.',
        mapQuery: 'Dolores Park Mission District restroom',
      },
    ],
  },
  {
    slug: 'orange-county',
    name: 'Orange County',
    shortName: 'OC',
    description:
      'Find restroom access around Orange County destinations including Disneyland area, Irvine Spectrum, Newport Beach Pier, South Coast Plaza, Laguna Beach, and Huntington Beach.',
    intro:
      'Orange County is FlushPin’s home base and a natural first market: malls, beach towns, family attractions, offices, and local businesses all create high-intent restroom searches.',
    mapQuery: 'Orange County restroom',
    businessAngle:
      'Orange County is ideal for testing FlushPin’s business model because local cafes, bakeries, restaurants, and retail shops sit directly in the path of families, shoppers, drivers, and beach visitors who need restroom access.',
    landmarks: [
      {
        name: 'Disneyland and Anaheim Resort area',
        area: 'Anaheim',
        accessHint:
          'Check resort-area hotels, shopping areas, restaurants, and verified FlushPin listings outside ticketed spaces.',
        bestFor: 'Families, tourists, rideshare drivers, and convention visitors.',
        mapQuery: 'Disneyland Anaheim Resort restroom',
      },
      {
        name: 'Irvine Spectrum Center',
        area: 'Irvine',
        accessHint:
          'Shopping centers are strong first-check locations; confirm current business hours and access notes.',
        bestFor: 'Shoppers, families, office visitors, and evening dining traffic.',
        mapQuery: 'Irvine Spectrum restroom',
      },
      {
        name: 'Newport Beach Pier',
        area: 'Newport Beach',
        accessHint:
          'Look for beach facilities, nearby restaurants, coffee shops, and public areas around the pier.',
        bestFor: 'Beachgoers, tourists, cyclists, and families.',
        mapQuery: 'Newport Beach Pier restroom',
      },
      {
        name: 'South Coast Plaza',
        area: 'Costa Mesa',
        accessHint:
          'Large retail centers, restaurants, and adjacent hotels are the first options to check.',
        bestFor: 'Shoppers, travelers, retail workers, and families.',
        mapQuery: 'South Coast Plaza restroom',
      },
      {
        name: 'Laguna Beach village and Main Beach',
        area: 'Laguna Beach',
        accessHint:
          'Check beach facilities, galleries, cafes, restaurants, and nearby verified local listings.',
        bestFor: 'Beach visitors, art walk traffic, tourists, and families.',
        mapQuery: 'Laguna Beach Main Beach restroom',
      },
      {
        name: 'Huntington Beach Pier',
        area: 'Huntington Beach',
        accessHint:
          'Start with beach facilities, pier-adjacent businesses, surf shops, restaurants, and public areas.',
        bestFor: 'Beachgoers, surfers, tourists, and weekend crowds.',
        mapQuery: 'Huntington Beach Pier restroom',
      },
    ],
  },
  {
    slug: 'san-diego',
    name: 'San Diego',
    shortName: 'San Diego',
    description:
      'Find restroom access around San Diego visitor areas including Balboa Park, Gaslamp Quarter, La Jolla Cove, Old Town, Seaport Village, and Mission Beach.',
    intro:
      'San Diego combines beaches, parks, family attractions, nightlife, and tourist corridors. A web guide lets FlushPin learn which areas create the most restroom-intent searches before building deeper app features.',
    mapQuery: 'San Diego restroom',
    businessAngle:
      'San Diego’s visitor neighborhoods are full of coffee shops, taco shops, markets, and quick-service restaurants that can use restroom traffic as a measurable offer channel rather than a staff headache.',
    landmarks: [
      {
        name: 'Balboa Park',
        area: 'Central San Diego',
        accessHint:
          'Check park facilities, museums, gardens, cafes, and visitor areas. Hours and access rules can change by venue.',
        bestFor: 'Families, museum visitors, walkers, and tourists.',
        mapQuery: 'Balboa Park restroom',
      },
      {
        name: 'Gaslamp Quarter',
        area: 'Downtown San Diego',
        accessHint:
          'Restaurants, hotels, cafes, bars, and retail corridors are the first places to check for access notes.',
        bestFor: 'Nightlife visitors, convention traffic, tourists, and drivers.',
        mapQuery: 'Gaslamp Quarter restroom',
      },
      {
        name: 'La Jolla Cove',
        area: 'La Jolla',
        accessHint:
          'Look for coastal facilities, restaurants, galleries, coffee shops, and nearby visitor areas.',
        bestFor: 'Tourists, beach visitors, walkers, and families.',
        mapQuery: 'La Jolla Cove restroom',
      },
      {
        name: 'Old Town San Diego',
        area: 'Old Town',
        accessHint:
          'Check visitor areas, restaurants, transit-adjacent stops, shops, and public-facing venues.',
        bestFor: 'Tourists, families, transit riders, and restaurant traffic.',
        mapQuery: 'Old Town San Diego restroom',
      },
      {
        name: 'Seaport Village and Embarcadero',
        area: 'Waterfront',
        accessHint:
          'Start with waterfront retail, restaurants, hotels, and public areas near the harbor.',
        bestFor: 'Tourists, families, walkers, and cruise-adjacent traffic.',
        mapQuery: 'Seaport Village restroom',
      },
      {
        name: 'Mission Beach and Belmont Park',
        area: 'Mission Beach',
        accessHint:
          'Check beach facilities, amusement area businesses, cafes, and boardwalk-adjacent options.',
        bestFor: 'Beachgoers, families, cyclists, and weekend visitors.',
        mapQuery: 'Mission Beach Belmont Park restroom',
      },
    ],
  },
]

export function getCaliforniaGuideRegion(slug: string) {
  return californiaGuideRegions.find(region => region.slug === slug)
}
