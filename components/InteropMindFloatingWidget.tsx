'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FormEvent, useState } from 'react'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

function ChatIcon() {
  return (
    <svg
      className="h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg
      className="h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

export default function InteropMindFloatingWidget() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Ask a quick interoperability question. I can help with FHIR, HL7, labs, devices, IoT, and workflow planning.',
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
          messages: nextMessages,
          context: 'site_wide_interopmind_quick_widget',
        }),
      })
      const payload = await response.json().catch(() => ({
        success: false,
        reply: 'InteropMind returned an unreadable response.',
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

  if (pathname === '/interopmind' || pathname.startsWith('/interopmind/')) {
    return null
  }

  return (
    <div className="fixed bottom-5 right-5 z-[70] flex flex-col items-end gap-3">
      {isOpen && (
        <section className="w-[calc(100vw-2.5rem)] max-w-sm overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 dark:border-slate-800 dark:bg-slate-950">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-600 dark:text-teal-400">
                InteropMind
              </p>
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">Quick assistant</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close InteropMind"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <span aria-hidden="true">x</span>
            </button>
          </header>

          <div className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-900">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-lg px-4 py-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ml-auto max-w-[85%] bg-teal-600 text-white'
                    : 'mr-auto max-w-[90%] bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-200'
                }`}
              >
                {message.content}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto max-w-[90%] rounded-lg bg-white px-4 py-3 text-sm text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            {error && (
              <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="flex items-center gap-2">
              <label className="min-w-0 flex-1">
                <span className="sr-only">Ask InteropMind</span>
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask InteropMind..."
                  disabled={isLoading}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
              >
                <SendIcon />
              </button>
            </form>
            <Link
              href="/interopmind"
              className="mt-3 block rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-bold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300"
            >
              Open full InteropMind
            </Link>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close InteropMind quick assistant' : 'Open InteropMind quick assistant'}
        className="group flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-xl shadow-teal-700/25 transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-500/30"
      >
        <ChatIcon />
        <span className="pointer-events-none absolute bottom-16 right-0 hidden whitespace-nowrap rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block dark:bg-white dark:text-slate-950">
          Ask InteropMind
        </span>
      </button>
    </div>
  )
}
