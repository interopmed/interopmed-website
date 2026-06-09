import { NextRequest, NextResponse } from 'next/server'
import {
  ACCOUNT_SESSION_COOKIE,
  getAccountSessionUserFromToken,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'
import { ApiResponse } from '@/types'

export const dynamic = 'force-dynamic'

const allowedTopics = new Set([
  'Account help',
  'Studio access',
  'FHIR or HL7 workflow',
  'Billing or subscription',
  'Bug report',
  'Other',
])
const allowedUrgencies = new Set(['normal', 'high', 'urgent'])

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  )
}

function getNameParts(displayName: string | null, username: string) {
  const name = String(displayName || username || '').trim()
  const parts = name.split(/\s+/).filter(Boolean)

  return {
    firstName: parts[0] || username,
    lastName: parts.length > 1 ? parts.slice(1).join(' ') : 'Account',
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
    const topic = String(body.topic || '').trim()
    const message = String(body.message || '').trim()
    const urgency = String(body.urgency || 'normal').trim()

    if (!topic || !message) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'topic and message are required',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (message.length < 20) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Please describe the request in at least 20 characters',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (!allowedTopics.has(topic)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Please choose a valid support topic',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    if (!allowedUrgencies.has(urgency)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: 'Please choose a valid urgency',
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      )
    }

    const { firstName, lastName } = getNameParts(accountUser.displayName, accountUser.username)
    const supportMessage = await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email: accountUser.email,
        organization: 'InteropMed account',
        topic: `${topic} (${urgency})`,
        message,
        source: 'user_support_page',
        ipAddress: getClientIp(request),
        userAgent: request.headers.get('user-agent'),
      },
      select: {
        id: true,
        topic: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json<ApiResponse>(
      {
        success: true,
        data: { supportMessage },
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating account support request:', error)
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: 'Failed to create support request',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
