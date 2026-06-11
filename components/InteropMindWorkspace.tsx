'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import AccountLogoutButton from './AccountLogoutButton'

type InteropMindUser = {
  username: string
  email: string
  displayName: string | null
  role: string
}

type ChatMessage = {
  id?: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}

type ChatThread = {
  id: string
  title: string
  messages: ChatMessage[]
  updatedAt: string
}

type InteropMindWorkspaceProps = {
  user: InteropMindUser
}

const starterPrompts = [
  'Plan a FHIR API implementation',
  'Explain ADT to FHIR mapping',
  'Create a lab result exchange checklist',
  'Prepare a support request',
]

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean)

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-100">
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }

    return <span key={`${part}-${index}`}>{part}</span>
  })
}

function renderTable(lines: string[]) {
  const rows = lines
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|') && line.endsWith('|'))
    .map((line) => line.slice(1, -1).split('|').map((cell) => cell.trim()))
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)))

  if (rows.length === 0) {
    return null
  }

  const [head, ...body] = rows

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {head.map((cell) => (
              <th key={cell} className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">
                {renderInlineMarkdown(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-950">
          {body.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top text-slate-600 dark:text-slate-300">
                  {renderInlineMarkdown(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean)

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean)
        const isTable = lines.length >= 2 && lines.every((line) => line.startsWith('|'))
        const unorderedItems = lines
          .map((line) => line.match(/^[-*]\s+(.+)$/)?.[1])
          .filter((item): item is string => Boolean(item))
        const orderedItems = lines
          .map((line) => line.match(/^\d+[.)]\s+(.+)$/)?.[1])
          .filter((item): item is string => Boolean(item))

        if (isTable) {
          return <div key={blockIndex}>{renderTable(lines)}</div>
        }

        if (unorderedItems.length === lines.length && unorderedItems.length > 0) {
          return (
            <ul key={blockIndex} className="ml-5 list-disc space-y-1">
              {unorderedItems.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ul>
          )
        }

        if (orderedItems.length === lines.length && orderedItems.length > 0) {
          return (
            <ol key={blockIndex} className="ml-5 list-decimal space-y-1">
              {orderedItems.map((item) => (
                <li key={item}>{renderInlineMarkdown(item)}</li>
              ))}
            </ol>
          )
        }

        if (/^#{1,3}\s+/.test(block)) {
          return (
            <h3 key={blockIndex} className="pt-1 text-base font-bold text-slate-950 dark:text-white">
              {renderInlineMarkdown(block.replace(/^#{1,3}\s+/, ''))}
            </h3>
          )
        }

        return (
          <p key={blockIndex}>
            {renderInlineMarkdown(block)}
          </p>
        )
      })}
    </div>
  )
}

function createThread(): ChatThread {
  return {
    id: `local-${crypto.randomUUID()}`,
    title: 'New chat',
    updatedAt: new Date().toISOString(),
    messages: [],
  }
}

function titleFromMessage(message: string) {
  const trimmed = message.trim()

  if (!trimmed) {
    return 'New chat'
  }

  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}...` : trimmed
}

function formatThreadTime(value: string) {
  return new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function Icon({ name }: { name: 'menu' | 'plus' | 'chat' | 'send' }) {
  const commonProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-5 w-5',
    'aria-hidden': true,
  }

  if (name === 'plus') {
    return (
      <svg {...commonProps}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    )
  }

  if (name === 'chat') {
    return (
      <svg {...commonProps}>
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    )
  }

  if (name === 'send') {
    return (
      <svg {...commonProps}>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </svg>
  )
}

export default function InteropMindWorkspace({ user }: InteropMindWorkspaceProps) {
  const [threads, setThreads] = useState<ChatThread[]>([])
  const [activeThreadId, setActiveThreadId] = useState('')
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isHistoryLoading, setIsHistoryLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [error, setError] = useState('')
  const displayName = user.displayName || user.username
  const userInitial = displayName.slice(0, 1).toUpperCase()
  const accountHref = user.role === 'admin' ? '/account' : '/user'
  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) || threads[0],
    [threads, activeThreadId]
  )
  const chatHistory = threads
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const hasUserMessages = Boolean(activeThread?.messages.some((message) => message.role === 'user'))

  useEffect(() => {
    let isMounted = true

    async function loadThreads() {
      try {
        const response = await fetch('/api/interopmind/threads')
        const payload = await response.json()

        if (!isMounted) {
          return
        }

        if (!response.ok || !payload.success) {
          setError(payload.error || 'Could not load chat history.')
          return
        }

        const loadedThreads = (payload.data?.threads || []) as ChatThread[]

        if (loadedThreads.length > 0) {
          setThreads(loadedThreads)
          setActiveThreadId(loadedThreads[0].id)
        } else {
          const response = await fetch('/api/interopmind/threads', { method: 'POST' })
          const payload = await response.json()

          if (!isMounted) {
            return
          }

          if (!response.ok || !payload.success) {
            const fallbackThread = createThread()
            setThreads([fallbackThread])
            setActiveThreadId(fallbackThread.id)
            return
          }

          const savedThread = payload.data?.thread as ChatThread
          setThreads([savedThread])
          setActiveThreadId(savedThread.id)
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError instanceof Error
              ? `Could not load chat history: ${requestError.message}`
              : 'Could not load chat history.'
          )
        }
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false)
        }
      }
    }

    loadThreads()

    return () => {
      isMounted = false
    }
  }, [])

  async function startNewChat() {
    const fallbackThread = createThread()
    setThreads((current) => [fallbackThread, ...current])
    setActiveThreadId(fallbackThread.id)
    setInput('')
    setError('')

    try {
      const response = await fetch('/api/interopmind/threads', { method: 'POST' })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        return
      }

      const savedThread = payload.data?.thread as ChatThread

      if (savedThread?.id) {
        setThreads((current) =>
          current.map((thread) => (thread.id === fallbackThread.id ? savedThread : thread))
        )
        setActiveThreadId(savedThread.id)
      }
    } catch {
      // Keep the local fallback thread so the user can continue; sending will create a saved thread.
    }
  }

  function updateActiveThread(updater: (thread: ChatThread) => ChatThread) {
    setThreads((current) =>
      current.map((thread) => (thread.id === activeThreadId ? updater(thread) : thread))
    )
  }

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isLoading || !activeThread) {
      return
    }

    const nextTitle =
      activeThread.title === 'New chat' ? titleFromMessage(trimmedMessage) : activeThread.title

    updateActiveThread((thread) => ({
      ...thread,
      title: nextTitle,
      updatedAt: new Date().toISOString(),
      messages: [
        ...thread.messages,
        {
          id: `pending-user-${Date.now()}`,
          role: 'user',
          content: trimmedMessage,
          createdAt: new Date().toISOString(),
        },
      ],
    }))
    setInput('')
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          messages: [...activeThread.messages, { role: 'user', content: trimmedMessage }],
          context: 'interopmind_workspace',
          threadId: activeThread.id.startsWith('local-') ? undefined : activeThread.id,
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

      setThreads((current) =>
        current.map((thread) => {
          if (thread.id !== activeThread.id) {
            return thread
          }

          const savedMessages = (payload.messages || []) as ChatMessage[]
          const messagesWithoutPending = thread.messages.filter(
            (message) => !message.id?.startsWith('pending-user-')
          )

          return {
            ...thread,
            id: payload.thread?.id || thread.id,
            title: payload.thread?.title || thread.title,
            updatedAt: payload.thread?.updatedAt || new Date().toISOString(),
            messages: [...messagesWithoutPending, ...savedMessages],
          }
        })
      )

      if (payload.thread?.id && payload.thread.id !== activeThread.id) {
        setActiveThreadId(payload.thread.id)
      }
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
    <main className="h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className={`grid h-full transition-[grid-template-columns] duration-300 ${isCollapsed ? 'lg:grid-cols-[72px_minmax(0,1fr)]' : 'lg:grid-cols-[280px_minmax(0,1fr)]'}`}>
        <aside className="hidden h-full flex-col bg-slate-50 dark:bg-slate-900 lg:flex">
          <div className={`flex h-16 items-center ${isCollapsed ? 'justify-center px-3' : 'justify-between px-4'}`}>
            {!isCollapsed && (
              <Link href="/" className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  IM
                </span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">InteropMind</span>
              </Link>
            )}
            <button
              type="button"
              onClick={() => setIsCollapsed((value) => !value)}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="grid h-10 w-10 place-items-center rounded-full text-slate-600 transition hover:bg-slate-200 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Icon name="menu" />
            </button>
          </div>

          <div className={isCollapsed ? 'px-3 py-2' : 'px-4 py-2'}>
            <button
              type="button"
              onClick={startNewChat}
              title={isCollapsed ? 'New chat' : undefined}
              className={`flex h-12 items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${
                isCollapsed ? 'w-12 justify-center' : 'w-full gap-3 px-4'
              }`}
            >
              <Icon name="plus" />
              {!isCollapsed && <span>New chat</span>}
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {!isCollapsed && (
              <p className="mb-2 px-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Recent
              </p>
            )}
            <div className="space-y-1">
              {isHistoryLoading && !isCollapsed && (
                <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">
                  Loading chats...
                </div>
              )}
              {chatHistory.map((thread) => {
                const active = thread.id === activeThread?.id

                return (
                  <button
                    key={thread.id}
                    type="button"
                    onClick={() => setActiveThreadId(thread.id)}
                    title={isCollapsed ? thread.title : undefined}
                    className={`flex h-11 w-full items-center rounded-full text-left text-sm transition ${
                      isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
                    } ${
                      active
                        ? 'bg-slate-200 text-slate-950 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="shrink-0 text-slate-500 dark:text-slate-400">
                      <Icon name="chat" />
                    </span>
                    {!isCollapsed && (
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{thread.title}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {formatThreadTime(thread.updatedAt)}
                        </span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className={`flex items-center gap-3 rounded-full px-2 py-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <Link
                href={accountHref}
                className={`min-w-0 items-center gap-3 rounded-full transition hover:bg-slate-200 dark:hover:bg-slate-800 ${isCollapsed ? 'hidden' : 'flex'}`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  {userInitial}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950 dark:text-white">{displayName}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</span>
                </span>
              </Link>
              {isCollapsed && (
                <Link href={accountHref} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  {userInitial}
                </Link>
              )}
              <AccountLogoutButton variant="sidebar" />
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col">
          <header className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6">
            <div>
              <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">InteropMind</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Healthcare interoperability AI</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/tools"
                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
              >
                Tools
              </Link>
              <Link
                href={accountHref}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
                title="Account workspace"
              >
                {userInitial}
              </Link>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col">
              {!hasUserMessages ? (
                <div className="flex flex-1 flex-col justify-center py-10">
                  <h2 className="text-4xl font-bold tracking-normal text-slate-900 dark:text-white md:text-5xl">
                    Hello, {displayName}
                  </h2>
                  <p className="mt-3 text-2xl font-semibold text-slate-400 md:text-3xl">
                    How can I help with interoperability today?
                  </p>
                  <div className="mt-10 grid gap-3 md:grid-cols-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => sendMessage(prompt)}
                        disabled={isLoading}
                        className="min-h-28 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-sm font-semibold leading-6 text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-8 py-8">
                  {activeThread?.messages.map((message, index) => {
                    if (index === 0 && message.role === 'assistant') {
                      return null
                    }

                    return (
                      <div key={message.id || `${message.role}-${index}`} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                        <div
                          className={
                            message.role === 'user'
                              ? 'max-w-2xl rounded-3xl bg-slate-100 px-5 py-3 text-sm leading-6 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                              : 'max-w-3xl px-1 py-1 text-sm leading-7 text-slate-700 dark:text-slate-200'
                          }
                        >
                          {message.role === 'assistant' ? (
                            <MessageContent content={message.content} />
                          ) : (
                            message.content
                          )}
                        </div>
                      </div>
                    )
                  })}
                  {isLoading && (
                    <div className="max-w-3xl px-1 py-1 text-sm text-slate-500 dark:text-slate-400">
                      InteropMind is thinking...
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 px-4 pb-4 md:px-6 md:pb-6">
            <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
              {error && (
                <p className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}
              <div className="flex min-h-16 items-center gap-3 rounded-3xl bg-slate-100 px-5 py-3 shadow-sm dark:bg-slate-900">
                <input
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask InteropMind"
                  disabled={isLoading}
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-500 disabled:opacity-70 dark:text-white dark:placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  aria-label="Send message"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200 dark:disabled:bg-slate-700"
                >
                  <Icon name="send" />
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                InteropMind can make mistakes. Review clinical, security, and compliance decisions.
              </p>
            </form>
          </div>
        </section>
      </div>
    </main>
  )
}
