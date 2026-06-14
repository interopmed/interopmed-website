import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

type FollowRouteProps = {
  params: Promise<{ id: string }>
}

async function getAccountUser(request: NextRequest) {
  return getAccountSessionUserFromToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
  )
}

export async function POST(request: NextRequest, { params }: FollowRouteProps) {
  const user = await getAccountUser(request)

  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Account login is required', timestamp: new Date().toISOString() }, { status: 401 })
  }

  const { id } = await params

  if (id === user.id) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'You cannot follow yourself', timestamp: new Date().toISOString() }, { status: 400 })
  }

  const target = await prisma.authUser.findFirst({
    where: { id, isActive: true },
    select: { id: true },
  })

  if (!target) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Member not found', timestamp: new Date().toISOString() }, { status: 404 })
  }

  await prisma.userFollow.upsert({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: target.id,
      },
    },
    create: {
      followerId: user.id,
      followingId: target.id,
    },
    update: {},
  })

  const followerCount = await prisma.userFollow.count({ where: { followingId: target.id } })

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { following: true, followerCount },
    timestamp: new Date().toISOString(),
  })
}

export async function DELETE(request: NextRequest, { params }: FollowRouteProps) {
  const user = await getAccountUser(request)

  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Account login is required', timestamp: new Date().toISOString() }, { status: 401 })
  }

  const { id } = await params

  await prisma.userFollow.deleteMany({
    where: {
      followerId: user.id,
      followingId: id,
    },
  })

  const followerCount = await prisma.userFollow.count({ where: { followingId: id } })

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { following: false, followerCount },
    timestamp: new Date().toISOString(),
  })
}
