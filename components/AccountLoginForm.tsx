'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'

type LoginState = {
  status: 'idle' | 'submitting' | 'error'
  message: string
}

type AccountLoginFormProps = {
  redirectTo?: string
  title?: string
  description?: string
  registerHref?: string | null
}

export default function AccountLoginForm({
  redirectTo = '/account',
  title = 'Account login',
  description = 'Sign in with your InteropMed account. Admins go to the admin dashboard, and members go to their user account.',
  registerHref = '/account/register',
}: AccountLoginFormProps) {
  const [state, setState] = useState<LoginState>({ status: 'idle', message: '' })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const identifier = String(formData.get('identifier') || '').trim()
    const password = String(formData.get('password') || '')

    if (!identifier) {
      setState({
        status: 'error',
        message: 'Please enter your username or email',
      })
      return
    }

    if (!password) {
      setState({
        status: 'error',
        message: 'Please enter your password',
      })
      return
    }

    setState({ status: 'submitting', message: '' })

    try {
      const response = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier,
          password,
        }),
      })

      const result = await response.json().catch(() => ({
        success: false,
        error: 'The login endpoint returned an unreadable response.',
      }))

      if (!response.ok || !result.success) {
        setState({
          status: 'error',
          message: result.error || 'Login failed',
        })
        return
      }

      const role = String(result.data?.user?.role || '')
      const roleHome = String(result.data?.redirectTo || (role === 'admin' ? '/account' : '/user'))
      const isSafeRedirect =
        redirectTo &&
        redirectTo !== '/studio' &&
        !redirectTo.startsWith('/studio') &&
        !redirectTo.includes('127.0.0.1') &&
        !redirectTo.includes('localhost') &&
        (
          (role === 'admin' && redirectTo.startsWith('/account')) ||
          (role !== 'admin' && redirectTo.startsWith('/user')) ||
          redirectTo.startsWith('/stream') ||
          redirectTo.startsWith('/interopmind') ||
          redirectTo.startsWith('/tools') ||
          redirectTo.startsWith('/articles') ||
          redirectTo.startsWith('/community')
        )

      const nextPath = isSafeRedirect ? redirectTo : roleHome

      window.location.assign(nextPath)
    } catch (error) {
      setState({
        status: 'error',
        message:
          error instanceof Error
            ? `Could not reach the login endpoint: ${error.message}`
            : 'Could not reach the login endpoint.',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950 dark:shadow-black/20 md:p-8">
      <h1 className="mb-3 text-3xl font-bold text-slate-950 dark:text-white">{title}</h1>
      <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {description}
      </p>

      <div
        aria-live="polite"
        role={state.status === 'error' ? 'alert' : 'status'}
        className={
          state.status === 'error'
            ? 'mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            : state.status === 'submitting'
              ? 'mb-5 rounded-lg border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
              : 'mb-5 hidden'
        }
      >
        {state.status === 'submitting' ? 'Signing in...' : state.message}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">
          Username or email
        </span>
        <input
          type="text"
          name="identifier"
          autoComplete="username"
          aria-invalid={state.status === 'error' && state.message.toLowerCase().includes('username') ? 'true' : 'false'}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          aria-invalid={state.status === 'error' && state.message.toLowerCase().includes('password') ? 'true' : 'false'}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </label>

      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 w-full rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state.status === 'submitting' ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        Forgot your password?{' '}
        <Link href="/account/reset-password" className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
          Reset it
        </Link>
      </p>

      {registerHref && (
        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Need an account?{' '}
          <Link href={registerHref} className="font-semibold text-teal-700 hover:text-teal-600 dark:text-teal-300 dark:hover:text-teal-200">
            Register
          </Link>
        </p>
      )}
    </form>
  )
}
