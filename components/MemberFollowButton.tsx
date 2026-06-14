'use client'

import { useState } from 'react'

type MemberFollowButtonProps = {
  memberId: string
  initialFollowerCount: number
  initialFollowing: boolean
}

export default function MemberFollowButton({
  memberId,
  initialFollowerCount,
  initialFollowing,
}: MemberFollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [followerCount, setFollowerCount] = useState(initialFollowerCount)
  const [isPending, setIsPending] = useState(false)

  async function toggleFollow() {
    setIsPending(true)

    try {
      const response = await fetch(`/api/account/users/${memberId}/follow`, {
        method: following ? 'DELETE' : 'POST',
      })
      const result = await response.json()

      if (response.ok && result.success) {
        setFollowing(result.data.following)
        setFollowerCount(result.data.followerCount)
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleFollow}
        disabled={isPending}
        className={following
          ? 'rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:border-slate-400 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
          : 'rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200'}
      >
        {isPending ? 'Updating...' : following ? 'Following' : 'Follow'}
      </button>
      <span className="text-xs font-semibold text-slate-400">
        {followerCount} follower{followerCount === 1 ? '' : 's'}
      </span>
    </div>
  )
}
