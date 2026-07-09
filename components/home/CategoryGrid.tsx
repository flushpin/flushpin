import Link from 'next/link'
import {
  Coffee,
  Sandwich,
  Pill,
  ShoppingCart,
  Fuel,
  Store,
  type LucideIcon,
} from 'lucide-react'
import { MAP_CATEGORY_CONFIG, type MapCategorySlug } from '../../lib/mapCategories'

const categories: { slug: MapCategorySlug; icon: LucideIcon }[] = [
  { slug: 'coffee', icon: Coffee },
  { slug: 'fast-food', icon: Sandwich },
  { slug: 'pharmacy', icon: Pill },
  { slug: 'grocery', icon: ShoppingCart },
  { slug: 'gas', icon: Fuel },
  { slug: 'mall', icon: Store },
]

export default function CategoryGrid() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16 md:px-6">
      <h2 className="mb-8 text-2xl font-bold text-fp-ink">Browse by category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map(({ slug, icon: Icon }) => {
          const { label, href } = MAP_CATEGORY_CONFIG[slug]
          return (
            <Link
              key={slug}
              href={href}
              className="fp-card flex flex-col items-center gap-3 px-4 py-6 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-fp-teal no-underline"
            >
              <Icon className="h-6 w-6 text-fp-teal-dark" aria-hidden="true" />
              <span className="text-sm text-fp-ink">{label}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
