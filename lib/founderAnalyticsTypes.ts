export type DayCount = { date: string; label: string; count: number }

export type MetricValue = {
  value: number | null
  status: 'ready' | 'pending' | 'unavailable'
  note?: string
}

export type FounderAnalyticsPayload = {
  generatedAt: string
  investorSafe: boolean
  today: {
    uniqueVisitors: MetricValue
    pageViews: MetricValue
    newRegisteredUsers: MetricValue
    signedInActiveUsers: MetricValue
    restroomSearches: MetricValue
    restroomDetailViews: MetricValue
    accessViews: MetricValue
    communityContributions: MetricValue
    appStoreClicks: MetricValue
  }
  trends: {
    visitors7d: DayCount[]
    visitors30d: DayCount[]
    newUsers7d: DayCount[]
    newUsers30d: DayCount[]
    accessViews7d: DayCount[]
    accessViews30d: DayCount[]
    contributions7d: DayCount[]
    contributions30d: DayCount[]
  }
  geography: {
    topCountries: Array<{ name: string; visitors: number; pageviews: number }>
    topCities: Array<{ name: string; accessViews: number }>
    topRestrooms: Array<{ name: string; city: string | null; accessViews: number }>
    topRoutes: Array<{ route: string; pageviews: number; visitors: number }>
    topReferrers: Array<{ host: string; visitors: number; pageviews: number }>
    topDevices: Array<{ device: string; visitors: number; pageviews: number }>
  }
  community: {
    codesAdded: number
    accessRulesAdded: number
    codeChangedReports: number
    accessibilityUpdates: number
    babyChangingUpdates: number
    verifiedContributions: number
  }
  business: {
    offerViews: number
    continueToAccessClicks: number
    qrRedemptions: MetricValue
    conversionRate: number | null
  }
  sharing: {
    opened: MetricValue
    completed: MetricValue
    whatsapp: MetricValue
    sms: MetricValue
    email: MetricValue
    copy: MetricValue
    native: MetricValue
  }
  sources: {
    vercelConfigured: boolean
    vercelError?: string
  }
}
