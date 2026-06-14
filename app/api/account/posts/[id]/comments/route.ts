import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

const COMMENT_MAX_LENGTH = 600

type CommentRouteProps = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: NextRequest, { params }: CommentRouteProps) {
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

    const { id } = await params
    const body = await request.json()
    const content = String(body.content || '').trim()

    if (content.length < 2) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Comment must be at least 2 characters',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (content.length > COMMENT_MAX_LENGTH) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Comment must be ${COMMENT_MAX_LENGTH} characters or fewer`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const post = await prisma.userPost.findFirst({
      where: {
        id,
        status: 'published',
      },
      select: { id: true },
    })

    if (!post) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post not found',
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      )
    }

    const comment = await prisma.userPostComment.create({
      data: {
        postId: post.id,
        authorId: accountUser.id,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            publicHandle: true,
            displayName: true,
            profileImage: true,
            role: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { comment },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating post comment:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create comment',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
