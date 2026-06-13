/** Set NEXT_PUBLIC_APP_STORE_URL in Vercel when App Store listing ID is available */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  'https://apps.apple.com/us/search?term=FlushPin+restroom'

export const IOS_BUNDLE_ID = 'com.flushpin.app'
