import { randomBytes, createHash } from 'node:crypto'
import { prisma } from '@/lib/prisma'

export type ApiKeyEnvironment = 'live' | 'test'

export type CreateApiKeyInput = {
  userId: string
  name: string
  environment?: ApiKeyEnvironment
  scopes?: string[]
  rateLimit?: number
  expiresInDays?: number | null
}

export type SafeApiKeyRecord = {
  id: string
  name: string
  keyPrefix: string
  environment: string
  scopes: string[]
  rateLimit: number
  isActive: boolean
  lastUsedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}

function hashApiKey(secretKey: string): string {
  return createHash('sha256').update(secretKey).digest('hex')
}

/**
 * Generate a new cryptographically secure API key
 * Format: im_[live|test]_[28 chars base64url]
 * Only the SHA-256 hash and truncated prefix are stored in database.
 */
export async function generateApiKey(input: CreateApiKeyInput): Promise<{
  secretKey: string
  apiKey: SafeApiKeyRecord
}> {
  const env: ApiKeyEnvironment = input.environment === 'test' ? 'test' : 'live'
  const entropy = randomBytes(24).toString('base64url')
  const secretKey = `im_${env}_${entropy}`
  
  // Truncate prefix for visual verification (e.g., im_live_a1b2c3...)
  const keyPrefix = `${secretKey.slice(0, 16)}...`
  const keyHash = hashApiKey(secretKey)

  const expiresAt =
    input.expiresInDays && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : null

  const record = await prisma.apiKey.create({
    data: {
      userId: input.userId,
      name: input.name.trim() || 'Default API Key',
      keyPrefix,
      keyHash,
      environment: env,
      scopes: input.scopes && input.scopes.length > 0 ? input.scopes : ['read', 'write', 'fhir'],
      rateLimit: input.rateLimit || 1000,
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      environment: true,
      scopes: true,
      rateLimit: true,
      isActive: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  return {
    secretKey,
    apiKey: record,
  }
}

/**
 * Verify an incoming API key from request headers
 */
export async function verifyApiKey(rawKey: string): Promise<{
  ok: boolean
  user?: { id: string; username: string; email: string; role: string }
  apiKey?: SafeApiKeyRecord
  error?: string
}> {
  if (!rawKey || typeof rawKey !== 'string') {
    return { ok: false, error: 'Missing API key' }
  }

  const trimmed = rawKey.trim().replace(/^Bearer\s+/i, '')
  if (!trimmed.startsWith('im_live_') && !trimmed.startsWith('im_test_')) {
    return { ok: false, error: 'Invalid API key format (expected im_live_... or im_test_...)' }
  }

  const keyHash = hashApiKey(trimmed)

  const record = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
    },
  })

  if (!record || !record.isActive) {
    return { ok: false, error: 'API key is invalid or has been revoked' }
  }

  if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: 'API key has expired' }
  }

  if (!record.user.isActive) {
    return { ok: false, error: 'User account is inactive' }
  }

  // Update lastUsedAt asynchronously (best effort)
  prisma.apiKey
    .update({
      where: { id: record.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => {})

  return {
    ok: true,
    user: record.user,
    apiKey: {
      id: record.id,
      name: record.name,
      keyPrefix: record.keyPrefix,
      environment: record.environment,
      scopes: record.scopes,
      rateLimit: record.rateLimit,
      isActive: record.isActive,
      lastUsedAt: record.lastUsedAt,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    },
  }
}

/**
 * List all API keys belonging to a user (never reveals secret or hash)
 */
export async function listUserApiKeys(userId: string): Promise<SafeApiKeyRecord[]> {
  return prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      environment: true,
      scopes: true,
      rateLimit: true,
      isActive: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  })
}

/**
 * Revoke (deactivate) an API key
 */
export async function revokeUserApiKey(keyId: string, userId: string): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: { id: keyId, userId },
    data: { isActive: false },
  })

  return result.count > 0
}

/**
 * Delete an API key permanently
 */
export async function deleteUserApiKey(keyId: string, userId: string): Promise<boolean> {
  const result = await prisma.apiKey.deleteMany({
    where: { id: keyId, userId },
  })

  return result.count > 0
}

/**
 * Extract and authenticate API key from standard Request headers
 * Supports `Authorization: Bearer <key>` and `x-api-key: <key>`
 */
export async function authenticateApiKeyFromHeaders(headers: Headers) {
  const authHeader = headers.get('authorization')
  const xApiKey = headers.get('x-api-key')

  const candidateKey = authHeader?.replace(/^Bearer\s+/i, '') || xApiKey

  if (!candidateKey) {
    return null
  }

  return verifyApiKey(candidateKey)
}
