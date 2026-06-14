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
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Login username</span>
          <input
            value={user.username}
            disabled
            className="w-full rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
          />
          <span className="mt-1 block text-xs text-slate-500">Private account identifier used only for sign-in.</span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Public handle</span>
          <input
            required
            name="publicHandle"
            defaultValue={user.publicHandle}
            pattern="[a-zA-Z0-9-]+"
            readOnly={publicHandleAvailability.locked}
            className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
              publicHandleAvailability.locked
                ? 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                : 'border-slate-300 bg-white text-slate-950 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            }`}
          />
          <span className="mt-1 block text-xs text-slate-500">
            {publicHandleAvailability.locked && publicHandleAvailability.nextDate
              ? `Can be changed again on ${formatDate(publicHandleAvailability.nextDate)}.`
              : 'Can be changed once every 60 days.'}
          </span>
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
            readOnly={displayNameAvailability.locked}
            className={`w-full rounded-lg border px-4 py-3 outline-none transition ${
              displayNameAvailability.locked
                ? 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
                : 'border-slate-300 bg-white text-slate-950 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white'
            }`}
          />
          <span className="mt-1 block text-xs text-slate-500">
            {displayNameAvailability.locked && displayNameAvailability.nextDate
              ? `Can be changed again on ${formatDate(displayNameAvailability.nextDate)}.`
              : 'Can be changed once every 60 days.'}
          </span>
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

    {pendingSettings && (
      <div
        className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/65 px-4 backdrop-blur-sm"
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
          className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-100 text-xl font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              !
            </div>
            <div>
              <h2 id="identity-change-title" className="text-xl font-bold text-slate-950 dark:text-white">
                Confirm public identity change
              </h2>
              <p id="identity-change-description" className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Once saved, each changed field cannot be changed again for 60 days. Please review it carefully.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {pendingDisplayNameChange && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Display name</p>
                <p className="mt-1 break-words font-semibold text-slate-950 dark:text-white">{pendingSettings.displayName || 'No display name'}</p>
                <p className="mt-1 text-xs text-slate-500">Locked for 60 days after confirmation.</p>
              </div>
            )}
            {pendingPublicHandleChange && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Public handle and URL</p>
                <p className="mt-1 break-words font-semibold text-slate-950 dark:text-white">@{pendingSettings.publicHandle.toLowerCase()}</p>
                <p className="mt-1 break-all text-xs text-slate-500">/people/{pendingSettings.publicHandle.toLowerCase()}</p>
                <p className="mt-1 text-xs text-slate-500">Locked for 60 days after confirmation.</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setPendingSettings(null)}
              disabled={state.status === 'submitting'}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Go back
            </button>
            <button
              type="button"
              onClick={() => void saveSettings(pendingSettings)}
              disabled={state.status === 'submitting'}
              className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:opacity-60"
            >
              {state.status === 'submitting' ? 'Saving...' : 'Confirm and lock for 60 days'}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
