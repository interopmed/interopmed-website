import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  createAuthUser,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { ApiResponse } from '@/types'

export async function POST(request: NextRequest) {
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

    if (accountUser.role !== 'admin') {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Admin access is required',
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const role = body.role === 'admin' ? 'admin' : 'member'
    const user = await createAuthUser({
      username: body.username,
      publicHandle: body.publicHandle,
      email: body.email,
      displayName: body.displayName,
      password: body.password,
      role,
    })

    return NextResponse.json<ApiResponse>(
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
  } catch (error) {
    console.error('Error creating account user:', error)
    const message = error instanceof Error ? error.message : 'Failed to create account user'
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
