'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type NotificationPreferences = {
  accountUpdates: boolean
  productNotes: boolean
  supportReplies: boolean
  securityAlerts: boolean
  weeklyDigest: boolean
}

type AccountNotificationPreferencesFormProps = {
  preferences: NotificationPreferences
}

type NotificationState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

const options: Array<{
  name: keyof NotificationPreferences
  title: string
  body: string
  locked?: boolean
}> = [
  {
    name: 'accountUpdates',
    title: 'Account updates',
    body: 'Profile, email, login, and account lifecycle messages.',
    locked: true,
  },
  {
    name: 'securityAlerts',
    title: 'Security alerts',
    body: 'Password, session, and recovery events that need attention.',
    locked: true,
  },
  {
    name: 'supportReplies',
    title: 'Support replies',
    body: 'Responses to support requests and account help conversations.',
  },
  {
    name: 'productNotes',
    title: 'Product notes',
    body: 'InteropMed Studio updates, workflow improvements, and release notes.',
  },
  {
    name: 'weeklyDigest',
    title: 'Weekly digest',
    body: 'A compact summary of account activity and product updates.',
  },
]

export default function AccountNotificationPreferencesForm({ preferences }: AccountNotificationPreferencesFormProps) {
  const router = useRouter()
  const [state, setState] = useState<NotificationState>({ status: 'idle', message: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting', message: 'Saving notification preferences...' })

    const formData = new FormData(event.currentTarget)
    const payload = Object.fromEntries(
      options.map((option) => [option.name, option.locked || formData.get(option.name) === 'on'])
    )

    const response = await fetch('/api/account/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => ({
      success: false,
      error: 'The notifications endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to save notification preferences.' })
      return
    }

    setState({ status: 'success', message: 'Notification preferences saved.' })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Notifications</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">Email preferences</h1>
      <div className="mt-6 grid gap-4">
        {options.map((option) => (
          <label key={option.name} className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 md:flex-row md:items-center md:justify-between">
            <span>
              <span className="font-semibold text-slate-950 dark:text-white">{option.title}</span>
              <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{option.body}</span>
            </span>
            <span className="flex items-center gap-3">
              {option.locked && (
                <span className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  Required
                </span>
              )}
              <input
                type="checkbox"
                name={option.name}
                defaultChecked={option.locked || preferences[option.name]}
                disabled={option.locked}
                className="h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </span>
          </label>
        ))}
      </div>
      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
      >
        {state.status === 'submitting' ? 'Saving...' : 'Save preferences'}
      </button>
      {state.message && (
        <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
