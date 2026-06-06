'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'

type SecurityState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export default function AccountSecurityForm() {
  const router = useRouter()
  const [state, setState] = useState<SecurityState>({ status: 'idle', message: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const newPassword = String(formData.get('newPassword') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (newPassword !== confirmPassword) {
      setState({ status: 'error', message: 'New passwords do not match.' })
      return
    }

    setState({ status: 'submitting', message: 'Updating password...' })

    const response = await fetch('/api/account/security/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: formData.get('currentPassword'),
        newPassword,
        signOutOtherSessions: formData.get('signOutOtherSessions') === 'on',
      }),
    })

    const result = await response.json().catch(() => ({
      success: false,
      error: 'The security endpoint returned an unreadable response.',
    }))

    if (!response.ok || !result.success) {
      setState({ status: 'error', message: result.error || 'Failed to update password.' })
      return
    }

    form.reset()
    const revokedSessions = Number(result.data?.revokedSessions || 0)
    setState({
      status: 'success',
      message: revokedSessions > 0
        ? `Password updated. ${revokedSessions} other session${revokedSessions === 1 ? '' : 's'} signed out.`
        : 'Password updated.',
    })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Password</p>
      <h2 className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">Change password</h2>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Current password</span>
          <input
            required
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">New password</span>
          <input
            required
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Confirm password</span>
          <input
            required
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
        </label>
      </div>
      <label className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <input
          type="checkbox"
          name="signOutOtherSessions"
          className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
        />
        <span>
          <span className="block text-sm font-semibold text-slate-950 dark:text-white">Sign out other sessions</span>
          <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">
            Keep this browser signed in and revoke sessions opened elsewhere.
          </span>
        </span>
      </label>
      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
      >
        {state.status === 'submitting' ? 'Updating...' : 'Update password'}
      </button>
      {state.message && (
        <p className={`mt-4 text-sm ${state.status === 'error' ? 'text-red-600 dark:text-red-400' : 'text-teal-700 dark:text-teal-300'}`}>
          {state.message}
        </p>
      )}
    </form>
  )
}
