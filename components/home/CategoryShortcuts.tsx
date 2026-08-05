'use client'

import { Coffee, Fuel, ShoppingBag, Sandwich, UtensilsCrossed, Users } from 'lucide-react'
import CategoryButton from './CategoryButton'
import { HOME_CATEGORY_SHORTCUTS } from '../../lib/homeNavigate'
import type { MapCategorySlug } from '../../lib/mapCategories'

const GRID_CATEGORIES = HOME_CATEGORY_SHORTCUTS.filter((c) => c.slug != null)

const CATEGORY_META = {
  gas: { icon: Fuel, iconClassName: 'text-fp-teal-dark' },
  coffee: { icon: Coffee, iconClassName: 'text-fp-teal-dark' },
  grocery: { icon: ShoppingBag, iconClassName: 'text-fp-teal-dark' },
  restaurant: { icon: UtensilsCrossed, iconClassName: 'text-fp-teal-dark' },
  'fast-food': { icon: Sandwich, iconClassName: 'text-fp-teal-dark' },
  public: { icon: Users, iconClassName: 'text-fp-teal-dark' },
} as const

type Props = {
  activeCategory: MapCategorySlug | null
  disabled?: boolean
  onSelect: (slug: MapCategorySlug | null) => void
}

export default function CategoryShortcuts({ activeCategory, disabled = false, onSelect }: Props) {
  return (
    <div className="mt-8 w-full">
      <h2 className="mb-4 text-left text-[15px] font-semibold tracking-tight text-fp-ink">
        Search by place type
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {GRID_CATEGORIES.map(({ slug, label, ariaLabel }) => {
          if (!slug || !(slug in CATEGORY_META)) return null
          const meta = CATEGORY_META[slug as keyof typeof CATEGORY_META]
          return (
            <CategoryButton
              key={slug}
              label={label}
              icon={meta.icon}
              iconClassName={meta.iconClassName}
              ariaLabel={ariaLabel}
              active={slug === activeCategory}
              disabled={disabled}
              onClick={() => onSelect(slug)}
            />
          )
        })}
      </div>
    </div>
  )
}
