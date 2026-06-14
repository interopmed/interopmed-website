'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import ProfileAvatar from './ProfileAvatar'

type FeedAuthor = {
  id: string
  publicHandle: string
  displayName: string | null
  profileImage: string | null
  role: string
}

type ProfileComment = {
  id: string
  content: string
  createdAt: string
  author: FeedAuthor
}

type ProfilePost = {
  id: string
  content: string
  topic: string
  visibility: string
  createdAt: string
  author: FeedAuthor
  comments: ProfileComment[]
  commentCount: number
  likeCount: number
  likedByViewer: boolean
}

type MemberProfileFeedProps = {
  currentUser: FeedAuthor | null
  initialPosts: ProfilePost[]
  isOwnProfile: boolean
}

const topicOptions = [
  { value: 'general', label: 'Community' },
  { value: 'fhir', label: 'FHIR' },
  { value: 'hl7', label: 'HL7 v2' },
  { value: 'api', label: 'API' },
  { value: 'implementation', label: 'Implementation' },
  { value: 'security', label: 'Security' },
]

const topicStyles: Record<string, string> = {
  api: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  fhir: 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300',
  general: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  hl7: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
  implementation: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  security: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
}

function name(author: FeedAuthor) {
  return author.displayName || author.publicHandle
}

function relativeDate(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function topicLabel(value: string) {
  return topicOptions.find((topic) => topic.value === value)?.label || value
}

export default function MemberProfileFeed({
  currentUser,
  initialPosts,
  isOwnProfile,
}: MemberProfileFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [pendingPostId, setPendingPostId] = useState('')
  const [message, setMessage] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setIsPublishing(true)
    setMessage('')

    try {
      const response = await fetch('/api/account/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: data.get('content'),
          topic: data.get('topic'),
        }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessage(result.error || 'Unable to publish post.')
        return
      }

      const post = result.data.post
      setPosts((current) => [{
        ...post,
        createdAt: new Date(post.createdAt).toISOString(),
        author: post.author,
        comments: [],
        commentCount: 0,
        likeCount: 0,
        likedByViewer: false,
      }, ...current])
      form.reset()
      setMessage('Post published.')
    } finally {
      setIsPublishing(false)
    }
  }

  async function toggleLike(post: ProfilePost) {
    setPendingPostId(post.id)

    try {
      const response = await fetch(`/api/account/posts/${post.id}/likes`, {
        method: post.likedByViewer ? 'DELETE' : 'POST',
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setPosts((current) => current.map((item) => item.id === post.id
          ? {
              ...item,
              likedByViewer: result.data.liked,
              likeCount: result.data.likeCount,
            }
          : item))
      }
    } finally {
      setPendingPostId('')
    }
  }

  async function publishComment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setPendingPostId(postId)

    try {
      const response = await fetch(`/api/account/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.get('content') }),
      })
      const result = await response.json()

      if (response.ok && result.success) {
        const comment = result.data.comment
        setPosts((current) => current.map((post) => post.id === postId
          ? {
              ...post,
              comments: [...post.comments, {
                ...comment,
                createdAt: new Date(comment.createdAt).toISOString(),
              }],
              commentCount: post.commentCount + 1,
            }
          : post))
        form.reset()
      }
    } finally {
      setPendingPostId('')
    }
  }

  async function copyPostLink(postId: string) {
    await navigator.clipboard.writeText(`${window.location.href}#post-${postId}`)
    setMessage('Post link copied.')
  }

  return (
    <div className="space-y-5">
      {isOwnProfile && currentUser && (
        <form onSubmit={publishPost} className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_35px_rgba(15,23,42,0.04)] dark:bg-slate-900">
          <div className="flex gap-3">
            <ProfileAvatar imageUrl={currentUser.profileImage} name={name(currentUser)} className="h-11 w-11 text-sm" />
            <div className="min-w-0 flex-1">
              <textarea
                required
                name="content"
                rows={3}
                maxLength={1200}
                placeholder="Share a professional update, implementation lesson, or standards question..."
                className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <select name="topic" defaultValue="general" className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold outline-none dark:border-slate-700 dark:bg-slate-900">
                  {topicOptions.map((topic) => (
                    <option key={topic.value} value={topic.value}>{topic.label}</option>
                  ))}
                </select>
                <button type="submit" disabled={isPublishing} className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60 dark:bg-white dark:text-slate-950">
                  {isPublishing ? 'Publishing...' : 'Post'}
                </button>
              </div>
              {message && <p className="mt-3 text-xs font-semibold text-teal-700 dark:text-teal-300">{message}</p>}
            </div>
          </div>
        </form>
      )}

      {posts.map((post) => (
        <article id={`post-${post.id}`} key={post.id} className="scroll-mt-24 rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_35px_rgba(15,23,42,0.04)] dark:bg-slate-900 md:p-6">
          <div className="flex gap-3">
            <Link href={`/people/${encodeURIComponent(post.author.publicHandle)}`} className="shrink-0">
              <ProfileAvatar imageUrl={post.author.profileImage} name={name(post.author)} className="h-11 w-11 text-sm" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link href={`/people/${encodeURIComponent(post.author.publicHandle)}`} className="font-bold hover:text-teal-700 dark:hover:text-teal-300">
                  {name(post.author)}
                </Link>
                <span className="text-xs text-slate-400">@{post.author.publicHandle}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="text-xs text-slate-400">{relativeDate(post.createdAt)}</span>
              </div>
              <p className="mt-0.5 text-xs font-medium text-slate-400">Shared with the {post.visibility} network</p>
            </div>
            <span className={`h-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${topicStyles[post.topic] || topicStyles.general}`}>
              {topicLabel(post.topic)}
            </span>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-slate-700 dark:text-slate-200">{post.content}</p>

          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-400 dark:border-slate-800">
            <span>{post.likeCount} like{post.likeCount === 1 ? '' : 's'}</span>
            <span>{post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</span>
          </div>

          <div className={`mt-2 grid border-y border-slate-100 py-1 dark:border-slate-800 ${currentUser ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {currentUser && (
              <>
                <button type="button" onClick={() => toggleLike(post)} disabled={pendingPostId === post.id} className={`rounded-lg py-2.5 text-sm font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 ${post.likedByViewer ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500 dark:text-slate-400'}`}>
                  {post.likedByViewer ? 'Liked' : 'Like'}
                </button>
                <button type="button" onClick={() => document.getElementById(`comment-${post.id}`)?.focus()} className="rounded-lg py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
                  Comment
                </button>
              </>
            )}
            <button type="button" onClick={() => copyPostLink(post.id)} className="rounded-lg py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800">
              Share
            </button>
          </div>

          {post.comments.length > 0 && (
            <div className="mt-4 space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 rounded-xl bg-slate-50 p-3.5 dark:bg-slate-950">
                  <Link href={`/people/${encodeURIComponent(comment.author.publicHandle)}`} className="shrink-0">
                    <ProfileAvatar imageUrl={comment.author.profileImage} name={name(comment.author)} className="h-8 w-8 text-xs shadow-sm" />
                  </Link>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/people/${encodeURIComponent(comment.author.publicHandle)}`} className="text-sm font-bold hover:text-teal-700 dark:hover:text-teal-300">
                        {name(comment.author)}
                      </Link>
                      <span className="text-xs text-slate-400">{relativeDate(comment.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUser && (
            <form onSubmit={(event) => publishComment(event, post.id)} className="mt-4 flex gap-3">
              <ProfileAvatar imageUrl={currentUser.profileImage} name={name(currentUser)} className="h-8 w-8 text-xs" />
              <div className="flex min-w-0 flex-1 gap-2">
                <input
                  id={`comment-${post.id}`}
                  required
                  name="content"
                  maxLength={600}
                  placeholder="Write a comment..."
                  className="h-10 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950"
                />
                <button type="submit" disabled={pendingPostId === post.id} className="rounded-full bg-slate-950 px-4 text-xs font-bold text-white disabled:opacity-60 dark:bg-white dark:text-slate-950">
                  Send
                </button>
              </div>
            </form>
          )}
        </article>
      ))}

      {posts.length === 0 && (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-slate-900">
          <p className="font-bold">No posts yet</p>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Professional activity will appear here.</p>
        </div>
      )}
    </div>
  )
}
