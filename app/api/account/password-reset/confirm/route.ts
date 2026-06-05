import { NextRequest, NextResponse } from 'next/server'
import { consumePasswordResetToken } from '@/lib/account-auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = String(body.token || '')
    const password = String(body.password || '')

    await consumePasswordResetToken(token, password)

    return NextResponse.json<ApiResponse>({
      success: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error consuming password reset token:', error)
    const message = error instanceof Error ? error.message : 'Failed to reset password'
    const status =
      message === 'This password reset link is invalid or has expired'
        ? 400
        : message === 'Password must be at least 8 characters long'
          ? 400
          : 500

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status }
    )
  }
}
