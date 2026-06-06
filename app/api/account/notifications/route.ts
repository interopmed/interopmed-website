import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
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

    const body = await request.json()
    const data = {
      accountUpdates: Boolean(body.accountUpdates),
      productNotes: Boolean(body.productNotes),
      supportReplies: Boolean(body.supportReplies),
      securityAlerts: Boolean(body.securityAlerts),
      weeklyDigest: Boolean(body.weeklyDigest),
    }

    const preferences = await prisma.authNotificationPreference.upsert({
      where: { userId: accountUser.id },
      create: {
        userId: accountUser.id,
        ...data,
      },
      update: data,
      select: {
        accountUpdates: true,
        productNotes: true,
        supportReplies: true,
        securityAlerts: true,
        weeklyDigest: true,
        updatedAt: true,
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { preferences },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to update notification preferences',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
