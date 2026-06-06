'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type AccountSettingsFormProps = {
  user: {
    username: string
    email: string
    displayName: string | null
    role: string
  }
}

type SettingsState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export default function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const router = useRouter()
  const [state, setState] = useState<SettingsState>({ status: 'idle', message: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting', message: 'Saving settings...' })

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/account/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.get('email'),
        displayName: formData.get('displayName'),
      }),
    })
    const result = await response.json().catch(() => ({
      success: false,
      error: 'The settings endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to save settings.' })
      return
    }

    const form = event.currentTarget
    setState({ status: 'success', message: 'Settings saved.' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Username</span>
          <input
            value={user.username}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Role</span>
          <input
            value={user.role}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 capitalize text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Display name</span>
          <input
            name="displayName"
            defaultValue={user.displayName || ''}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Email</span>
          <input
            required
            type="email"
            name="email"
            defaultValue={user.email}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
      >
        {state.status === 'submitting' ? 'Saving...' : 'Save settings'}
      </button>

      {state.message && (
        <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
