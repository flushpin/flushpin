'use client'

import { ACCESS_TYPE_CHIPS, type AccessType } from '../lib/accessType'
import { useLang } from '../lib/LanguageContext'

const TEAL = '#0EB5AB'

type Props = {
  value: AccessType
  onChange: (value: AccessType) => void
}

export default function AccessTypeChips({ value, onChange }: Props) {
  const { t } = useLang()

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {ACCESS_TYPE_CHIPS.map((chip) => {
        const active = value === chip.id
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onChange(chip.id)}
            style={{
              padding: '9px 14px',
              borderRadius: '20px',
              border: `1.5px solid ${active ? TEAL : '#E5E7EB'}`,
              background: active ? '#ECFBF9' : '#FAFAFA',
              fontSize: '13px',
              fontWeight: 600,
              color: active ? TEAL : '#6B7280',
              cursor: 'pointer',
            }}
          >
            {chip.emoji} {t.accessType.chips[chip.labelKey]}
          </button>
        )
      })}
    </div>
  )
}
