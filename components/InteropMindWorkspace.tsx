'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
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
  user: InteropMindUser | null
}

type ThreadModalMode = 'rename' | 'delete' | ''

type MarkdownBlock =
  | {
      type: 'code'
      language: string
      content: string
    }
  | {
      type: 'text'
      content: string
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

function splitMarkdownBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = []
  const codeBlockPattern = /```(\w+)?\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockPattern.exec(content)) !== null) {
    const leadingText = content.slice(lastIndex, match.index).trim()

    if (leadingText) {
      blocks.push({ type: 'text', content: leadingText })
    }

    blocks.push({
      type: 'code',
      language: (match[1] || '').toLowerCase(),
      content: match[2].trim(),
    })
    lastIndex = match.index + match[0].length
  }

  const trailingText = content.slice(lastIndex).trim()

  if (trailingText) {
    blocks.push({ type: 'text', content: trailingText })
  }

  return blocks
}

function parseDiagramLines(content: string) {
  return content
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s*->\s*/).map((step) => step.trim()).filter(Boolean))
    .filter((steps) => steps.length >= 2)
}

function DiagramBlock({ content, type }: { content: string; type: 'flow' | 'graph' }) {
  const paths = parseDiagramLines(content)

  if (paths.length === 0) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
        <code>{content}</code>
      </pre>
    )
  }

  return (
    <div className="my-4 overflow-x-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-slate-500 dark:text-slate-400">
        <span className="h-px w-8 bg-teal-500" />
        {type === 'graph' ? 'Relationship graph' : 'Workflow flow'}
      </div>
      <div className="space-y-3">
        {paths.map((steps, pathIndex) => (
          <div key={`${steps.join('-')}-${pathIndex}`} className="flex min-w-max items-center">
            {steps.map((step, stepIndex) => (
              <div key={`${step}-${stepIndex}`} className="flex items-center">
                <span className="max-w-48 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-xs font-semibold leading-5 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {step}
                </span>
                {stepIndex < steps.length - 1 && (
                  <span className="relative mx-2 h-px w-12 bg-teal-500">
                    <span className="absolute -right-1 -top-1 h-2 w-2 rotate-45 border-r-2 border-t-2 border-teal-500" />
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
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
  const blocks = splitMarkdownBlocks(content)

  return (
    <div className="space-y-3">
      {blocks.map((block, blockIndex) => {
        if (block.type === 'code') {
          if (block.language === 'flow' || block.language === 'graph') {
            return (
              <DiagramBlock
                key={`${block.language}-${blockIndex}`}
                content={block.content}
                type={block.language}
              />
            )
          }

          return (
            <pre key={`${block.language}-${blockIndex}`} className="overflow-x-auto rounded-lg bg-slate-950 p-4 text-xs leading-6 text-slate-100">
              <code>{block.content}</code>
            </pre>
          )
        }

        return block.content.split(/\n{2,}/).map((textBlock, textBlockIndex) => {
          const normalizedBlock = textBlock.trim()
          const lines = normalizedBlock.split('\n').map((line) => line.trim()).filter(Boolean)
          const isTable = lines.length >= 2 && lines.every((line) => line.startsWith('|'))
          const unorderedItems = lines
            .map((line) => line.match(/^[-*]\s+(.+)$/)?.[1])
            .filter((item): item is string => Boolean(item))
          const orderedItems = lines
            .map((line) => line.match(/^\d+[.)]\s+(.+)$/)?.[1])
            .filter((item): item is string => Boolean(item))
          const blockKey = `${blockIndex}-${textBlockIndex}`

          if (isTable) {
            return <div key={blockKey}>{renderTable(lines)}</div>
          }

          if (unorderedItems.length === lines.length && unorderedItems.length > 0) {
            return (
              <ul key={blockKey} className="ml-5 list-disc space-y-1">
                {unorderedItems.map((item) => (
                  <li key={item}>{renderInlineMarkdown(item)}</li>
                ))}
              </ul>
            )
          }

          if (orderedItems.length === lines.length && orderedItems.length > 0) {
            return (
              <ol key={blockKey} className="ml-5 list-decimal space-y-1">
                {orderedItems.map((item) => (
                  <li key={item}>{renderInlineMarkdown(item)}</li>
                ))}
              </ol>
            )
          }

          if (/^#{1,3}\s+/.test(normalizedBlock)) {
            return (
              <h3 key={blockKey} className="pt-1 text-base font-bold text-slate-950 dark:text-white">
                {renderInlineMarkdown(normalizedBlock.replace(/^#{1,3}\s+/, ''))}
              </h3>
            )
          }

          return (
            <p key={blockKey}>
              {renderInlineMarkdown(normalizedBlock)}
            </p>
          )
        })
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

function Icon({ name }: { name: 'menu' | 'plus' | 'chat' | 'send' | 'dots' | 'edit' | 'trash' | 'copy' }) {
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

  if (name === 'dots') {
    return (
      <svg {...commonProps}>
        <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        <path d="M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
        <path d="M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
    )
  }

  if (name === 'edit') {
    return (
      <svg {...commonProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    )
  }

  if (name === 'trash') {
    return (
      <svg {...commonProps}>
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="m19 6-1 14H6L5 6" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
      </svg>
    )
  }

  if (name === 'copy') {
    return (
      <svg {...commonProps}>
        <rect width="14" height="14" x="8" y="8" rx="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
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
  const [openThreadOptionsId, setOpenThreadOptionsId] = useState('')
  const [mutatingThreadId, setMutatingThreadId] = useState('')
  const [threadModalMode, setThreadModalMode] = useState<ThreadModalMode>('')
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null)
  const [renameTitle, setRenameTitle] = useState('')
  const [copiedMessageId, setCopiedMessageId] = useState('')
  const [editingMessageId, setEditingMessageId] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const isSignedIn = Boolean(user)
  const displayName = user?.displayName || user?.username || 'there'
  const userInitial = displayName.slice(0, 1).toUpperCase()
  const accountHref = user?.role === 'admin' ? '/account' : '/user'
  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) || threads[0],
    [threads, activeThreadId]
  )
  const chatHistory = threads
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  const hasUserMessages = Boolean(activeThread?.messages.some((message) => message.role === 'user'))
  const lastUserMessageIndex = activeThread?.messages.reduce(
    (lastIndex, message, index) => (message.role === 'user' ? index : lastIndex),
    -1
  ) ?? -1

  useEffect(() => {
    let isMounted = true

    async function loadThreads() {
      if (!isSignedIn) {
        const guestThread = createThread()
        setThreads([guestThread])
        setActiveThreadId(guestThread.id)
        setIsHistoryLoading(false)
        return
      }

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
  }, [isSignedIn])

  async function startNewChat() {
    const fallbackThread = createThread()
    setThreads((current) => [fallbackThread, ...current])
    setActiveThreadId(fallbackThread.id)
    setOpenThreadOptionsId('')
    setEditingMessageId('')
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

  function openThread(threadId: string) {
    setActiveThreadId(threadId)
    setOpenThreadOptionsId('')
    setEditingMessageId('')
    setInput('')
  }

  function closeThreadModal() {
    setThreadModalMode('')
    setSelectedThread(null)
    setRenameTitle('')
  }

  function renameThread(thread: ChatThread) {
    setSelectedThread(thread)
    setRenameTitle(thread.title)
    setThreadModalMode('rename')
    setOpenThreadOptionsId('')
  }

  function deleteThread(thread: ChatThread) {
    setSelectedThread(thread)
    setThreadModalMode('delete')
    setOpenThreadOptionsId('')
  }

  async function submitRenameThread() {
    if (!selectedThread) {
      return
    }

    const thread = selectedThread
    const nextTitle = renameTitle.trim()

    if (!nextTitle || nextTitle === thread.title) {
      closeThreadModal()
      return
    }

    if (thread.id.startsWith('local-')) {
      setThreads((current) =>
        current.map((currentThread) =>
          currentThread.id === thread.id
            ? { ...currentThread, title: titleFromMessage(nextTitle), updatedAt: new Date().toISOString() }
            : currentThread
        )
      )
      closeThreadModal()
      return
    }

    setMutatingThreadId(thread.id)
    setError('')

    try {
      const response = await fetch('/api/interopmind/threads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId: thread.id,
          title: nextTitle,
        }),
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setError(payload.error || 'Could not rename chat.')
        return
      }

      const savedThread = payload.data?.thread as ChatThread

      setThreads((current) =>
        current.map((currentThread) =>
          currentThread.id === thread.id ? savedThread : currentThread
        )
      )
      closeThreadModal()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Could not rename chat: ${requestError.message}`
          : 'Could not rename chat.'
      )
    } finally {
      setMutatingThreadId('')
    }
  }

  async function confirmDeleteThread() {
    if (!selectedThread) {
      return
    }

    const thread = selectedThread
    const remainingThreads = threads.filter((currentThread) => currentThread.id !== thread.id)

    if (thread.id.startsWith('local-')) {
      setThreads(remainingThreads)
      closeThreadModal()

      if (activeThreadId === thread.id) {
        const nextThread = remainingThreads[0]

        if (nextThread) {
          setActiveThreadId(nextThread.id)
        } else {
          await startNewChat()
        }
      }

      return
    }

    setMutatingThreadId(thread.id)
    setError('')

    try {
      const response = await fetch(`/api/interopmind/threads?threadId=${encodeURIComponent(thread.id)}`, {
        method: 'DELETE',
      })
      const payload = await response.json()

      if (!response.ok || !payload.success) {
        setError(payload.error || 'Could not delete chat.')
        return
      }

      setThreads(remainingThreads)
      closeThreadModal()

      if (activeThreadId === thread.id) {
        const nextThread = remainingThreads[0]

        if (nextThread) {
          setActiveThreadId(nextThread.id)
        } else {
          await startNewChat()
        }
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Could not delete chat: ${requestError.message}`
          : 'Could not delete chat.'
      )
    } finally {
      setMutatingThreadId('')
    }
  }

  async function sendMessage(message: string) {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isLoading || !activeThread) {
      return
    }

    const editMessageId = editingMessageId
    const editMessageIndex = editMessageId
      ? activeThread.messages.findIndex((threadMessage) => threadMessage.id === editMessageId)
      : -1
    const messagesBeforeEdit = editMessageIndex >= 0
      ? activeThread.messages.slice(0, editMessageIndex)
      : activeThread.messages
    const previousMessages = activeThread.messages
    const pendingUserMessage: ChatMessage = {
      id: `pending-user-${crypto.randomUUID()}`,
      role: 'user',
      content: trimmedMessage,
      createdAt: new Date().toISOString(),
    }
    const nextTitle =
      activeThread.title === 'New chat' ? titleFromMessage(trimmedMessage) : activeThread.title

    updateActiveThread((thread) => ({
      ...thread,
      title: nextTitle,
      updatedAt: new Date().toISOString(),
      messages: [...messagesBeforeEdit, pendingUserMessage],
    }))
    setInput('')
    setEditingMessageId('')
    setError('')
    setIsLoading(true)

    try {
      const requestMessages = [...messagesBeforeEdit, { role: 'user' as const, content: trimmedMessage }]
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedMessage,
          messages: requestMessages,
          context: 'interopmind_workspace',
          threadId: isSignedIn && !activeThread.id.startsWith('local-') ? activeThread.id : undefined,
          editMessageId: isSignedIn ? editMessageId || undefined : undefined,
        }),
      })
      const payload = await response.json().catch(() => ({
        success: false,
        reply: 'The InteropMind endpoint returned an unreadable response.',
      }))

      if (!response.ok || !payload.success) {
        setThreads((current) =>
          current.map((thread) =>
            thread.id === activeThread.id ? { ...thread, messages: previousMessages } : thread
          )
        )
        setInput(trimmedMessage)
        setEditingMessageId(editMessageId)
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
      setThreads((current) =>
        current.map((thread) =>
          thread.id === activeThread.id ? { ...thread, messages: previousMessages } : thread
        )
      )
      setInput(trimmedMessage)
      setEditingMessageId(editMessageId)
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

  async function copyMessage(content: string, messageId: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(content)
      } else {
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }

      setCopiedMessageId(messageId)
      window.setTimeout(() => setCopiedMessageId(''), 1600)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? `Could not copy answer: ${requestError.message}`
          : 'Could not copy answer.'
      )
    }
  }

  function editMessage(message: ChatMessage) {
    if (!message.id || isLoading) {
      return
    }

    setInput(message.content)
    setEditingMessageId(message.id)
    setError('')
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  function cancelMessageEdit() {
    setInput('')
    setEditingMessageId('')
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
              {!isSignedIn && !isCollapsed && (
                <div className="mb-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-2 text-xs leading-5 text-teal-800 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-200">
                  Guest chats are not saved. Sign in to keep history.
                </div>
              )}
              {chatHistory.map((thread) => {
                const active = thread.id === activeThread?.id
                const optionsOpen = openThreadOptionsId === thread.id

                return (
                  <div key={thread.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => openThread(thread.id)}
                      title={isCollapsed ? thread.title : undefined}
                      className={`flex h-11 w-full items-center rounded-full text-left text-sm transition ${
                        isCollapsed ? 'justify-center px-0' : 'gap-3 px-3 pr-10'
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

                    {!isCollapsed && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          setOpenThreadOptionsId((current) => (current === thread.id ? '' : thread.id))
                        }}
                        aria-label={`Options for ${thread.title}`}
                        title="Chat options"
                        className={`absolute right-2 top-1.5 grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-300 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white ${
                          active || optionsOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        <Icon name="dots" />
                      </button>
                    )}

                    {!isCollapsed && optionsOpen && (
                      <div className="absolute right-2 top-10 z-30 w-44 rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-lg dark:border-slate-800 dark:bg-slate-950">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveThreadId(thread.id)
                            setOpenThreadOptionsId('')
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          <Icon name="chat" />
                          Open chat
                        </button>
                        <button
                          type="button"
                          onClick={() => renameThread(thread)}
                          disabled={mutatingThreadId === thread.id}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-200 dark:hover:bg-slate-900"
                        >
                          <Icon name="edit" />
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteThread(thread)}
                          disabled={mutatingThreadId === thread.id}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950/40"
                        >
                          <Icon name="trash" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </nav>

          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className={`flex items-center gap-3 rounded-full px-2 py-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
              <Link
                href={isSignedIn ? accountHref : '/account/login?next=%2Finteropmind'}
                className={`min-w-0 items-center gap-3 rounded-full transition hover:bg-slate-200 dark:hover:bg-slate-800 ${isCollapsed ? 'hidden' : 'flex'}`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  {userInitial}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950 dark:text-white">{displayName}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{user?.email || 'Sign in to save chats'}</span>
                </span>
              </Link>
              {isCollapsed && (
                <Link href={isSignedIn ? accountHref : '/account/login?next=%2Finteropmind'} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  {userInitial}
                </Link>
              )}
              {isSignedIn ? (
                <AccountLogoutButton variant="sidebar" />
              ) : (
                <Link href="/account/login?next=%2Finteropmind" className="rounded-full bg-slate-950 px-3 py-2 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                  Sign in
                </Link>
              )}
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
                href={isSignedIn ? accountHref : '/account/login?next=%2Finteropmind'}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950"
                title={isSignedIn ? 'Account workspace' : 'Sign in to save chats'}
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

                    const messageKey = message.id || `${activeThread.id}-${message.role}-${index}`
                    const copied = copiedMessageId === messageKey
                    const canEditMessage = message.role === 'user' && index === lastUserMessageIndex

                    return (
                      <div key={messageKey} className={`group flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={message.role === 'user' ? 'flex max-w-2xl flex-col items-end' : 'flex max-w-3xl flex-col items-start'}>
                          {message.role === 'assistant' ? (
                            <>
                              <div className="px-1 py-1 text-sm leading-7 text-slate-700 dark:text-slate-200">
                                <MessageContent content={message.content} />
                              </div>
                              <div className="mt-1 flex h-8 items-center gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => void copyMessage(message.content, messageKey)}
                                  className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                  aria-label="Copy answer"
                                  title={copied ? 'Copied' : 'Copy answer'}
                                >
                                  <Icon name="copy" />
                                </button>
                                {copied && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Copied</span>}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="rounded-3xl bg-slate-100 px-5 py-3 text-sm leading-6 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                                <p>{message.content}</p>
                              </div>
                              <div className="mt-1 flex h-8 items-center justify-end gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => void copyMessage(message.content, messageKey)}
                                  className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                  aria-label="Copy message"
                                  title={copied ? 'Copied' : 'Copy message'}
                                >
                                  <Icon name="copy" />
                                </button>
                                {canEditMessage && (
                                  <button
                                    type="button"
                                    onClick={() => editMessage(message)}
                                    disabled={isLoading || !message.id}
                                    className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                    aria-label="Edit last message"
                                    title="Edit last message"
                                  >
                                    <Icon name="edit" />
                                  </button>
                                )}
                                {copied && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Copied</span>}
                              </div>
                            </>
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
              {editingMessageId && (
                <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
                  <span className="font-semibold">Editing your last message</span>
                  <button
                    type="button"
                    onClick={cancelMessageEdit}
                    disabled={isLoading}
                    className="rounded-full px-3 py-1 text-xs font-bold transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-teal-900"
                  >
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex min-h-16 items-center gap-3 rounded-3xl bg-slate-100 px-5 py-3 shadow-sm dark:bg-slate-900">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={editingMessageId ? 'Edit your message' : 'Ask InteropMind'}
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

      {threadModalMode && selectedThread && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950">
            {threadModalMode === 'rename' ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  void submitRenameThread()
                }}
              >
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Rename chat</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Give this conversation a clear name for your history.
                </p>
                <input
                  type="text"
                  value={renameTitle}
                  onChange={(event) => setRenameTitle(event.target.value)}
                  autoFocus
                  className="mt-5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-950 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                />
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeThreadModal}
                    disabled={mutatingThreadId === selectedThread.id}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={mutatingThreadId === selectedThread.id || !renameTitle.trim()}
                    className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200 dark:disabled:bg-slate-700"
                  >
                    {mutatingThreadId === selectedThread.id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Delete chat?</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  This will remove <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedThread.title}</span> from your InteropMind history.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeThreadModal}
                    disabled={mutatingThreadId === selectedThread.id}
                    className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-slate-300 dark:hover:bg-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void confirmDeleteThread()}
                    disabled={mutatingThreadId === selectedThread.id}
                    className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300 dark:disabled:bg-red-950"
                  >
                    {mutatingThreadId === selectedThread.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
