'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import ProfileAvatar from './ProfileAvatar'

type StreamUser = {
  id: string
  publicHandle: string
  displayName: string | null
  profileImage: string | null
  role: string
}

type StreamPost = {
  id: string
  content: string
  topic: string
  visibility: string
  createdAt: string
  author: StreamUser
  comments: Array<{
    id: string
    content: string
    createdAt: string
    author: StreamUser
  }>
  commentCount: number
  likeCount: number
  likedByViewer: boolean
}

type StreamFeedProps = {
  currentUser: StreamUser | null
  initialPosts: StreamPost[]
}

const topicLabels: Record<string, string> = {
  api: 'API',
  fhir: 'FHIR',
  general: 'Community',
  hl7: 'HL7 v2',
  implementation: 'Implementation',
  security: 'Security',
}

function name(user: StreamUser) {
  return user.displayName || user.publicHandle
}

function relativeDate(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000))
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

export default function StreamFeed({ currentUser, initialPosts }: StreamFeedProps) {
  const [posts, setPosts] = useState(initialPosts)
  const [pendingId, setPendingId] = useState('')
  const [message, setMessage] = useState('')

  async function publishPost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setPendingId('new-post')
    setMessage('')

    try {
      const response = await fetch('/api/account/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.get('content'), topic: data.get('topic') }),
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessage(result.error || 'Unable to publish post.')
        return
      }

      setPosts((items) => [{
        ...result.data.post,
        createdAt: new Date(result.data.post.createdAt).toISOString(),
        comments: [],
        commentCount: 0,
        likeCount: 0,
        likedByViewer: false,
      }, ...items])
      form.reset()
    } finally {
      setPendingId('')
    }
  }

  async function toggleLike(post: StreamPost) {
    setPendingId(post.id)
    try {
      const response = await fetch(`/api/account/posts/${post.id}/likes`, {
        method: post.likedByViewer ? 'DELETE' : 'POST',
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setPosts((items) => items.map((item) => item.id === post.id
          ? { ...item, likedByViewer: result.data.liked, likeCount: result.data.likeCount }
          : item))
      }
    } finally {
      setPendingId('')
    }
  }

  async function publishComment(event: FormEvent<HTMLFormElement>, postId: string) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setPendingId(postId)
    try {
      const response = await fetch(`/api/account/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.get('content') }),
      })
      const result = await response.json()
      if (response.ok && result.success) {
        setPosts((items) => items.map((post) => post.id === postId ? {
          ...post,
          comments: [...post.comments, {
            ...result.data.comment,
            createdAt: new Date(result.data.comment.createdAt).toISOString(),
          }],
          commentCount: post.commentCount + 1,
        } : post))
        form.reset()
      }
    } finally {
      setPendingId('')
    }
  }

  async function sharePost(postId: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/stream#post-${postId}`)
    setMessage('Post link copied.')
  }

  return (
    <div className="space-y-5">
      {currentUser ? (
        <form onSubmit={publishPost} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">Create</p>
              <h2 className="mt-1 text-lg font-bold">Share with the network</h2>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Public stream</span>
          </div>
          <div className="flex gap-3">
            <Link href={`/people/${encodeURIComponent(currentUser.publicHandle)}`} className="shrink-0">
              <ProfileAvatar imageUrl={currentUser.profileImage} name={name(currentUser)} className="h-12 w-12 shadow-md" />
            </Link>
            <div className="min-w-0 flex-1">
              <textarea
                required
                name="content"
                rows={3}
                maxLength={1200}
                placeholder="Share an update with your professional network..."
                className="min-h-24 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <select name="topic" defaultValue="general" className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                  {Object.entries(topicLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
                <button disabled={pendingId === 'new-post'} className="rounded-full bg-slate-950 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                  {pendingId === 'new-post' ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-xl font-bold text-teal-700 dark:bg-teal-950/40 dark:text-teal-300">+</span>
          <p className="mt-4 text-lg font-bold">Join the conversation</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">Sign in to publish professional updates, exchange comments, and support useful work.</p>
          <Link href="/account/login?next=%2Fstream" className="mt-4 inline-flex rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white">Sign in</Link>
        </div>
      )}

      {message && <p className="px-2 text-xs font-semibold text-teal-700 dark:text-teal-300">{message}</p>}

      {posts.map((post) => (
        <article id={`post-${post.id}`} key={post.id} className="group scroll-mt-24 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:shadow-[0_16px_45px_rgba(15,23,42,0.09)] dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex gap-3">
            <Link href={`/people/${encodeURIComponent(post.author.publicHandle)}`} className="shrink-0">
              <ProfileAvatar imageUrl={post.author.profileImage} name={name(post.author)} className="h-12 w-12 shadow-md" />
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/people/${encodeURIComponent(post.author.publicHandle)}`} className="font-bold transition hover:text-teal-700">{name(post.author)}</Link>
              <p className="mt-0.5 text-xs text-slate-400">@{post.author.publicHandle} | {relativeDate(post.createdAt)} | Professional network</p>
            </div>
            <span className="h-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {topicLabels[post.topic] || post.topic}
            </span>
          </div>

          <p className="mt-5 whitespace-pre-wrap text-[15px] leading-7 text-slate-700 dark:text-slate-200 sm:text-base">{post.content}</p>

          <div className="mt-5 flex justify-between border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800">
            <span>{post.likeCount} like{post.likeCount === 1 ? '' : 's'}</span>
            <span>{post.commentCount} comment{post.commentCount === 1 ? '' : 's'}</span>
          </div>

          <div className={`mt-2 grid border-y border-slate-100 py-1.5 dark:border-slate-800 ${currentUser ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {currentUser && (
              <>
                <button type="button" disabled={pendingId === post.id} onClick={() => toggleLike(post)} className={`rounded-xl py-2.5 text-sm font-bold transition hover:bg-slate-50 dark:hover:bg-slate-800 ${post.likedByViewer ? 'text-teal-700 dark:text-teal-300' : 'text-slate-500'}`}>
                  {post.likedByViewer ? 'Liked' : 'Like'}
                </button>
                <button type="button" onClick={() => document.getElementById(`stream-comment-${post.id}`)?.focus()} className="rounded-xl py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800">Comment</button>
              </>
            )}
            <button type="button" onClick={() => sharePost(post.id)} className="rounded-xl py-2.5 text-sm font-bold text-slate-500 transition hover:bg-slate-50 dark:hover:bg-slate-800">Share</button>
          </div>

          {post.comments.length > 0 && (
            <div className="mt-4 space-y-3">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3.5 dark:bg-slate-950">
                  <ProfileAvatar imageUrl={comment.author.profileImage} name={name(comment.author)} className="h-9 w-9 text-xs shadow-sm" />
                  <div>
                    <Link href={`/people/${encodeURIComponent(comment.author.publicHandle)}`} className="text-sm font-bold hover:text-teal-700">{name(comment.author)}</Link>
                    <span className="ml-2 text-xs text-slate-400">{relativeDate(comment.createdAt)}</span>
                    <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentUser && (
            <form onSubmit={(event) => publishComment(event, post.id)} className="mt-4 flex gap-3">
              <ProfileAvatar imageUrl={currentUser.profileImage} name={name(currentUser)} className="h-9 w-9 text-xs" />
              <input id={`stream-comment-${post.id}`} required name="content" maxLength={600} placeholder="Add a thoughtful comment..." className="h-11 min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950" />
              <button disabled={pendingId === post.id} className="rounded-full bg-slate-950 px-5 text-xs font-bold text-white transition hover:bg-teal-700 disabled:opacity-60 dark:bg-white dark:text-slate-950">Send</button>
            </form>
          )}
        </article>
      ))}
    </div>
  )
}
