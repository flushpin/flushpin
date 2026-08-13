/** FlushPin iOS App Store listing (com.flushpin.app) */
export const APP_STORE_ID = '6779367395'

/** Override with NEXT_PUBLIC_APP_STORE_URL on Vercel if the listing URL changes */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  `https://apps.apple.com/us/app/flushpin/id${APP_STORE_ID}`

export const IOS_BUNDLE_ID = 'com.flushpin.app'

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.flushpin.com'

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '').replace(/\/$/, '')

/** Supabase OAuth callback — use this domain + URL in Apple Developer (not flushpin.com). */
export const SUPABASE_APPLE_CALLBACK = supabaseHost
  ? `https://${supabaseHost}/auth/v1/callback`
  : 'https://ygpsgolbxyychdnzeorj.supabase.co/auth/v1/callback'

/** Apple Services ID for Sign in with Apple JS on web (must match Apple Developer + Supabase Client IDs). */
export const APPLE_WEB_CLIENT_ID =
  process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || `${IOS_BUNDLE_ID}.web`
