'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

type ResetRequestState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
  resetUrl: string | null
}

export default function AccountPasswordResetRequestForm() {
  const [state, setState] = useState<ResetRequestState>({
    status: 'idle',
    message: '',
    resetUrl: null,
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting', message: '', resetUrl: null })

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/account/password-reset/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: formData.get('identifier'),
      }),
    })
    const result = await response.json()

    if (!response.ok || !result.success) {
      setState({
        status: 'error',
        message: result.error || 'Could not create password reset link',
        resetUrl: null,
      })
      return
    }

    setState({
      status: 'success',
      message: 'Password reset link created.',
      resetUrl: result.data?.resetUrl || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20 md:p-8"
    >
      <h1 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">Reset password</h1>
      <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
        Enter your username or email to generate a one-time password reset link.
      </p>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Username or email
        </span>
        <input
          required
          type="text"
          name="identifier"
          autoComplete="username"
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state.status === 'submitting' ? 'Generating link...' : 'Generate reset link'}
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

      {state.resetUrl ? (
        <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950 dark:border-teal-900 dark:bg-teal-950/30 dark:text-teal-100">
          <p className="font-semibold">Open your one-time reset link:</p>
          <a
            href={state.resetUrl}
            className="mt-2 block break-all text-teal-700 underline underline-offset-4 dark:text-teal-300"
          >
            {state.resetUrl}
          </a>
        </div>
      ) : null}

      <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
        Remembered it?{' '}
        <Link href="/account/login" className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
          Back to login
        </Link>
      </p>
    </form>
  )
}
