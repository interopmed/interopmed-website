import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  ACCOUNT_SESSION_MAX_AGE_SECONDS,
  authenticateAccount,
  createAccountSession,
} from '@/lib/account-auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const identifier = String(body.identifier || '')
  const password = String(body.password || '')

  const user = await authenticateAccount(identifier, password)

  if (!user) {
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Invalid username/email or password',
        timestamp: new Date().toISOString(),
      },
      { status: 401 }
    )
  }

  const sessionToken = await createAccountSession(user.id)

  const response = NextResponse.json<ApiResponse>({
    success: true,
    data: {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    },
    timestamp: new Date().toISOString(),
  })

  response.cookies.set(ACCOUNT_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ACCOUNT_SESSION_MAX_AGE_SECONDS,
  })

  return response
}
