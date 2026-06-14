import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const scrypt = promisify(scryptCallback)

export const ACCOUNT_SESSION_COOKIE = 'interopmed_account_session'

export const ACCOUNT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8
const PASSWORD_RESET_MAX_AGE_SECONDS = 60 * 30
const PASSWORD_SALT_BYTES = 16
const PASSWORD_KEY_LENGTH = 64

type SessionUser = {
  id: string
  username: string
  publicHandle: string
  email: string
  displayName: string | null
  profileImage: string | null
  role: string
}

type CachedSessionUser = {
  cacheExpiresAt: number
  sessionExpiresAt: number
  user: SessionUser
}

const SESSION_CACHE_TTL_MS = 30_000
const globalForAccountAuth = globalThis as typeof globalThis & {
  accountSessionCache?: Map<string, CachedSessionUser>
}
const accountSessionCache =
  globalForAccountAuth.accountSessionCache || new Map<string, CachedSessionUser>()

if (process.env.NODE_ENV !== 'production') {
  globalForAccountAuth.accountSessionCache = accountSessionCache
}

type CreateAuthUserInput = {
  username: string
  publicHandle?: string | null
  email: string
  displayName?: string | null
  password: string
  role: string
}

type AuthenticateAccountResult =
  | { ok: true; user: Awaited<ReturnType<typeof prisma.authUser.findFirst>> extends infer T ? Exclude<T, null> : never }
  | {
      ok: false
      error: 'missing_identifier' | 'missing_password' | 'user_not_found' | 'password_incorrect'
    }

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function hashAccountSessionToken(rawToken: string) {
  return sha256(rawToken)
}

export function invalidateAccountSessionCache(rawToken: string | undefined) {
  if (rawToken) {
    accountSessionCache.delete(hashAccountSessionToken(rawToken))
  }
}

function encodePasswordHash(salt: Buffer, derivedKey: Buffer) {
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`
}

function decodePasswordHash(value: string) {
  const [saltHex, hashHex] = value.split(':')

  if (!saltHex || !hashHex) {
    return null
  }

  return {
    salt: Buffer.from(saltHex, 'hex'),
    hash: Buffer.from(hashHex, 'hex'),
  }
}

export function getBootstrapAccountConfig() {
  const username = process.env.ACCOUNT_BOOTSTRAP_USERNAME
  const email = process.env.ACCOUNT_BOOTSTRAP_EMAIL
  const password = process.env.ACCOUNT_BOOTSTRAP_PASSWORD

  if (!username || !email || !password) {
    return null
  }

  return {
    username,
    email,
    password,
    displayName: process.env.ACCOUNT_BOOTSTRAP_DISPLAY_NAME || null,
  }
}

export function normalizeAuthIdentifier(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function normalizeDisplayName(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized || null
}

export function normalizePublicHandle(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export async function hashPassword(password: string) {
  const salt = randomBytes(PASSWORD_SALT_BYTES)
  const derivedKey = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer
  return encodePasswordHash(salt, derivedKey)
}

export async function verifyPassword(password: string, storedHash: string) {
  const decoded = decodePasswordHash(storedHash)

  if (decoded === null) {
    return false
  }

  const derivedKey = (await scrypt(password, decoded.salt, PASSWORD_KEY_LENGTH)) as Buffer

  if (derivedKey.length !== decoded.hash.length) {
    return false
  }

  return timingSafeEqual(derivedKey, decoded.hash)
}

export async function ensureBootstrapAccount() {
  const existingUserCount = await prisma.authUser.count()

  if (existingUserCount > 0) {
    return
  }

  const bootstrap = getBootstrapAccountConfig()

  if (!bootstrap) {
    return
  }

  await prisma.authUser.create({
    data: {
      username: bootstrap.username,
      publicHandle: normalizePublicHandle(bootstrap.displayName || bootstrap.username),
      email: bootstrap.email,
      displayName: bootstrap.displayName,
      role: 'admin',
      passwordHash: await hashPassword(bootstrap.password),
    },
  })
}

export async function authenticateAccount(identifier: string, password: string) {
  const result = await authenticateAccountDetailed(identifier, password)
  return result.ok ? result.user : null
}

export async function authenticateAccountDetailed(
  identifier: string,
  password: string
): Promise<AuthenticateAccountResult> {
  const normalizedIdentifier = normalizeAuthIdentifier(identifier)

  if (!normalizedIdentifier) {
    return { ok: false, error: 'missing_identifier' }
  }

  if (!password) {
    return { ok: false, error: 'missing_password' }
  }

  await ensureBootstrapAccount()

  const user = await prisma.authUser.findFirst({
    where: {
      isActive: true,
      OR: [
        { username: normalizedIdentifier },
        { email: normalizedIdentifier },
      ],
    },
  })

  if (!user) {
    return { ok: false, error: 'user_not_found' }
  }

  const passwordValid = await verifyPassword(password, user.passwordHash)

  if (!passwordValid) {
    return { ok: false, error: 'password_incorrect' }
  }

  await prisma.authUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return { ok: true, user }
}

export async function createAuthUser(input: CreateAuthUserInput) {
  const username = normalizeAuthIdentifier(input.username)
  const publicHandle = normalizePublicHandle(input.publicHandle)
  const email = normalizeAuthIdentifier(input.email)
  const displayName = normalizeDisplayName(input.displayName)
  const password = String(input.password || '')

  if (!username || !publicHandle || !email || password.length < 8) {
    throw new Error('username, public handle, email, and a password of at least 8 characters are required')
  }

  if (publicHandle.length < 3 || publicHandle.length > 60) {
    throw new Error('Public handle must be between 3 and 60 characters')
  }

  const existingUser = await prisma.authUser.findFirst({
    where: {
      OR: [{ username }, { publicHandle }, { email }],
    },
  })

  if (existingUser) {
    throw new Error('A user with that username, public handle, or email already exists')
  }

  return prisma.authUser.create({
    data: {
      username,
      publicHandle,
      email,
      displayName,
      role: input.role,
      passwordHash: await hashPassword(password),
    },
  })
}

export async function updateAuthUserPassword(userId: string, password: string) {
  if (String(password || '').length < 8) {
    throw new Error('Password must be at least 8 characters long')
  }

  return prisma.authUser.update({
    where: { id: userId },
    data: {
      passwordHash: await hashPassword(password),
    },
  })
}

export async function createAccountSession(userId: string) {
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = sha256(rawToken)

  await prisma.authSession.create({
    data: {
      sessionTokenHash: tokenHash,
      userId,
      expiresAt: new Date(Date.now() + ACCOUNT_SESSION_MAX_AGE_SECONDS * 1000),
    },
  })

  return rawToken
}

export async function deleteAccountSession(rawToken: string | undefined) {
  if (!rawToken) {
    return
  }

  const tokenHash = hashAccountSessionToken(rawToken)
  accountSessionCache.delete(tokenHash)

  await prisma.authSession.deleteMany({
    where: {
      sessionTokenHash: tokenHash,
    },
  })
}

export async function deleteAccountSessionsForUser(userId: string) {
  for (const [tokenHash, session] of accountSessionCache) {
    if (session.user.id === userId) {
      accountSessionCache.delete(tokenHash)
    }
  }

  await prisma.authSession.deleteMany({
    where: { userId },
  })
}

export async function createPasswordResetToken(identifier: string) {
  const normalizedIdentifier = normalizeAuthIdentifier(identifier)

  if (!normalizedIdentifier) {
    return null
  }

  await ensureBootstrapAccount()

  const user = await prisma.authUser.findFirst({
    where: {
      isActive: true,
      OR: [{ username: normalizedIdentifier }, { email: normalizedIdentifier }],
    },
  })

  if (!user) {
    return null
  }

  await prisma.authPasswordResetToken.deleteMany({
    where: { userId: user.id },
  })

  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = sha256(rawToken)

  await prisma.authPasswordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + PASSWORD_RESET_MAX_AGE_SECONDS * 1000),
    },
  })

  return {
    rawToken,
    user,
    expiresAt: new Date(Date.now() + PASSWORD_RESET_MAX_AGE_SECONDS * 1000),
  }
}

export async function getPasswordResetTokenRecord(rawToken: string) {
  if (!rawToken) {
    return null
  }

  const record = await prisma.authPasswordResetToken.findUnique({
    where: {
      tokenHash: sha256(rawToken),
    },
    include: {
      user: true,
    },
  })

  if (
    !record ||
    record.usedAt !== null ||
    record.expiresAt <= new Date() ||
    !record.user.isActive
  ) {
    return null
  }

  return record
}

export async function consumePasswordResetToken(rawToken: string, password: string) {
  const record = await getPasswordResetTokenRecord(rawToken)

  if (!record) {
    throw new Error('This password reset link is invalid or has expired')
  }

  await updateAuthUserPassword(record.userId, password)
  await deleteAccountSessionsForUser(record.userId)

  await prisma.authPasswordResetToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  })

  return record.user
}

export async function getAccountSessionUserFromToken(rawToken: string | undefined) {
  if (!rawToken) {
    return null
  }

  const now = Date.now()
  const tokenHash = hashAccountSessionToken(rawToken)
  const cachedSession = accountSessionCache.get(tokenHash)

  if (
    cachedSession &&
    cachedSession.cacheExpiresAt > now &&
    cachedSession.sessionExpiresAt > now
  ) {
    return cachedSession.user
  }

  accountSessionCache.delete(tokenHash)

  const session = await prisma.authSession.findUnique({
    where: {
      sessionTokenHash: tokenHash,
    },
    select: {
      expiresAt: true,
      user: {
        select: {
          id: true,
          username: true,
          publicHandle: true,
          email: true,
          displayName: true,
          profileImage: true,
          role: true,
          isActive: true,
        },
      },
    },
  })

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    await deleteAccountSession(rawToken)
    return null
  }

  const user = {
    id: session.user.id,
    username: session.user.username,
    publicHandle: session.user.publicHandle,
    email: session.user.email,
    displayName: session.user.displayName,
    profileImage: session.user.profileImage,
    role: session.user.role,
  }

  accountSessionCache.set(tokenHash, {
    cacheExpiresAt: Math.min(now + SESSION_CACHE_TTL_MS, session.expiresAt.getTime()),
    sessionExpiresAt: session.expiresAt.getTime(),
    user,
  })

  return user
}

export const getAccountSessionUser = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ACCOUNT_SESSION_COOKIE)?.value
  const user = await getAccountSessionUserFromToken(rawToken)

  if (!user) {
    return null
  }

  return user
})

export async function requireAccountUser(nextPath = '/account') {
  const user = await getAccountSessionUser()

  if (!user) {
    redirect(`/account/login?next=${encodeURIComponent(nextPath)}`)
  }

  return user
}

export async function requireAdminUser(nextPath = '/account') {
  const user = await requireAccountUser(nextPath)

  if (user.role !== 'admin') {
    redirect('/user')
  }

  return user
}

export async function requireMemberUser(nextPath = '/user') {
  const user = await getAccountSessionUser()

  if (!user) {
    redirect(`/account/login?next=${encodeURIComponent(nextPath)}`)
  }

  if (user.role === 'admin') {
    redirect('/account')
  }

  return user
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

  if (
    value.startsWith('/account') ||
    value.startsWith('/user') ||
    value.startsWith('/people') ||
    value.startsWith('/stream') ||
    value.startsWith('/studio') ||
    value.startsWith('/interopmind')
  ) {
    return value
  }

  return fallback
}
