import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  ACCOUNT_SESSION_MAX_AGE_SECONDS,
  authenticateAccountDetailed,
  createAccountSession,
} from '@/lib/account-auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const identifier = String(body.identifier || '').trim()
    const password = String(body.password || '')

    const result = await authenticateAccountDetailed(identifier, password)

    if (!result.ok) {
      const errorMap = {
        missing_identifier: 'Please enter your username or email',
        missing_password: 'Please enter your password',
        user_not_found: 'Username or email was not found',
        password_incorrect: 'Password is incorrect',
      } as const

      const statusMap = {
        missing_identifier: 400,
        missing_password: 400,
        user_not_found: 404,
        password_incorrect: 401,
      } as const

      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: errorMap[result.error],
          timestamp: new Date().toISOString(),
        },
        { status: statusMap[result.error] }
      )
    }

    const sessionToken = await createAccountSession(result.user.id)
    const defaultRedirectTo = result.user.role === 'admin' ? '/account' : '/user'

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: {
        redirectTo: defaultRedirectTo,
        user: {
          id: result.user.id,
          username: result.user.username,
          email: result.user.email,
          displayName: result.user.displayName,
          role: result.user.role,
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
  } catch (error) {
    console.error('Error logging into account:', error)

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to log in',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
