'use client'

import { Coffee, Fuel, ShoppingBag, Sandwich, UtensilsCrossed, Users } from 'lucide-react'
import CategoryButton from './CategoryButton'
import { HOME_CATEGORY_SHORTCUTS } from '../../lib/homeNavigate'
import type { MapCategorySlug } from '../../lib/mapCategories'

const GRID_CATEGORIES = HOME_CATEGORY_SHORTCUTS.filter((c) => c.slug != null)

const CATEGORY_META = {
  gas: { icon: Fuel, iconClassName: 'text-[#2dd4bf]' },
  coffee: { icon: Coffee, iconClassName: 'text-[#fb923c]' },
  grocery: { icon: ShoppingBag, iconClassName: 'text-[#4ade80]' },
  restaurant: { icon: UtensilsCrossed, iconClassName: 'text-[#f87171]' },
  'fast-food': { icon: Sandwich, iconClassName: 'text-[#fdba74]' },
  public: { icon: Users, iconClassName: 'text-[#5eead4]' },
} as const

type Props = {
  activeCategory: MapCategorySlug | null
  disabled?: boolean
  onSelect: (slug: MapCategorySlug | null) => void
}

export default function CategoryShortcuts({ activeCategory, disabled = false, onSelect }: Props) {
  return (
    <div className="mt-8 w-full">
      <h2 className="mb-4 text-left text-base font-semibold text-white">Search by place type</h2>
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
