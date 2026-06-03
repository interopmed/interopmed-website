import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from 'node:crypto'
import { promisify } from 'node:util'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const scrypt = promisify(scryptCallback)

export const ACCOUNT_SESSION_COOKIE = 'interopmed_account_session'

const DEFAULT_BOOTSTRAP_USERNAME = 'admin'
const DEFAULT_BOOTSTRAP_EMAIL = 'admin@interopmed.local'
const DEFAULT_BOOTSTRAP_PASSWORD = 'password123'

export const ACCOUNT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8
const PASSWORD_SALT_BYTES = 16
const PASSWORD_KEY_LENGTH = 64

type SessionUser = {
  id: string
  username: string
  email: string
  displayName: string | null
  role: string
}

type CreateAuthUserInput = {
  username: string
  email: string
  displayName?: string | null
  password: string
  role: string
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
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
  return {
    username: process.env.ACCOUNT_BOOTSTRAP_USERNAME || DEFAULT_BOOTSTRAP_USERNAME,
    email: process.env.ACCOUNT_BOOTSTRAP_EMAIL || DEFAULT_BOOTSTRAP_EMAIL,
    password: process.env.ACCOUNT_BOOTSTRAP_PASSWORD || DEFAULT_BOOTSTRAP_PASSWORD,
    displayName: process.env.ACCOUNT_BOOTSTRAP_DISPLAY_NAME || 'InteropMed Admin',
  }
}

export function normalizeAuthIdentifier(value: unknown) {
  return String(value || '').trim().toLowerCase()
}

export function normalizeDisplayName(value: unknown) {
  const normalized = String(value || '').trim()
  return normalized || null
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

  await prisma.authUser.create({
    data: {
      username: bootstrap.username,
      email: bootstrap.email,
      displayName: bootstrap.displayName,
      role: 'admin',
      passwordHash: await hashPassword(bootstrap.password),
    },
  })
}

export async function authenticateAccount(identifier: string, password: string) {
  const normalizedIdentifier = normalizeAuthIdentifier(identifier)

  if (!normalizedIdentifier || !password) {
    return null
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
    return null
  }

  const passwordValid = await verifyPassword(password, user.passwordHash)

  if (!passwordValid) {
    return null
  }

  await prisma.authUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

  return user
}

export async function createAuthUser(input: CreateAuthUserInput) {
  const username = normalizeAuthIdentifier(input.username)
  const email = normalizeAuthIdentifier(input.email)
  const displayName = normalizeDisplayName(input.displayName)
  const password = String(input.password || '')

  if (!username || !email || password.length < 8) {
    throw new Error('username, email, and a password of at least 8 characters are required')
  }

  const existingUser = await prisma.authUser.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  })

  if (existingUser) {
    throw new Error('A user with that username or email already exists')
  }

  return prisma.authUser.create({
    data: {
      username,
      email,
      displayName,
      role: input.role,
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

  await prisma.authSession.deleteMany({
    where: {
      sessionTokenHash: sha256(rawToken),
    },
  })
}

export async function getAccountSessionUserFromToken(rawToken: string | undefined) {
  if (!rawToken) {
    return null
  }

  const session = await prisma.authSession.findUnique({
    where: {
      sessionTokenHash: sha256(rawToken),
    },
    include: {
      user: true,
    },
  })

  if (!session || session.expiresAt <= new Date() || !session.user.isActive) {
    await deleteAccountSession(rawToken)
    return null
  }

  return {
    id: session.user.id,
    username: session.user.username,
    email: session.user.email,
    displayName: session.user.displayName,
    role: session.user.role,
  }
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
