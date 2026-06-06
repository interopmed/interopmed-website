import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
  hashAccountSessionToken,
  hashPassword,
  verifyPassword,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    const accountUser = await getAccountSessionUserFromToken(rawToken)

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

    const body = await request.json()
    const currentPassword = String(body.currentPassword || '')
    const newPassword = String(body.newPassword || '')
    const signOutOtherSessions = Boolean(body.signOutOtherSessions)

    if (!currentPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Current password is required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

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

    if (newPassword === currentPassword) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'New password must be different from the current password',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const existingUser = await prisma.authUser.findUnique({
      where: { id: accountUser.id },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
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

    await prisma.authUser.update({
      where: { id: existingUser.id },
      data: {
        passwordHash: await hashPassword(newPassword),
      },
    })

    let revokedSessions = 0

    if (signOutOtherSessions && rawToken) {
      const result = await prisma.authSession.deleteMany({
        where: {
          userId: existingUser.id,
          sessionTokenHash: {
            not: hashAccountSessionToken(rawToken),
          },
        },
      })
      revokedSessions = result.count
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { revokedSessions },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating account password:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update password',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
