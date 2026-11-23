import { createHmac, timingSafeEqual } from 'node:crypto'

const DEFAULT_SHARED_SECRET = 'interopmed-studio-dev-secret'

type StudioLaunchPayload = {
  exp: number
  returnTo: string
  websiteUrl?: string
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function createSignature(payload: string) {
  return createHmac('sha256', getStudioSharedSecret())
    .update(payload)
    .digest('base64url')
}

export function getStudioSharedSecret() {
  return process.env.INTEROPMED_STUDIO_SHARED_SECRET || DEFAULT_SHARED_SECRET
}

export function getStudioUrl() {
  const value = process.env.INTEROPMED_STUDIO_URL?.trim()

  if (!value) {
    return null
  }

  try {
    const url = new URL(value)
    // Never redirect to localhost / 127.0.0.1 in production environments
    if (
      (process.env.NODE_ENV === 'production' || process.env.VERCEL) &&
      (url.hostname === '127.0.0.1' || url.hostname === 'localhost')
    ) {
      return null
    }
    return url.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

export function getSafeStudioReturnPath(
  value: string | string[] | undefined,
  fallback = '/'
) {
  if (typeof value !== 'string') {
    return fallback
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  return value
}

export function createStudioLaunchToken(returnTo: string, websiteUrl?: string, maxAgeSeconds = 60) {
  const payload: StudioLaunchPayload = {
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    returnTo,
    websiteUrl,
  }
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = createSignature(encodedPayload)

  return `${encodedPayload}.${signature}`
}

export function readStudioLaunchToken(token: string) {
  const [encodedPayload, signature] = token.split('.')

  if (!encodedPayload || !signature) {
    return null
  }

  const expectedSignature = createSignature(encodedPayload)
  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as StudioLaunchPayload

    if (typeof payload.exp !== 'number' || typeof payload.returnTo !== 'string') {
      return null
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
