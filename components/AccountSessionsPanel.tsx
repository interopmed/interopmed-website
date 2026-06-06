'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type AccountSessionsPanelProps = {
  otherSessionCount: number
}

type SessionState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export default function AccountSessionsPanel({ otherSessionCount }: AccountSessionsPanelProps) {
  const router = useRouter()
  const [state, setState] = useState<SessionState>({ status: 'idle', message: '' })

  async function revokeOtherSessions() {
    setState({ status: 'submitting', message: 'Signing out other sessions...' })

    const response = await fetch('/api/account/security/sessions', {
      method: 'DELETE',
    })

    const result = await response.json().catch(() => ({
      success: false,
      error: 'The sessions endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to revoke sessions.' })
      return
    }

    const revokedSessions = Number(result.data?.revokedSessions || 0)
    setState({
      status: 'success',
      message: `${revokedSessions} session${revokedSessions === 1 ? '' : 's'} signed out.`,
    })
    router.refresh()
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Sessions</p>
      <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Session control</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        {otherSessionCount > 0
          ? `${otherSessionCount} other active session${otherSessionCount === 1 ? '' : 's'} can be revoked.`
          : 'No other active sessions are currently recorded.'}
      </p>
      <button
        type="button"
        onClick={revokeOtherSessions}
        disabled={state.status === 'submitting' || otherSessionCount === 0}
        className="mt-5 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:border-red-500 dark:hover:text-red-300"
      >
        {state.status === 'submitting' ? 'Signing out...' : 'Sign out other sessions'}
      </button>
      {state.message && (
        <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
          {state.message}
        </p>
      )}
    </div>
  )
}
