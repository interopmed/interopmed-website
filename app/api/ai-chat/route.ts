import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNT_SESSION_COOKIE, getAccountSessionUserFromToken } from '@/lib/account-auth'
import { runInteropMindAgent } from '@/lib/interopmind/agent-graph'
import type { InteropMindChatMessage } from '@/lib/interopmind/types'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type ChatRequest = {
  message?: string
  messages?: InteropMindChatMessage[]
  context?: string
  threadId?: string
  editMessageId?: string
}

type ChatResponse = {
  reply: string
  success: boolean
  thread?: {
    id: string
    title: string
    updatedAt: string
  }
  messages?: {
    id: string
    role: string
    content: string
    createdAt: string
  }[]
  agent?: {
    intent: string
    riskLevel: string
    toolsUsed: string[]
    provider: string
    requiresHumanReview: boolean
  }
}

function normalizeMessages(value: unknown, fallbackMessage: string): InteropMindChatMessage[] {
  const messages = Array.isArray(value)
    ? value
        .map((message) => {
          const item = message as { role?: unknown; content?: unknown }
          const role: InteropMindChatMessage['role'] = item.role === 'assistant' ? 'assistant' : 'user'

          return {
            role,
            content: String(item.content || '').trim(),
          }
        })
        .filter((message) => message.content)
    : []

  if (messages.length > 0) {
    return messages.slice(-12)
  }

  return [{ role: 'user', content: fallbackMessage }]
}

function titleFromMessage(message: string) {
  return message.length > 42 ? `${message.slice(0, 42)}...` : message || 'New chat'
}

async function getOrCreateThread(userId: string, threadId: string | undefined, firstMessage: string) {
  if (threadId) {
    const existingThread = await prisma.interopMindThread.findFirst({
      where: {
        id: threadId,
        userId,
        status: 'active',
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    })

    if (existingThread) {
      return existingThread
    }
  }

  return prisma.interopMindThread.create({
    data: {
      userId,
      title: titleFromMessage(firstMessage),
    },
    select: {
      id: true,
      title: true,
      updatedAt: true,
    },
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const accountUser = await getAccountSessionUserFromToken(
      request.cookies.get(ACCOUNT_SESSION_COOKIE)?.value
    )

    const body: ChatRequest = await request.json()
    const message = String(body.message || '').trim()

    if (!message && !Array.isArray(body.messages)) {
      return NextResponse.json(
        { reply: 'Please provide a valid message.', success: false },
        { status: 400 }
      )
    }

    const messages = normalizeMessages(body.messages, message)

    if (!accountUser) {
      const agentResult = await runInteropMindAgent({
        messages,
        context: body.context,
      })

      return NextResponse.json({
        reply: agentResult.reply,
        success: true,
        agent: {
          intent: agentResult.intent,
          riskLevel: agentResult.riskLevel,
          toolsUsed: agentResult.toolsUsed,
          provider: agentResult.provider,
          requiresHumanReview: agentResult.requiresHumanReview,
        },
        messages: [
          {
            id: `guest-user-${crypto.randomUUID()}`,
            role: 'user',
            content: message || messages[messages.length - 1]?.content || '',
            createdAt: new Date().toISOString(),
          },
          {
            id: `guest-assistant-${crypto.randomUUID()}`,
            role: 'assistant',
            content: agentResult.reply,
            createdAt: new Date().toISOString(),
          },
        ],
      })
    }

    const thread = await getOrCreateThread(accountUser.id, body.threadId, message || messages[messages.length - 1]?.content || 'New chat')

    if (body.editMessageId) {
      const editedMessage = await prisma.interopMindMessage.findFirst({
        where: {
          id: body.editMessageId,
          threadId: thread.id,
          role: 'user',
        },
        select: {
          createdAt: true,
          threadId: true,
        },
      })

      if (!editedMessage) {
        return NextResponse.json(
          { reply: 'The message to edit was not found.', success: false },
          { status: 404 }
        )
      }

      await prisma.interopMindMessage.deleteMany({
        where: {
          threadId: editedMessage.threadId,
          createdAt: {
            gte: editedMessage.createdAt,
          },
        },
      })
    }

    const userMessage = await prisma.interopMindMessage.create({
      data: {
        threadId: thread.id,
        role: 'user',
        content: message || messages[messages.length - 1]?.content || '',
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    })
    const agentResult = await runInteropMindAgent({
      messages,
      context: body.context,
      userId: accountUser.id,
    })
    const assistantMessage = await prisma.interopMindMessage.create({
      data: {
        threadId: thread.id,
        role: 'assistant',
        content: agentResult.reply,
      },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    })
    const updatedThread = await prisma.interopMindThread.update({
      where: { id: thread.id },
      data: {
        title: thread.title === 'New chat' ? titleFromMessage(userMessage.content) : thread.title,
      },
      select: {
        id: true,
        title: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({
      reply: agentResult.reply,
      success: true,
      agent: {
        intent: agentResult.intent,
        riskLevel: agentResult.riskLevel,
        toolsUsed: agentResult.toolsUsed,
        provider: agentResult.provider,
        requiresHumanReview: agentResult.requiresHumanReview,
      },
      thread: {
        id: updatedThread.id,
        title: updatedThread.title,
        updatedAt: updatedThread.updatedAt.toISOString(),
      },
      messages: [userMessage, assistantMessage].map((savedMessage) => ({
        id: savedMessage.id,
        role: savedMessage.role,
        content: savedMessage.content,
        createdAt: savedMessage.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('InteropMind chat API error:', error)

    return NextResponse.json(
      {
        reply: error instanceof Error ? error.message : 'Sorry, I encountered an error processing your message.',
        success: false,
      },
      { status: 500 }
    )
  }
}
