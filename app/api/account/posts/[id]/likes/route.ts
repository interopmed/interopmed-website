import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

type LikeRouteProps = {
  params: Promise<{ id: string }>
}

async function getAccountUser(request: NextRequest) {
  return getAccountSessionUserFromToken(
    request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
  )
}

async function getPost(postId: string) {
  return prisma.userPost.findFirst({
    where: { id: postId, status: 'published' },
    select: { id: true },
  })
}

export async function POST(request: NextRequest, { params }: LikeRouteProps) {
  const user = await getAccountUser(request)

  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Account login is required', timestamp: new Date().toISOString() }, { status: 401 })
  }

  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Post not found', timestamp: new Date().toISOString() }, { status: 404 })
  }

  await prisma.userPostLike.upsert({
    where: {
      postId_userId: {
        postId: post.id,
        userId: user.id,
      },
    },
    create: {
      postId: post.id,
      userId: user.id,
    },
    update: {},
  })

  const likeCount = await prisma.userPostLike.count({ where: { postId: post.id } })

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { liked: true, likeCount },
    timestamp: new Date().toISOString(),
  })
}

export async function DELETE(request: NextRequest, { params }: LikeRouteProps) {
  const user = await getAccountUser(request)

  if (!user) {
    return NextResponse.json<ApiResponse>({ success: false, error: 'Account login is required', timestamp: new Date().toISOString() }, { status: 401 })
  }

  const { id } = await params

  await prisma.userPostLike.deleteMany({
    where: {
      postId: id,
      userId: user.id,
    },
  })

  const likeCount = await prisma.userPostLike.count({ where: { postId: id } })

  return NextResponse.json<ApiResponse>({
    success: true,
    data: { liked: false, likeCount },
    timestamp: new Date().toISOString(),
  })
}
