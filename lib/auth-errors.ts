type AuthLikeError = { message?: string; code?: string }

export function isUnconfirmedEmailError(error: AuthLikeError): boolean {
  const msg = (error.message ?? '').toLowerCase()
  const code = (error.code ?? '').toLowerCase()
  return (
    code === 'email_not_confirmed' ||
    msg.includes('email not confirmed') ||
    msg.includes('email address not confirmed')
  )
}

export function isAlreadyRegisteredError(error: AuthLikeError): boolean {
  return (error.message ?? '').toLowerCase().includes('already registered')
}

export function formatEmailTemplate(template: string, email: string): string {
  return template.replace('{email}', email)
}
