'use client'

import { useState } from 'react'

type AccountLogoutButtonProps = {
  variant?: 'button' | 'sidebar' | 'menu'
  redirectTo?: string
}

export default function AccountLogoutButton({ variant = 'button', redirectTo = '/account/login' }: AccountLogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    await fetch('/api/account/logout', { method: 'POST' })
    window.location.assign(redirectTo)
  }

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        aria-label={isLoggingOut ? 'Signing out' : 'Sign out'}
        title={isLoggingOut ? 'Signing out' : 'Sign out'}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-70 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
      </button>
    )
  }

  if (variant === 'menu') {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-70 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        </svg>
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
    >
      {isLoggingOut ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
