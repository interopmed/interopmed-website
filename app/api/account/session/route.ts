import { NextResponse } from 'next/server'
import { getAccountSessionUser } from '@/lib/account-auth'
import { ApiResponse } from '@/types'

export async function GET() {
  const user = await getAccountSessionUser()

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { user },
    timestamp: new Date().toISOString(),
  })
}
