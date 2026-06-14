'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type FeedAuthor = {
  id: string
  publicHandle: string
  displayName: string | null
  role: string
}

type FeedComment = {
  id: string
  content: string
  createdAt: string
  author: FeedAuthor
}

type FeedPost = {
  id: string
  content: string
  topic: string
  visibility: string
  createdAt: string
  updatedAt: string
  author: FeedAuthor
  comments: FeedComment[]
  commentCount: number
}

type AccountPostFeedProps = {
  currentUser: FeedAuthor
  initialPosts: FeedPost[]
  variant?: 'account' | 'network'
}

type SubmitState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

const topicOptions = [
  { value: 'general', label: 'General' },
  { value: 'fhir', label: 'FHIR' },
  { value: 'hl7', label: 'HL7 v2' },
  { value: 'api', label: 'API' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'security', label: 'Security' },
]

function formatRelative(value: string) {
  const createdAt = new Date(value)
  const diffMs = Date.now() - createdAt.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours} hr ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
}

function displayName(author: FeedAuthor) {
  return author.displayName || author.publicHandle
}

function initialFor(author: FeedAuthor) {
  return displayName(author).slice(0, 1).toUpperCase()
}

function topicLabel(value: string) {
  return topicOptions.find((option) => option.value === value)?.label || 'General'
}

export default function AccountPostFeed({ currentUser, initialPosts, variant = 'account' }: AccountPostFeedProps) {
  const router = useRouter()
  const [posts, setPosts] = useState(initialPosts)
  const [postState, setPostState] = useState<SubmitState>({ status: 'idle', message: '' })
  const [commentStates, setCommentStates] = useState<Record<string, SubmitState>>({})
  const isNetwork = variant === 'network'

  async function handlePostSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setPostState({ status: 'submitting', message: 'Publishing post...' })

    const response = await fetch('/api/account/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: formData.get('content'),
        topic: formData.get('topic'),
      }),
    })
    const result = await response.json().catch(() => ({
      success: false,
      error: 'The post endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setPostState({ status: 'error', message: result.error || 'Failed to publish post.' })
      return
    }

    const post = result.data.post as FeedPost
    setPosts((currentPosts) => [
      {
        ...post,
        createdAt: new Date(post.createdAt).toISOString(),
        updatedAt: new Date(post.updatedAt).toISOString(),
        comments: [],
        commentCount: 0,
      },
      ...currentPosts,
    ])
    form.reset()
    setPostState({ status: 'success', message: 'Post published.' })
    router.refresh()
  }

  async function handleCommentSubmit(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    setCommentStates((states) => ({
      ...states,
      [postId]: { status: 'submitting', message: 'Posting comment...' },
    }))

    const response = await fetch(`/api/account/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: formData.get('content'),
      }),
    })
    const result = await response.json().catch(() => ({
      success: false,
      error: 'The comment endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setCommentStates((states) => ({
        ...states,
        [postId]: { status: 'error', message: result.error || 'Failed to post comment.' },
      }))
      return
    }

    const comment = result.data.comment as FeedComment
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  ...comment,
                  createdAt: new Date(comment.createdAt).toISOString(),
                },
              ],
              commentCount: post.commentCount + 1,
            }
          : post
      )
    )
    form.reset()
    setCommentStates((states) => ({
      ...states,
      [postId]: { status: 'success', message: 'Comment posted.' },
    }))
    router.refresh()
  }

  return (
    <div className={isNetwork ? 'space-y-4' : 'rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900'}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Professional feed</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Posts</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Share updates, ask implementation questions, and comment on work inside the member network.
          </p>
        </div>
      </div>

      <form
        onSubmit={handlePostSubmit}
        className={isNetwork
          ? 'rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_30px_rgba(15,23,42,0.04)] dark:bg-slate-900'
          : 'mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950'}
      >
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
            {initialFor(currentUser)}
          </div>
          <div className="min-w-0 flex-1">
            <label className="block">
              <span className="sr-only">Post content</span>
              <textarea
                required
                name="content"
                rows={isNetwork ? 3 : 4}
                maxLength={1200}
                placeholder="Start a post: share an update, implementation question, workflow note, or field observation..."
                className={`${isNetwork ? 'min-h-24 rounded-xl border-slate-200 bg-slate-50' : 'rounded-lg border-slate-300 bg-white'} w-full resize-y border px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white`}
              />
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="block">
                <span className="sr-only">Post topic</span>
                <select
                  name="topic"
                  defaultValue="general"
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {topicOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                disabled={postState.status === 'submitting'}
                className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
              >
                {postState.status === 'submitting' ? 'Posting...' : 'Post'}
              </button>
            </div>
            {postState.message && (
              <p className={`mt-3 text-sm ${postState.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
                {postState.message}
              </p>
            )}
          </div>
        </div>
      </form>

      <div className={isNetwork ? 'space-y-4' : 'mt-6 space-y-4'}>
        {posts.map((post) => (
          <article
            key={post.id}
            className={isNetwork
              ? 'rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.06),0_8px_30px_rgba(15,23,42,0.04)] dark:bg-slate-900'
              : 'rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950'}
          >
            <div className="flex gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                {initialFor(post.author)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/people/${encodeURIComponent(post.author.publicHandle)}`}
                    className="font-semibold text-slate-950 transition hover:text-teal-700 dark:text-white dark:hover:text-teal-300"
                  >
                    {displayName(post.author)}
                  </Link>
                  <span className="text-sm text-slate-400">{formatRelative(post.createdAt)}</span>
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    {topicLabel(post.topic)}
                  </span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{post.content}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <span>{post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</span>
                  <span>{post.visibility} network</span>
                  <span>{post.author.role}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
                        {initialFor(comment.author)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/people/${encodeURIComponent(comment.author.publicHandle)}`}
                            className="text-sm font-semibold text-slate-950 transition hover:text-teal-700 dark:text-white dark:hover:text-teal-300"
                          >
                            {displayName(comment.author)}
                          </Link>
                          <span className="text-xs text-slate-400">{formatRelative(comment.createdAt)}</span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={(event) => handleCommentSubmit(event, post.id)} className="mt-4 flex gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    {initialFor(currentUser)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <label className="block">
                      <span className="sr-only">Comment</span>
                      <input
                        required
                        name="content"
                        maxLength={600}
                        placeholder="Comment on this post..."
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      />
                    </label>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className={`text-xs ${commentStates[post.id]?.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
                        {commentStates[post.id]?.message}
                      </p>
                      <button
                        type="submit"
                        disabled={commentStates[post.id]?.status === 'submitting'}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300"
                      >
                        {commentStates[post.id]?.status === 'submitting' ? 'Posting...' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-300 p-5 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
            No workspace posts yet. Publish the first implementation update or standards question.
          </div>
        )}
      </div>
    </div>
  )
}
