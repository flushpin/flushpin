/** FlushPin iOS App Store listing (com.flushpin.app) */
export const APP_STORE_ID = '6779367395'

/** Override with NEXT_PUBLIC_APP_STORE_URL on Vercel if the listing URL changes */
export const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ||
  `https://apps.apple.com/us/app/flushpin/id${APP_STORE_ID}`

export const IOS_BUNDLE_ID = 'com.flushpin.app'
