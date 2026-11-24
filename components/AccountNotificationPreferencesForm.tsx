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

// Icon Components for Option Categories
const AccountUpdatesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-teal-600 dark:text-teal-400">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const SecurityAlertsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600 dark:text-rose-400">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const SupportRepliesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8 10h.01" />
    <path d="M12 10h.01" />
    <path d="M16 10h.01" />
  </svg>
)

const ProductNotesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
    <path d="m12 3-1.912 5.886L5 9.176l4.906.463L12 15l1.912-5.886 4.906-.463-4.906-.463L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5 5 3Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
  </svg>
)

const WeeklyDigestIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M3 9h18" />
    <path d="M9 21V9" />
  </svg>
)

type NotificationOption = {
  name: keyof NotificationPreferences
  title: string
  body: string
  locked?: boolean
}

const options: Array<NotificationOption> = [
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

function getOptionIcon(name: keyof NotificationPreferences) {
  switch (name) {
    case 'accountUpdates':
      return <AccountUpdatesIcon />
    case 'securityAlerts':
      return <SecurityAlertsIcon />
    case 'supportReplies':
      return <SupportRepliesIcon />
    case 'productNotes':
      return <ProductNotesIcon />
    case 'weeklyDigest':
      return <WeeklyDigestIcon />
    default:
      return null
  }
}

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
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Notifications</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Email preferences</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Choose what updates you want delivered to your primary email address.</p>
      </div>

      <div className="mt-6 grid gap-4">
        {options.map((option) => {
          return (
            <div
              key={option.name}
              className="flex flex-col gap-4 rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all duration-200 hover:border-slate-200 dark:border-slate-800/40 dark:bg-slate-950/20 dark:hover:border-slate-800 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex gap-4 items-start">
                <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200/50 dark:bg-slate-900 dark:border-slate-800/60">
                  {getOptionIcon(option.name)}
                </span>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">{option.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-slate-500 dark:text-slate-400">{option.body}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 self-end md:self-auto">
                {option.locked && (
                  <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    Required
                  </span>
                )}
                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name={option.name}
                    defaultChecked={option.locked || preferences[option.name]}
                    disabled={option.locked}
                    className="sr-only peer"
                  />
                  <div className="relative w-11 h-6 bg-slate-200 rounded-full transition-colors peer-focus:outline-none dark:bg-slate-800/80 peer-checked:bg-teal-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-700 peer-checked:after:translate-x-full peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col items-stretch sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="submit"
          disabled={state.status === 'submitting'}
          className="relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-600/10 transition-all duration-200 hover:from-teal-500 hover:to-emerald-500 hover:shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-75 disabled:active:scale-100"
        >
          {state.status === 'submitting' && (
            <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {state.status === 'submitting' ? 'Saving preferences...' : 'Save preferences'}
        </button>

        {state.message && (
          <div className={`text-sm px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${
            state.status === 'error'
              ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30'
              : 'bg-teal-50 text-teal-700 border border-teal-100 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/30'
          }`}>
            <span className="h-1.5 w-1.5 rounded-full currentColor animate-pulse" />
            {state.message}
          </div>
        )}
      </div>
    </form>
  )
}
