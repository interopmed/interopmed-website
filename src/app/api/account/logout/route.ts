import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  deleteAccountSession,
} from '@/lib/account-auth'
import { ApiResponse } from '@/types'

export async function POST() {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ACCOUNT_SESSION_COOKIE)?.value

  await deleteAccountSession(rawToken)

  const response = NextResponse.json<ApiResponse>({
    success: true,
    timestamp: new Date().toISOString(),
  })

  response.cookies.set(ACCOUNT_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })

  return response
}
