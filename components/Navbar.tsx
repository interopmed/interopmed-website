'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type AccountSessionUser = {
  id: string
  username: string
  email: string
  displayName: string | null
  role: string
}

const navItems = [
  { href: '/workflows', label: 'Workflows' },
  { href: '/learn', label: 'Learn' },
  { href: '/knowledge', label: 'Knowledge' },
  { href: '/tools', label: 'Tools' },
  { href: '/interopmind', label: 'InteropMind' },
  { href: '/ai-services', label: 'AI Services' },
  { href: '/documentation', label: 'Standards' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountUser, setAccountUser] = useState<AccountSessionUser | null>(null)
  const [isSessionLoaded, setIsSessionLoaded] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const response = await fetch('/api/account/session')
        const payload = await response.json()

        if (isMounted) {
          setAccountUser(payload?.data?.user ?? null)
        }
      } catch {
        if (isMounted) {
          setAccountUser(null)
        }
      } finally {
        if (isMounted) {
          setIsSessionLoaded(true)
        }
      }
    }

    loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    await fetch('/api/account/logout', { method: 'POST' })
    setAccountUser(null)
    window.location.assign('/account/login')
  }

  const hasAccountSession = isSessionLoaded && accountUser
  const accountHref = accountUser?.role === 'admin' ? '/account' : '/user'
  const accountLabel = accountUser?.role === 'admin' ? 'Admin' : 'Account'
  const authAction = hasAccountSession ? (
    <>
      <Link href={accountHref} className="text-sm font-semibold text-slate-700 transition-colors hover:text-teal-600 dark:text-slate-300 dark:hover:text-teal-400">
        {accountLabel}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
      >
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    </>
  ) : (
    <Link href="/account/login" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300">
      Login
    </Link>
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IM</span>
          </div>
          <span className="font-semibold text-slate-900 dark:text-white text-lg">InteropMed</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {item.label}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          {authAction}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-700 dark:text-slate-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div className="px-6 py-4 space-y-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400">
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
              {hasAccountSession ? (
                <>
                  <Link href={accountHref} className="block text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400">
                    {accountLabel}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full rounded-lg border border-slate-300 px-6 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:text-slate-200"
                  >
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </>
              ) : (
                <Link href="/account/login" className="block w-full rounded-lg border border-slate-300 px-6 py-2 text-center text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
