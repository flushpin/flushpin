'use client'

import { supabase } from './supabase'
import { SITE_URL, SUPABASE_APPLE_CALLBACK } from './site'

const APPLE_OAUTH_SETUP =
  `Apple web login needs Supabase OAuth setup. In Apple Developer → Services ID → Website URLs, use domain "${SUPABASE_APPLE_CALLBACK.replace('https://', '').replace('/auth/v1/callback', '')}" and return URL "${SUPABASE_APPLE_CALLBACK}". Then run "npm run generate:apple-secret" and paste the secret in Supabase → Authentication → Apple. Client IDs order: Services ID first, then com.flushpin.app.`

/** Web Apple Sign In via Supabase OAuth (recommended — uses supabase.co in Apple Developer). */
export async function signInWithAppleOAuth(): Promise<{ error?: string }> {
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_URL

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${origin}/map`,
      scopes: 'email name',
    },
  })

  if (error) {
    if (/missing OAuth secret|validation_failed|Unsupported provider/i.test(error.message)) {
      return { error: APPLE_OAUTH_SETUP }
    }
    return { error: error.message }
  }

  return {}
}

export { APPLE_OAUTH_SETUP, SUPABASE_APPLE_CALLBACK }
