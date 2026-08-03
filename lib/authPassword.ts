export const MIN_PASSWORD_LENGTH = 8

export type PasswordValidation =
  | { ok: true }
  | { ok: false; message: string }

export function validateNewPassword(password: string): PasswordValidation {
  const value = password ?? ''
  if (!value.trim()) {
    return { ok: false, message: 'Enter a new password.' }
  }
  if (value.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }
  }
  return { ok: true }
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): PasswordValidation {
  const base = validateNewPassword(password)
  if (!base.ok) return base
  if (password !== confirmation) {
    return { ok: false, message: 'Passwords do not match.' }
  }
  return { ok: true }
}
