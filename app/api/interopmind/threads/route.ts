import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function serializeThread(thread: {
  id: string
  title: string
  status: string
  createdAt: Date
  updatedAt: Date
  messages: {
    id: string
    role: string
    content: string
    createdAt: Date
  }[]
}) {
  return {
    id: thread.id,
    title: thread.title,
    status: thread.status,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
    messages: thread.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  }
}

async function getAccountUser(request: NextRequest) {
  return getAccountSessionUserFromToken(request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value)
}

export async function GET(request: NextRequest) {
  try {
    const accountUser = await getAccountUser(request)

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

    const threads = await prisma.interopMindThread.findMany({
      where: {
        userId: accountUser.id,
        status: 'active',
      },
      orderBy: { updatedAt: 'desc' },
      take: 40,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 60,
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { threads: threads.map(serializeThread) },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error loading InteropMind threads:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to load InteropMind chat history',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const accountUser = await getAccountUser(request)

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

    const thread = await prisma.interopMindThread.create({
      data: {
        userId: accountUser.id,
      },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { thread: serializeThread(thread) },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating InteropMind thread:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create InteropMind chat',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
