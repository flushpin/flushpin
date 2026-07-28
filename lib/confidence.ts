export type ConfidenceLevel = 'high' | 'reliable' | 'stale' | 'unverified'

export interface Confidence {
  level: ConfidenceLevel
  label: string
  detail: string
  ageDays: number | null
  ring: number
}

function relDays(days: number): string {
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 14) return 'last week'
  if (days < 60) return `${Math.round(days / 7)} weeks ago`
  return `${Math.round(days / 30)} months ago`
}

export function computeConfidence(pinUpdatedAt: string | null | undefined): Confidence {
  const none: Confidence = {
    level: 'unverified', label: 'Needs verification',
    detail: 'No visit confirmed yet', ageDays: null, ring: 0.08,
  }
  if (!pinUpdatedAt) return none
  const t = new Date(pinUpdatedAt).getTime()
  if (Number.isNaN(t)) return none

  const days = Math.floor((Date.now() - t) / 86_400_000)
  const when = relDays(days)
  if (days <= 7)  return { level: 'high',       label: 'Highly reliable',  detail: `Confirmed ${when}`,      ageDays: days, ring: 1 }
  if (days <= 30) return { level: 'reliable',   label: 'Reliable',         detail: `Confirmed ${when}`,      ageDays: days, ring: 0.66 }
  if (days <= 90) return { level: 'stale',      label: 'May have changed', detail: `Last confirmed ${when}`, ageDays: days, ring: 0.33 }
  return          { level: 'unverified', label: 'Needs verification', detail: `Last confirmed ${when}`, ageDays: days, ring: 0.12 }
}
