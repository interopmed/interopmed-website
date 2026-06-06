'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import AccountLogoutButton from './AccountLogoutButton'

const publicUserPaths = ['/user/login']

function isPublicUserPath(pathname: string) {
  return publicUserPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function UserAccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  if (isPublicUserPath(pathname)) {
    return (
      <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
        <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
              IM
            </span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">InteropMed</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
            Back to site
          </Link>
        </header>
        {children}
      </div>
    )
  }

  const navItems = [
    { href: '/user', label: 'Dashboard' },
    { href: '/user/settings', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="grid min-h-screen lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:border-b-0 lg:border-r">
          <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
              IM
            </span>
            <div>
              <p className="text-sm font-bold">InteropMed</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">User Account</p>
            </div>
          </div>
          <nav className="space-y-2 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-md px-3 py-2 text-sm font-semibold transition ${
                  isActive(pathname, item.href)
                    ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-200 p-4 dark:border-slate-800">
            <AccountLogoutButton redirectTo="/account/login" />
          </div>
        </aside>
        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Member workspace</p>
              <Link href="/account/login" className="text-sm font-semibold text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Login
              </Link>
            </div>
          </header>
          <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
