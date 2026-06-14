import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
  invalidateAccountSessionCache,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

export async function POST(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    const accountUser = await getAccountSessionUserFromToken(rawSessionToken)

    if (!accountUser) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Account login is required', timestamp: new Date().toISOString() }, { status: 401 })
    }

    const formData = await request.formData()
    const image = formData.get('image')

    if (!(image instanceof File) || image.type !== 'image/webp') {
      return NextResponse.json<ApiResponse>({ success: false, error: 'A WebP profile image is required', timestamp: new Date().toISOString() }, { status: 400 })
    }

    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Profile image must be 5MB or smaller', timestamp: new Date().toISOString() }, { status: 400 })
    }

    const imageUrl = `data:image/webp;base64,${Buffer.from(await image.arrayBuffer()).toString('base64')}`
    const user = await prisma.authUser.update({
      where: { id: accountUser.id },
      data: { profileImage: imageUrl },
      select: { profileImage: true },
    })
    invalidateAccountSessionCache(rawSessionToken)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { imageUrl: user.profileImage },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error uploading profile image:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to upload profile image', timestamp: new Date().toISOString() }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const rawSessionToken = request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    const accountUser = await getAccountSessionUserFromToken(rawSessionToken)

    if (!accountUser) {
      return NextResponse.json<ApiResponse>({ success: false, error: 'Account login is required', timestamp: new Date().toISOString() }, { status: 401 })
    }

    await prisma.authUser.update({
      where: { id: accountUser.id },
      data: { profileImage: null },
    })
    invalidateAccountSessionCache(rawSessionToken)

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { imageUrl: null },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error removing profile image:', error)
    return NextResponse.json<ApiResponse>({ success: false, error: 'Failed to remove profile image', timestamp: new Date().toISOString() }, { status: 500 })
  }
}
