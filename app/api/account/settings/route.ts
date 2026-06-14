import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
  hashPassword,
  invalidateAccountSessionCache,
  normalizeAuthIdentifier,
  normalizeDisplayName,
  normalizePublicHandle,
  verifyPassword,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PUBLIC_IDENTITY_CHANGE_INTERVAL_MS = 60 * 24 * 60 * 60 * 1000

function nextChangeDate(lastChangedAt: Date | null) {
  return lastChangedAt
    ? new Date(lastChangedAt.getTime() + PUBLIC_IDENTITY_CHANGE_INTERVAL_MS)
    : null
}

function formatChangeDate(value: Date) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(value)
}

export async function PATCH(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    const accountUser = await getAccountSessionUserFromToken(rawSessionToken)

    if (!accountUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Account login is required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      )
    }

    const existingUser = await prisma.authUser.findUnique({
      where: { id: accountUser.id },
    })

    if (!existingUser || !existingUser.isActive) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Account user not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    const body = await request.json()
    const email = normalizeAuthIdentifier(body.email)
    const displayName = normalizeDisplayName(body.displayName)
    const publicHandle = normalizePublicHandle(body.publicHandle)
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')
    const displayNameChanged = displayName !== existingUser.displayName
    const publicHandleChanged = publicHandle !== existingUser.publicHandle
    const now = new Date()
    const nextDisplayNameChangeAt = nextChangeDate(existingUser.displayNameChangedAt)
    const nextPublicHandleChangeAt = nextChangeDate(existingUser.publicHandleChangedAt)

    if (!email) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'email is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (!EMAIL_PATTERN.test(email)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Please enter a valid email address',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (displayName && displayName.length > 120) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Display name must be 120 characters or fewer',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (!publicHandle || publicHandle.length < 3 || publicHandle.length > 60) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Public handle must be between 3 and 60 characters',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (displayNameChanged && nextDisplayNameChangeAt && nextDisplayNameChangeAt > now) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Display name can be changed again on ${formatChangeDate(nextDisplayNameChangeAt)}`,
          timestamp: now.toISOString(),
        },
        { status: 429 }
      )
    }

    if (publicHandleChanged && nextPublicHandleChangeAt && nextPublicHandleChangeAt > now) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Public handle can be changed again on ${formatChangeDate(nextPublicHandleChangeAt)}`,
          timestamp: now.toISOString(),
        },
        { status: 429 }
      )
    }

    const handleOwner = await prisma.authUser.findUnique({ where: { publicHandle } })

    if (handleOwner && handleOwner.id !== existingUser.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Another account already uses that public handle',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      )
    }

    const emailOwner = await prisma.authUser.findUnique({ where: { email } })

    if (emailOwner && emailOwner.id !== existingUser.id) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Another account already uses that email',
          timestamp: new Date().toISOString(),
        },
        { status: 409 }
      )
    }

    const data: {
      email: string
      displayName: string | null
      publicHandle: string
      displayNameChangedAt?: Date
      publicHandleChangedAt?: Date
      passwordHash?: string
    } = {
      email,
      displayName,
      publicHandle,
    }

    if (displayNameChanged) {
      data.displayNameChangedAt = now
    }

    if (publicHandleChanged) {
      data.publicHandleChangedAt = now
    }

    if (newPassword || currentPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'New password must be at least 8 characters long',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        )
      }

      const currentPasswordValid = await verifyPassword(currentPassword, existingUser.passwordHash)

      if (!currentPasswordValid) {
        return NextResponse.json<ApiResponse>(
          {
            success: false,
            error: 'Current password is incorrect',
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        )
      }

      data.passwordHash = await hashPassword(newPassword)
    }

    const user = await prisma.authUser.update({
      where: { id: existingUser.id },
      data,
      select: {
        id: true,
        username: true,
        publicHandle: true,
        email: true,
        displayName: true,
        displayNameChangedAt: true,
        publicHandleChangedAt: true,
        role: true,
      },
    })
    invalidateAccountSessionCache(rawSessionToken)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { user },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating account settings:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update account settings',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
