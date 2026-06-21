export type InteropMindChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type InteropMindIntent =
  | 'mapping'
  | 'support_triage'
  | 'implementation_planning'
  | 'documentation'
  | 'stream_content'
  | 'general_guidance'

export type InteropMindRiskLevel = 'low' | 'medium' | 'high' | 'restricted'

export type InteropMindProvider = 'groq' | 'gemini'

export type InteropMindAgentInput = {
  messages: InteropMindChatMessage[]
  context?: string
  userId?: string
}

export type InteropMindAgentResult = {
  reply: string
  intent: InteropMindIntent
  riskLevel: InteropMindRiskLevel
  toolsUsed: string[]
  provider: InteropMindProvider
  requiresHumanReview: boolean
}
