import { NextRequest, NextResponse } from 'next/server'
import { createPasswordResetToken } from '@/lib/account-auth'
import { ApiResponse } from '@/types'

function getOrigin(request: NextRequest) {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.headers.get('origin') ||
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const resetToken = await createPasswordResetToken(String(body.identifier || ''))

    if (!resetToken) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'No active account matches that username or email',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    const resetUrl = `${getOrigin(request)}/account/reset-password/${resetToken.rawToken}`

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          resetUrl,
          expiresAt: resetToken.expiresAt.toISOString(),
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating password reset token:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create password reset link',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
