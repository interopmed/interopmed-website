'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import AccountLogoutButton from './AccountLogoutButton'

type AccountDashboardLayoutProps = {
  children: ReactNode
}

const accountNav = [
  {
    label: 'Overview',
    items: [
      { href: '/account', label: 'Dashboard', detail: 'Command center', badge: '', icon: 'dashboard' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/account/insights', label: 'Insights', detail: 'Articles', badge: '', icon: 'file' },
      { href: '/account/insights/categories', label: 'Categories', detail: 'Article groups', badge: '', icon: 'folder' },
      { href: '/account/insights/tags', label: 'Tags', detail: 'Article labels', badge: '', icon: 'tags' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/account/messages', label: 'Messages', detail: 'Contact inbox', badge: '', icon: 'message' },
      { href: '/account/users', label: 'Users', detail: 'Access control', badge: 'Admin', icon: 'users' },
    ],
  },
]

const publicAccountPaths = [
  '/account/login',
  '/account/register',
  '/account/reset-password',
]

function isPublicAccountPath(pathname: string) {
  return publicAccountPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function isActive(pathname: string, href: string) {
  if (href === '/account') {
    return pathname === href
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}

function SidebarIcon({ name }: { name: string }) {
  const commonProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: 'h-4 w-4',
    'aria-hidden': true,
  }

  if (name === 'file') {
    return (
      <svg {...commonProps}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h5" />
      </svg>
    )
  }

  if (name === 'tags') {
    return (
      <svg {...commonProps}>
        <path d="M12 2H2v10l8.5 8.5a2.1 2.1 0 0 0 3 0l7-7a2.1 2.1 0 0 0 0-3z" />
        <path d="M7 7h.01" />
      </svg>
    )
  }

  if (name === 'folder') {
    return (
      <svg {...commonProps}>
        <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.2a2 2 0 0 1-1.6-.8L10.4 4A2 2 0 0 0 8.8 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" />
      </svg>
    )
  }

  if (name === 'message') {
    return (
      <svg {...commonProps}>
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    )
  }

  if (name === 'users') {
    return (
      <svg {...commonProps}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

  return (
    <svg {...commonProps}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  )
}

export default function AccountDashboardLayout({ children }: AccountDashboardLayoutProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHeaderProfileOpen, setIsHeaderProfileOpen] = useState(false)

  if (isPublicAccountPath(pathname)) {
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className={`grid min-h-screen transition-[grid-template-columns] duration-300 ${isCollapsed ? 'lg:grid-cols-[84px_minmax(0,1fr)]' : 'lg:grid-cols-[280px_minmax(0,1fr)]'}`}>
        <aside className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
          <div className="flex h-full flex-col">
            <div className={`flex h-16 items-center border-b border-slate-200 dark:border-slate-800 ${isCollapsed ? 'justify-center px-3' : 'gap-3 px-5'}`}>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                IM
              </div>
              <div className={isCollapsed ? 'hidden' : 'min-w-0'}>
                <p className="text-sm font-bold text-slate-950 dark:text-white">InteropMed</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Account Dashboard</p>
              </div>
            </div>

            <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'space-y-3 p-3 pt-4' : 'space-y-6 p-4'}`}>
              <div className={`hidden lg:flex ${isCollapsed ? 'justify-center' : 'justify-end'}`}>
                <button
                  type="button"
                  onClick={() => setIsCollapsed((value) => !value)}
                  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="grid h-8 w-8 place-items-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
                    className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
              </div>

              {accountNav.map((section) => (
                <div key={section.label}>
                  <p className={`mb-2 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 ${isCollapsed ? 'sr-only' : ''}`}>
                    {section.label}
                  </p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = isActive(pathname, item.href)

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={isCollapsed ? item.label : undefined}
                          className={`group flex items-center rounded-md text-sm transition-colors ${
                            isCollapsed ? 'h-10 justify-center px-0 py-0' : 'justify-between px-2 py-2'
                          } ${
                            active
                              ? 'bg-slate-100 text-slate-950 dark:bg-slate-800 dark:text-white'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                          }`}
                        >
                          <span className={isCollapsed ? 'grid h-8 w-8 place-items-center rounded-md text-sm font-bold' : 'flex min-w-0 items-center gap-3'}>
                            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-md text-xs font-semibold transition-colors ${
                              active
                                ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                                : 'text-slate-500 group-hover:text-slate-950 dark:text-slate-500 dark:group-hover:text-white'
                            }`}>
                              <SidebarIcon name={item.icon} />
                            </span>
                            <span className={isCollapsed ? 'sr-only' : 'min-w-0'}>
                              <span className="block truncate font-medium">{item.label}</span>
                              <span className={`mt-0.5 block truncate text-xs ${active ? 'text-slate-500 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                                {item.detail}
                              </span>
                            </span>
                          </span>
                          {item.badge && !isCollapsed && (
                            <span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${active ? 'bg-white text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-slate-200 p-3 dark:border-slate-800">
              <div className={`flex items-center gap-3 rounded-lg px-2 py-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                <div className={`min-w-0 items-center gap-3 ${isCollapsed ? 'hidden' : 'flex'}`}>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    AS
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">Aigars S.</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">Admin</p>
                  </div>
                </div>
                {isCollapsed && (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    AS
                  </div>
                )}
                <AccountLogoutButton variant="sidebar" />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
              <label className="relative block w-full max-w-xl">
                <span className="sr-only">Search account workspace</span>
                <input
                  type="search"
                  placeholder="Search pages, actions, and content..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-950">
                  Ctrl K
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Link
                  href="/account/insights"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200"
                >
                  New insight
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsHeaderProfileOpen((value) => !value)}
                    aria-expanded={isHeaderProfileOpen}
                    aria-haspopup="menu"
                    className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    A
                  </button>

                  {isHeaderProfileOpen && (
                    <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
                      <div className="flex items-center gap-3 rounded-md px-3 py-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                          AS
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">Aigars S.</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">Admin</p>
                        </div>
                      </div>
                      <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                      <Link
                        href="/account"
                        onClick={() => setIsHeaderProfileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/account/users"
                        onClick={() => setIsHeaderProfileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        Account settings
                      </Link>
                      <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                      <AccountLogoutButton variant="menu" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-4 md:px-6 md:py-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
