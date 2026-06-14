'use client'

import { FormEvent, useState } from 'react'

type CreateUserState = {
  status: 'idle' | 'submitting' | 'success' | 'error'
  message: string
}

const initialState: CreateUserState = {
  status: 'idle',
  message: '',
}

export default function AccountUserCreateForm() {
  const [state, setState] = useState<CreateUserState>(initialState)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState({ status: 'submitting', message: '' })

    const formData = new FormData(event.currentTarget)
    const response = await fetch('/api/account/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.get('username'),
        publicHandle: formData.get('publicHandle'),
        email: formData.get('email'),
        displayName: formData.get('displayName'),
        password: formData.get('password'),
        role: formData.get('role'),
      }),
    })
    const result = await response.json()

    if (!response.ok || !result.success) {
      setState({
        status: 'error',
        message: result.error || 'Could not create user',
      })
      return
    }

    event.currentTarget.reset()
    setState({
      status: 'success',
      message: `Created ${result.data.user.username}. Refresh to see the new account.`,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950"
    >
      <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">Create account user</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Username</span>
          <input
            required
            name="username"
            autoComplete="username"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Public handle</span>
          <input
            required
            name="publicHandle"
            pattern="[a-zA-Z0-9-]+"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Email</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Display name</span>
          <input
            name="displayName"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Password</span>
          <input
            required
            type="password"
            name="password"
            autoComplete="new-password"
            minLength={8}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-slate-800 dark:text-slate-100">Account system</span>
          <select
            name="role"
            defaultValue="member"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          >
            <option value="member">Member / user account</option>
            <option value="admin">Admin account</option>
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={state.status === 'submitting'}
        className="mt-6 rounded-lg bg-gradient-to-r from-teal-500 to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-teal-500/25 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state.status === 'submitting' ? 'Creating...' : 'Create user'}
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
    </form>
  )
}
