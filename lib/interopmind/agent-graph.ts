import { Annotation, END, START, StateGraph } from '@langchain/langgraph'
import { callInteropMindModel } from './providers'
import { buildAgentPrompt } from './prompts'
import type {
  InteropMindAgentInput,
  InteropMindAgentResult,
  InteropMindChatMessage,
  InteropMindIntent,
  InteropMindRiskLevel,
} from './types'

const AgentState = Annotation.Root({
  messages: Annotation<InteropMindChatMessage[]>,
  context: Annotation<string | undefined>,
  userId: Annotation<string | undefined>,
  intent: Annotation<InteropMindIntent | undefined>,
  riskLevel: Annotation<InteropMindRiskLevel | undefined>,
  toolsUsed: Annotation<string[]>({
    reducer: (current, update) => [...current, ...update],
    default: () => [],
  }),
  reply: Annotation<string | undefined>,
  provider: Annotation<InteropMindAgentResult['provider'] | undefined>,
  requiresHumanReview: Annotation<boolean | undefined>,
})

type AgentStateType = typeof AgentState.State

function latestUserMessage(messages: InteropMindChatMessage[]) {
  return [...messages].reverse().find((message) => message.role === 'user')?.content.toLowerCase() || ''
}

function classifyIntent(message: string): InteropMindIntent {
  if (/\b(map|mapping|transform|fhir|hl7|oru|orm|adt|siu|dicom|csv|segment|resource)\b/.test(message)) {
    return 'mapping'
  }

  if (/\b(error|issue|bug|failed|failure|support|ticket|triage|not working|incident)\b/.test(message)) {
    return 'support_triage'
  }

  if (/\b(plan|roadmap|implement|implementation|integrate|build|architecture|module|workflow)\b/.test(message)) {
    return 'implementation_planning'
  }

  if (/\b(document|documentation|docs|readme|explain|summary|write)\b/.test(message)) {
    return 'documentation'
  }

  if (/\b(stream|post|article|content|social|publish)\b/.test(message)) {
    return 'stream_content'
  }

  return 'general_guidance'
}

function assessRisk(message: string): InteropMindRiskLevel {
  if (/\b(real patient|patient name|diagnose|diagnosis|treatment|prescribe|medication dose|phi|clinical decision)\b/.test(message)) {
    return 'restricted'
  }

  if (/\b(production|go live|security|compliance|legal|consent|permission|billing|claim|delete|write back|device alert)\b/.test(message)) {
    return 'high'
  }

  if (/\b(mapping|integration|workflow|support|configuration|audit|privacy|hl7|fhir)\b/.test(message)) {
    return 'medium'
  }

  return 'low'
}

function toolsForIntent(intent: InteropMindIntent, riskLevel: InteropMindRiskLevel) {
  const tools = ['intent-classifier', 'risk-gate']

  if (intent === 'mapping') {
    tools.push('mapping-planner')
  }

  if (intent === 'support_triage') {
    tools.push('support-triage-planner')
  }

  if (intent === 'implementation_planning') {
    tools.push('implementation-checklist-planner')
  }

  if (intent === 'documentation') {
    tools.push('documentation-planner')
  }

  if (intent === 'stream_content') {
    tools.push('stream-draft-planner')
  }

  if (riskLevel === 'high' || riskLevel === 'restricted') {
    tools.push('human-review-gate')
  }

  return tools
}

async function classifyNode(state: AgentStateType) {
  const message = latestUserMessage(state.messages)
  const intent = classifyIntent(message)
  const riskLevel = assessRisk(message)

  return {
    intent,
    riskLevel,
    requiresHumanReview: riskLevel === 'high' || riskLevel === 'restricted',
    toolsUsed: toolsForIntent(intent, riskLevel),
  }
}

async function modelNode(state: AgentStateType) {
  const intent = state.intent || 'general_guidance'
  const riskLevel = state.riskLevel || 'low'
  const toolsUsed = state.toolsUsed || []
  const systemPrompt = buildAgentPrompt({
    context: state.context,
    intent,
    riskLevel,
    toolsUsed,
  })
  const result = await callInteropMindModel(state.messages, systemPrompt)

  return {
    reply: result.reply,
    provider: result.provider,
  }
}

const interopMindAgentGraph = new StateGraph(AgentState)
  .addNode('classify', classifyNode)
  .addNode('respond', modelNode)
  .addEdge(START, 'classify')
  .addEdge('classify', 'respond')
  .addEdge('respond', END)
  .compile()

export async function runInteropMindAgent(
  input: InteropMindAgentInput
): Promise<InteropMindAgentResult> {
  const result = await interopMindAgentGraph.invoke({
    messages: input.messages,
    context: input.context,
    userId: input.userId,
  })

  return {
    reply: result.reply || '',
    intent: result.intent || 'general_guidance',
    riskLevel: result.riskLevel || 'low',
    toolsUsed: result.toolsUsed || [],
    provider: result.provider || 'groq',
    requiresHumanReview: Boolean(result.requiresHumanReview),
  }
}
