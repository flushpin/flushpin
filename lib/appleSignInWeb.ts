'use client'

import { supabase } from './supabase'
import { APPLE_WEB_CLIENT_ID, SITE_URL } from './site'

const APPLE_SCRIPT_SRC =
  'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js'

type AppleAuthResponse = {
  authorization: {
    id_token: string
    code: string
    state?: string
  }
  user?: {
    email?: string
    name?: {
      firstName?: string
      middleName?: string
      lastName?: string
    }
  }
}

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void
        signIn: () => Promise<AppleAuthResponse>
      }
    }
  }
}

let scriptPromise: Promise<void> | null = null

function loadAppleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Apple Sign In is only available in the browser.'))
  }
  if (window.AppleID) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${APPLE_SCRIPT_SRC}"]`)
    if (existing) {
      if (window.AppleID) {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Could not load Apple Sign In.')))
      return
    }

    const script = document.createElement('script')
    script.src = APPLE_SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Could not load Apple Sign In.'))
    document.head.appendChild(script)
  })

  return scriptPromise
}

function getAppleClientId(): string {
  if (!APPLE_WEB_CLIENT_ID) {
    throw new Error(
      'Apple Sign In is not configured for web yet. Use Google or email, or contact support.'
    )
  }
  return APPLE_WEB_CLIENT_ID
}

function errorMessage(error: unknown): string {
  const record = error as { error?: string; message?: string }
  return record?.error ?? record?.message ?? String(error ?? '')
}

function isUserCancelled(error: unknown): boolean {
  return /popup_closed_by_user|user_cancelled|canceled|cancelled/i.test(errorMessage(error))
}

function isInvalidClient(error: unknown): boolean {
  return /invalid_client|invalid request|invalid redirect/i.test(errorMessage(error))
}

const APPLE_SETUP_MESSAGE =
  'Apple Sign In is not set up for web yet. In Apple Developer, create Services ID com.flushpin.app.web with domain flushpin.com and return URL https://www.flushpin.com/auth/apple/callback, then add it to Supabase Apple Client IDs.'

/** Web Apple Sign In via Apple JS + Supabase id_token (same pattern as iOS app). */
export async function signInWithAppleWeb(): Promise<{ error?: string }> {
  try {
    await loadAppleScript()

    const nonce = crypto.randomUUID()
    const redirectURI = `${SITE_URL}/auth/apple/callback`

    window.AppleID!.auth.init({
      clientId: getAppleClientId(),
      scope: 'name email',
      redirectURI,
      usePopup: true,
      nonce,
    })

    const response = await window.AppleID!.auth.signIn()
    const idToken = response.authorization.id_token

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: idToken,
      nonce,
    })

    if (error) return { error: error.message }
    if (!data.session) return { error: 'Apple Sign In did not create a session.' }

    if (response.user?.name) {
      const fullName = [
        response.user.name.firstName,
        response.user.name.middleName,
        response.user.name.lastName,
      ]
        .filter(Boolean)
        .join(' ')

      if (fullName) {
        await supabase.auth.updateUser({
          data: {
            full_name: fullName,
            given_name: response.user.name.firstName,
            family_name: response.user.name.lastName,
          },
        })
      }
    }

    return {}
  } catch (error) {
    if (isUserCancelled(error)) return { error: 'Sign in cancelled.' }
    if (isInvalidClient(error)) return { error: APPLE_SETUP_MESSAGE }
    if (error instanceof Error) return { error: error.message }
    return { error: 'Apple Sign In failed. Try Google or email instead.' }
  }
}
