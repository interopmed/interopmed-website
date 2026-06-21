'use client'

import { FormEvent, useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

const starterPrompts = [
  'Help me plan a FHIR API implementation workflow.',
  'Explain how HL7 v2 ADT messages map into FHIR resources.',
  'What should I include in an interoperability support request?',
  'Create a checklist for lab result exchange readiness.',
]

export default function InteropMindChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'I can help with FHIR, HL7, workflow planning, implementation checklists, and support triage. What are you working on?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isLoading) {
      return
    }

    const nextMessages = [...messages, { role: 'user' as const, content: trimmedMessage }]
    setMessages(nextMessages)
    setInput('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          context: 'user_interopmind_workspace',
        }),
      })
      const payload = await response.json().catch(() => ({
        success: false,
        reply: 'The InteropMind endpoint returned an unreadable response.',
      }))

      if (!response.ok || !payload.success) {
        setError(payload.reply || 'InteropMind could not process that request.')
        return
      }

      setMessages([...nextMessages, { role: 'assistant', content: payload.reply }])
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Could not reach InteropMind: ${requestError.message}`
          : 'Could not reach InteropMind.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await sendMessage(input)
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">InteropMind</p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Ask for implementation guidance</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            Use InteropMind for workflow planning, standards explanations, mapping direction, support triage, and launch readiness notes.
          </p>
        </div>
        <span className="w-fit rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-950/30 dark:text-teal-300">
          AI assisted
        </span>
      </div>

      <div className="mt-6 grid gap-2 md:grid-cols-2">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendMessage(prompt)}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-left text-sm font-semibold leading-6 text-slate-700 transition hover:border-teal-400 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-teal-500 dark:hover:bg-slate-900"
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="mt-6 max-h-[420px] space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`rounded-lg p-4 text-sm leading-6 ${
              message.role === 'user'
                ? 'ml-auto max-w-2xl bg-teal-600 text-white'
                : 'mr-auto max-w-2xl bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="mr-auto max-w-2xl rounded-lg bg-white p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            InteropMind is thinking...
          </div>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 md:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Message InteropMind</span>
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about a workflow, FHIR resource, HL7 message, or implementation risk..."
            disabled={isLoading}
            className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Send
        </button>
      </form>
    </section>
  )
}
