import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
  hashPassword,
  normalizeAuthIdentifier,
  normalizeDisplayName,
  verifyPassword,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const accountUser = await getAccountSessionUserFromToken(
      request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    )

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
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')

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
      passwordHash?: string
    } = {
      email,
      displayName,
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
        email: true,
        displayName: true,
        role: true,
      },
    })

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
