'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type AccountSettingsFormProps = {
  user: {
    username: string
    publicHandle: string
    email: string
    displayName: string | null
    displayNameChangedAt: string | null
    publicHandleChangedAt: string | null
    role: string
  }
}

type SettingsState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

type PendingSettings = {
  email: string
  displayName: string
  publicHandle: string
}

const PUBLIC_IDENTITY_CHANGE_INTERVAL_MS = 60 * 24 * 60 * 60 * 1000

// Modern Icon Components
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400/80 dark:text-slate-600">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const AtIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
  </svg>
)

const KeyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 dark:text-slate-500">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 1.5 1.5M15.5 7.5 14 6" />
  </svg>
)

function changeAvailability(lastChangedAt: string | null) {
  if (!lastChangedAt) {
    return { locked: false, nextDate: null }
  }

  const nextDate = new Date(new Date(lastChangedAt).getTime() + PUBLIC_IDENTITY_CHANGE_INTERVAL_MS)
  return {
    locked: nextDate > new Date(),
    nextDate,
  }
}

export default function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const router = useRouter()
  const [state, setState] = useState<SettingsState>({ status: 'idle', message: '' })
  const [pendingSettings, setPendingSettings] = useState<PendingSettings | null>(null)
  const displayNameAvailability = changeAvailability(user.displayNameChangedAt)
  const publicHandleAvailability = changeAvailability(user.publicHandleChangedAt)
  const formatDate = (value: Date) => new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(value)

  useEffect(() => {
    if (!pendingSettings) {
      return
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPendingSettings(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [pendingSettings])

  async function saveSettings(settings: PendingSettings) {
    setState({ status: 'submitting', message: 'Saving settings...' })

    const response = await fetch('/api/account/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    })
    const result = await response.json().catch(() => ({
      success: false,
      error: 'The settings endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to save settings.' })
      return
    }

    setPendingSettings(null)
    setState({ status: 'success', message: 'Settings saved.' })
    router.refresh()
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const settings = {
      email: String(formData.get('email') || ''),
      displayName: String(formData.get('displayName') || '').trim(),
      publicHandle: String(formData.get('publicHandle') || '').trim(),
    }
    const displayNameChanged = settings.displayName !== (user.displayName || '')
    const publicHandleChanged = settings.publicHandle.toLowerCase() !== user.publicHandle

    if (displayNameChanged || publicHandleChanged) {
      setState({ status: 'idle', message: '' })
      setPendingSettings(settings)
      return
    }

    void saveSettings(settings)
  }

  const pendingDisplayNameChange =
    pendingSettings !== null && pendingSettings.displayName !== (user.displayName || '')
  const pendingPublicHandleChange =
    pendingSettings !== null && pendingSettings.publicHandle.toLowerCase() !== user.publicHandle

  return (
    <>
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md">
      
      {/* Section 1: Security & Identity */}
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Account identity
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Your core system profile details and account role.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Login username</span>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none">
              <UserIcon />
            </span>
            <input
              value={user.username}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 font-medium"
            />
            <span className="absolute right-3.5 flex items-center pointer-events-none" title="Private username (cannot be edited)">
              <LockIcon />
            </span>
          </div>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">Private account identifier used only for sign-in.</span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Role</span>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none">
              <KeyIcon />
            </span>
            <input
              value={user.role}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-10 py-3 capitalize text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 font-medium"
            />
            <span className="absolute right-3.5 flex items-center pointer-events-none" title="Role assigned by administrator">
              <LockIcon />
            </span>
          </div>
        </label>
      </div>

      {/* Section 2: Public Profile details */}
      <div className="mt-8 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Public profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize how you appear to others on the InteropMed platform.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Public handle</span>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none">
              <AtIcon />
            </span>
            <input
              required
              name="publicHandle"
              defaultValue={user.publicHandle}
              pattern="[a-zA-Z0-9-]+"
              readOnly={publicHandleAvailability.locked}
              className={`w-full rounded-xl border pl-11 pr-10 py-3 outline-none transition font-medium ${
                publicHandleAvailability.locked
                  ? 'border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
                  : 'border-slate-300 bg-white text-slate-950 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500'
              }`}
            />
            {publicHandleAvailability.locked && (
              <span className="absolute right-3.5 flex items-center pointer-events-none" title="Locked for 60 days">
                <LockIcon />
              </span>
            )}
          </div>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            {publicHandleAvailability.locked && publicHandleAvailability.nextDate
              ? `Locked. Can be changed again on ${formatDate(publicHandleAvailability.nextDate)}.`
              : 'Can be changed once every 60 days.'}
          </span>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Display name</span>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none">
              <UserIcon />
            </span>
            <input
              name="displayName"
              defaultValue={user.displayName || ''}
              readOnly={displayNameAvailability.locked}
              className={`w-full rounded-xl border pl-11 pr-10 py-3 outline-none transition font-medium ${
                displayNameAvailability.locked
                  ? 'border-slate-200 bg-slate-50/70 text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400'
                  : 'border-slate-300 bg-white text-slate-950 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500'
              }`}
            />
            {displayNameAvailability.locked && (
              <span className="absolute right-3.5 flex items-center pointer-events-none" title="Locked for 60 days">
                <LockIcon />
              </span>
            )}
          </div>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
            {displayNameAvailability.locked && displayNameAvailability.nextDate
              ? `Locked. Can be changed again on ${formatDate(displayNameAvailability.nextDate)}.`
              : 'Can be changed once every 60 days.'}
          </span>
        </label>

        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Email address</span>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 flex items-center pointer-events-none">
              <MailIcon />
            </span>
            <input
              required
              type="email"
              name="email"
              defaultValue={user.email}
              className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 py-3 text-slate-950 outline-none transition font-medium focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-teal-500"
            />
          </div>
          <span className="mt-1.5 block text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">Used for login verification, notification alerts, and password resets.</span>
        </label>
      </div>

      {/* Save Button */}
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
          {state.status === 'submitting' ? 'Saving changes...' : 'Save settings'}
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

    {/* Identity Lock Confirmation Dialog */}
    {pendingSettings && (
      <div
        className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 px-4 backdrop-blur-sm animate-fade-in"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setPendingSettings(null)
          }
        }}
      >
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="identity-change-title"
          aria-describedby="identity-change-description"
          className="w-full max-w-lg rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-300 scale-100 animate-scale-up"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-500/10 text-amber-500 dark:bg-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <h2 id="identity-change-title" className="text-xl font-bold text-slate-900 dark:text-white">
                Confirm public identity change
              </h2>
              <p id="identity-change-description" className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Once saved, each changed field cannot be changed again for 60 days. Please review it carefully.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {pendingDisplayNameChange && (
              <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Display name</p>
                <p className="mt-1 break-words font-semibold text-slate-900 dark:text-white text-base">{pendingSettings.displayName || 'No display name'}</p>
                <p className="mt-1.5 text-xs text-slate-500">Locked for 60 days after confirmation.</p>
              </div>
            )}
            {pendingPublicHandleChange && (
              <div className="rounded-xl border border-amber-200/50 bg-amber-50/40 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">Public handle and URL</p>
                <p className="mt-1 break-words font-semibold text-slate-900 dark:text-white text-base">@{pendingSettings.publicHandle.toLowerCase()}</p>
                <p className="mt-1.5 break-all text-xs text-slate-500 font-mono bg-amber-500/5 px-2 py-1 rounded w-fit">/people/{pendingSettings.publicHandle.toLowerCase()}</p>
                <p className="mt-2 text-xs text-slate-500">Locked for 60 days after confirmation.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setPendingSettings(null)}
              disabled={state.status === 'submitting'}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/50"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={() => void saveSettings(pendingSettings)}
              disabled={state.status === 'submitting'}
              className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-500 active:scale-[0.98] disabled:opacity-60"
            >
              {state.status === 'submitting' ? 'Saving...' : 'Confirm and lock'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
