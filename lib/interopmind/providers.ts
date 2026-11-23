import type { InteropMindChatMessage, InteropMindProvider } from './types'

const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GEMINI_GENERATE_CONTENT_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

type ProviderResponse = {
  reply: string
  provider: InteropMindProvider
}

type OpenAiCompatibleResponse = {
  choices?: {
    message?: {
      content?: string | null
    }
  }[]
  error?: {
    message?: string
  }
}

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string
      }[]
    }
  }[]
  error?: {
    message?: string
  }
}

function getConfiguredProvider(): InteropMindProvider {
  const configuredProvider = (
    process.env.INTEROPMIND_AI_PROVIDER ||
    process.env.AI_PROVIDER ||
    ''
  ).toLowerCase()

  if (configuredProvider === 'gemini') {
    return 'gemini'
  }

  if (configuredProvider === 'groq') {
    return 'groq'
  }

  return process.env.GEMINI_API_KEY && !process.env.GROQ_API_KEY ? 'gemini' : 'groq'
}

function getGroqModel() {
  const configuredModel = (process.env.GROQ_TEXT_MODEL || process.env.GROQ_MODEL || '').trim()

  if (
    !configuredModel ||
    configuredModel.toLowerCase() === 'llama 70b versatile' ||
    configuredModel.toLowerCase() === 'llama-70b-versatile'
  ) {
    return 'llama-3.3-70b-versatile'
  }

  return configuredModel
}

function getGeminiModel() {
  return process.env.GEMINI_TEXT_MODEL || process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

async function callGroq(messages: InteropMindChatMessage[], systemPrompt: string): Promise<ProviderResponse> {
  const apiKey = process.env.GROQ_API_KEY || ''

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: getGroqModel(),
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.35,
      max_tokens: 900,
    }),
  })
  const result = (await response.json()) as OpenAiCompatibleResponse

  if (!response.ok) {
    throw new Error(result.error?.message || 'Groq request failed')
  }

  const reply = result.choices?.[0]?.message?.content?.trim()

  if (!reply) {
    throw new Error('Groq returned an empty response')
  }

  return { reply, provider: 'groq' }
}

function toGeminiContents(messages: InteropMindChatMessage[]) {
  return messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }))
}

async function callGemini(messages: InteropMindChatMessage[], systemPrompt: string): Promise<ProviderResponse> {
  const apiKey = process.env.GEMINI_API_KEY || ''

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const response = await fetch(
    `${GEMINI_GENERATE_CONTENT_BASE_URL}/${getGeminiModel()}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 900,
        },
      }),
    }
  )
  const result = (await response.json()) as GeminiResponse

  if (!response.ok) {
    throw new Error(result.error?.message || 'Gemini request failed')
  }

  const reply = result.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim()

  if (!reply) {
    throw new Error('Gemini returned an empty response')
  }

  return { reply, provider: 'gemini' }
}

export async function callInteropMindModel(
  messages: InteropMindChatMessage[],
  systemPrompt: string
): Promise<ProviderResponse> {
  const provider = getConfiguredProvider()

  if (provider === 'gemini') {
    return callGemini(messages, systemPrompt)
  }

  return callGroq(messages, systemPrompt)
}
