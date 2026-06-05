'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

type ResetConfirmState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

export default function AccountPasswordResetConfirmForm({ token }: { token: string }) {
  const [state, setState] = useState<ResetConfirmState>({
    status: 'idle',
    message: '',
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting', message: '' })

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      setState({
        status: 'error',
        message: 'Passwords do not match',
      })
      return
    }

    const response = await fetch('/api/account/password-reset/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        password,
      }),
    })
    const result = await response.json()

    if (!response.ok || !result.success) {
      setState({
        status: 'error',
        message: result.error || 'Could not reset password',
      })
      return
    }

    setState({
      status: 'success',
      message: 'Password updated. Redirecting to login...',
    })
    window.setTimeout(() => {
      window.location.assign('/account/login')
    }, 1200)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20 md:p-8"
    >
      <h1 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">Choose a new password</h1>
      <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
        This reset link can be used once. Pick a new password with at least 8 characters.
      </p>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">New password</span>
        <input
          required
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Confirm password</span>
        <input
          required
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          minLength={8}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <button
        type="submit"
        disabled={state.status === 'submitting' || state.status === 'success'}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state.status === 'submitting' ? 'Updating password...' : 'Update password'}
      </button>

      {state.message ? (
        <p
          className={`mt-4 text-sm ${
            state.status === 'success'
              ? 'text-teal-700 dark:text-teal-300'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        Need to go back?{' '}
        <Link href="/account/login" className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
          Return to login
        </Link>
      </p>
    </form>
  )
}
