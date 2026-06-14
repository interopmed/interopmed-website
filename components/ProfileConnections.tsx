'use client'

import Link from 'next/link'
import { useState } from 'react'
import ProfileAvatar from './ProfileAvatar'

type ConnectionPerson = {
  id: string
  publicHandle: string
  displayName: string | null
  profileImage: string | null
}

type ProfileConnectionsProps = {
  followers: ConnectionPerson[]
  followerCount: number
  following: ConnectionPerson[]
  followingCount: number
}

function PersonCard({ person }: { person: ConnectionPerson }) {
  const name = person.displayName || person.publicHandle

  return (
    <Link
      href={`/people/${encodeURIComponent(person.publicHandle)}`}
      className="group min-w-0 rounded-xl border border-slate-100 p-3 text-center transition hover:border-teal-200 hover:bg-teal-50/50 dark:border-slate-800 dark:hover:border-teal-900 dark:hover:bg-teal-950/20"
    >
      <ProfileAvatar imageUrl={person.profileImage} name={name} className="mx-auto h-12 w-12 text-sm" />
      <span className="mt-2 block truncate text-xs font-bold group-hover:text-teal-700 dark:group-hover:text-teal-300">
        {name}
      </span>
      <span className="mt-0.5 block truncate text-[11px] text-slate-400">@{person.publicHandle}</span>
    </Link>
  )
}

export default function ProfileConnections({
  followers,
  followerCount,
  following,
  followingCount,
}: ProfileConnectionsProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers')
  const people = activeTab === 'followers' ? followers : following

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.05),0_10px_35px_rgba(15,23,42,0.04)] dark:bg-slate-900 sm:p-6">
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('followers')}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
            activeTab === 'followers'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Followers {followerCount}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('following')}
          className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
            activeTab === 'following'
              ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          Following {followingCount}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {people.map((person) => <PersonCard key={person.id} person={person} />)}
      </div>

      {people.length === 0 && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          {activeTab === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
        </p>
      )}
    </section>
  )
}
