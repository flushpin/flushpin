export type SignOutClient = {
  auth: {
    signOut: () => Promise<{ error: { message?: string } | null }>
  }
}

export type SignOutResult = { ok: true } | { ok: false; message: string }

/**
 * Sign out only reports success when Supabase confirms it.
 * Callers must not clear signed-in UI when ok is false.
 */
export async function signOutSafely(client: SignOutClient): Promise<SignOutResult> {
  try {
    const { error } = await client.auth.signOut()
    if (error) {
      return {
        ok: false,
        message: error.message?.trim() || 'Could not sign out. Please try again.',
      }
    }
    return { ok: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Could not sign out. Please try again.'
    return { ok: false, message }
  }
}
