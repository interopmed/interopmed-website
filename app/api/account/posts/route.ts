import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

const allowedTopics = new Set(['general', 'fhir', 'hl7', 'api', 'implementation', 'security'])
const POST_MAX_LENGTH = 1200

function normalizeTopic(value: unknown) {
  const topic = String(value || 'general').trim().toLowerCase()
  return allowedTopics.has(topic) ? topic : 'general'
}

export async function GET(request: NextRequest) {
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

    const posts = await prisma.userPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        content: true,
        topic: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            publicHandle: true,
            displayName: true,
            profileImage: true,
            role: true,
          },
        },
        comments: {
          where: { status: 'published' },
          orderBy: { createdAt: 'asc' },
          take: 8,
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
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { posts },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error listing account posts:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to load posts',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const content = String(body.content || '').trim()
    const topic = normalizeTopic(body.topic)

    if (content.length < 3) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Post content must be at least 3 characters',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (content.length > POST_MAX_LENGTH) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: `Post content must be ${POST_MAX_LENGTH} characters or fewer`,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const post = await prisma.userPost.create({
      data: {
        authorId: accountUser.id,
        content,
        topic,
        visibility: 'workspace',
      },
      select: {
        id: true,
        content: true,
        topic: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            publicHandle: true,
            displayName: true,
            profileImage: true,
            role: true,
          },
        },
        comments: {
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
        },
        _count: {
          select: { comments: true },
        },
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { post },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating account post:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create post',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
