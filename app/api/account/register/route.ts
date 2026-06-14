import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  ACCOUNT_SESSION_MAX_AGE_SECONDS,
  createAccountSession,
  createAuthUser,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const existingUserCount = await prisma.authUser.count()
    const role = existingUserCount === 0 ? 'admin' : 'member'

    const user = await createAuthUser({
      username: body.username,
      publicHandle: body.publicHandle,
      email: body.email,
      displayName: body.displayName,
      password: body.password,
      role,
    })

    const sessionToken = await createAccountSession(user.id)
    const response = NextResponse.json<ApiResponse>(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            publicHandle: user.publicHandle,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )

    response.cookies.set(ACCOUNT_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ACCOUNT_SESSION_MAX_AGE_SECONDS,
    })

    return response
  } catch (error) {
    console.error('Error registering account user:', error)
    const message = error instanceof Error ? error.message : 'Failed to register account'
    const status =
      message === 'A user with that username, public handle, or email already exists'
        ? 409
        : message === 'username, public handle, email, and a password of at least 8 characters are required' ||
            message === 'Public handle must be between 3 and 60 characters'
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
