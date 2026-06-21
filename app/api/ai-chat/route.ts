import { NextRequest, NextResponse } from 'next/server'
import { ACCOUNT_SESSION_COOKIE, getAccountSessionUserFromToken } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type ChatRequest = {
  message?: string
  messages?: ChatMessage[]
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
}

type GroqResponse = {
  choices?: {
    message?: {
      content?: string | null
    }
  }[]
  error?: {
    message?: string
  }
}

const systemPrompt = `
You are InteropMind, InteropMed's healthcare interoperability AI assistant.

Help signed-in users with practical healthcare interoperability work:
- FHIR R4 resources, profiles, search, validation, implementation guides, and API rollout.
- HL7 v2 ADT, ORM, ORU, SIU messages, segment interpretation, and v2-to-FHIR mapping.
- Workflow planning for referrals, lab results, ADT routing, consent-aware access, and care coordination.
- Implementation checklists, support request preparation, security, audit, privacy, and governance notes.

Rules:
- Be clear, practical, and concise.
- Use short paragraphs, bullet lists, or numbered steps when that makes the answer easier to scan.
- When explaining workflows, system architecture, message movement, or decision paths, include a compact diagram using a fenced block labeled flow or graph.
- For diagrams, use one relationship per line, like: EHR -> Interface engine -> FHIR API -> Consumer app.
- Ask for missing standard versions, message types, workflows, or payload details when needed.
- Use synthetic examples only. Do not request or expose real PHI.
- For production, clinical, legal, security, or compliance decisions, recommend human review.
- If mapping legacy formats to FHIR, prefer compact tables with source, transformation logic, and target FHIR element.
`

function getGroqApiKey() {
  return process.env.GROQ_API_KEY || ''
}

function getGroqTextModel() {
  return process.env.GROQ_TEXT_MODEL || 'llama-3.3-70b-versatile'
}

function normalizeMessages(value: unknown, fallbackMessage: string): ChatMessage[] {
  const messages = Array.isArray(value)
    ? value
        .map((message) => {
          const item = message as { role?: unknown; content?: unknown }
          const role: ChatMessage['role'] = item.role === 'assistant' ? 'assistant' : 'user'

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

async function callGroq(messages: ChatMessage[], context: string | undefined) {
  const apiKey = getGroqApiKey()

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const contextPrompt = context
    ? `${systemPrompt}\n\nCurrent workspace context: ${context}`
    : systemPrompt

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getGroqTextModel(),
      messages: [
        {
          role: 'system',
          content: contextPrompt,
        },
        ...messages,
      ],
      temperature: 0.35,
      max_tokens: 900,
    }),
  })
  const result = (await response.json()) as GroqResponse

  if (!response.ok) {
    throw new Error(result.error?.message || 'Groq request failed')
  }

  const reply = result.choices?.[0]?.message?.content?.trim()

  if (!reply) {
    throw new Error('Groq returned an empty response')
  }

  return reply
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
      const reply = await callGroq(messages, body.context)

      return NextResponse.json({
        reply,
        success: true,
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
            content: reply,
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
    const reply = await callGroq(messages, body.context)
    const assistantMessage = await prisma.interopMindMessage.create({
      data: {
        threadId: thread.id,
        role: 'assistant',
        content: reply,
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
      reply,
      success: true,
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
