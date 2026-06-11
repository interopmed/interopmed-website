import { NextRequest, NextResponse } from 'next/server'

type ChatRequest = {
  message: string
  context?: string
}

type ChatResponse = {
  reply: string
  success: boolean
}

// Simple AI chat responses - replace with your actual AI service (Claude, ChatGPT, etc.)
const responseTemplates: Record<string, string[]> = {
  fhir: [
    'FHIR (Fast Healthcare Interoperability Resources) is a standard for exchanging healthcare data. Would you like to know more about specific FHIR resources or implementation guides?',
    'I can help with FHIR resource profiling, validation, and implementation. What specific aspect interests you?',
  ],
  hl7: [
    'HL7 v2 is a widely-used standard for healthcare data exchange. Are you looking for help with message mapping or ADT/ORU message structure?',
    'I can assist with HL7 message structure, integration patterns, and interoperability. What would be helpful?',
  ],
  implementation: [
    'Implementation of healthcare standards requires careful planning. What aspects of your implementation would you like to discuss?',
    'I can guide you through implementation considerations, best practices, and common challenges. What\'s your focus area?',
  ],
  default: [
    'I\'m here to help with interoperability questions, implementation guidance, and standards-related topics. What can I assist with?',
    'Feel free to ask me about FHIR, HL7, healthcare data exchange, or compliance topics. How can I help?',
  ],
}

function getRelevantResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  for (const [keyword, responses] of Object.entries(responseTemplates)) {
    if (keyword === 'default') continue
    if (lowerMessage.includes(keyword)) {
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }

  return responseTemplates.default[Math.floor(Math.random() * responseTemplates.default.length)]
}

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const body: ChatRequest = await request.json()
    const { message, context } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { reply: 'Please provide a valid message.', success: false },
        { status: 400 }
      )
    }

    // TODO: Replace with your actual AI service
    // Example: Call Claude API, GPT API, or your custom ML model
    // const reply = await callYourAIService(message, context)

    // For now, return a contextual response
    const reply = getRelevantResponse(message)

    return NextResponse.json({
      reply,
      success: true,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { reply: 'Sorry, I encountered an error processing your message.', success: false },
      { status: 500 }
    )
  }
}
