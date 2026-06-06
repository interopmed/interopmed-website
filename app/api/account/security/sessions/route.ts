import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
  hashAccountSessionToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    const accountUser = await getAccountSessionUserFromToken(rawToken)

    if (!accountUser || !rawToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Account login is required',
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      )
    }

    const result = await prisma.authSession.deleteMany({
      where: {
        userId: accountUser.id,
        sessionTokenHash: {
          not: hashAccountSessionToken(rawToken),
        },
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { revokedSessions: result.count },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error revoking account sessions:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to revoke sessions',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
