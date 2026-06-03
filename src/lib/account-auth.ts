export const ACCOUNT_SESSION_COOKIE = 'interopmed_account_session'

const DEFAULT_ACCOUNT_PASSWORD = '12305'
const DEFAULT_SESSION_VALUE = 'interopmed-account-session'

export function getAccountPassword() {
  return process.env.ACCOUNT_PASSWORD || DEFAULT_ACCOUNT_PASSWORD
}

export function getAccountSessionValue() {
  return process.env.ACCOUNT_SESSION_SECRET || DEFAULT_SESSION_VALUE
}

export function isValidAccountPassword(password: string) {
  return password === getAccountPassword()
}

export function isValidAccountSession(value?: string) {
  return Boolean(value && value === getAccountSessionValue())
}

export function getSafeAccountRedirectPath(
  value: string | string[] | undefined,
  fallback = '/account'
) {
  if (typeof value !== 'string') {
    return fallback
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  if (value.startsWith('/account') || value.startsWith('/studio')) {
    return value
  }

  return fallback
}
