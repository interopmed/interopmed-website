'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import AccountLogoutButton from './AccountLogoutButton'

const publicUserPaths = ['/user/login']

type UserAccountLayoutUser = {
  username: string
  email: string
  displayName: string | null
  role: string
} | null

type UserAccountLayoutProps = {
  children: ReactNode
  user: UserAccountLayoutUser
}

const userNav = [
  {
    label: 'Overview',
    items: [
      { href: '/user', label: 'Dashboard', detail: 'Member home', badge: '', icon: 'dashboard' },
      { href: '/user/activity', label: 'Activity', detail: 'Recent account events', badge: '', icon: 'activity' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/user/profile', label: 'Profile', detail: 'Identity details', badge: '', icon: 'user' },
      { href: '/user/settings', label: 'Settings', detail: 'Account preferences', badge: '', icon: 'settings' },
      { href: '/user/security', label: 'Security', detail: 'Password and access', badge: '', icon: 'shield' },
      { href: '/user/notifications', label: 'Notifications', detail: 'Email preferences', badge: '', icon: 'bell' },
    ],
  },
  {
    label: 'Help',
    items: [
      { href: '/user/support', label: 'Support', detail: 'Help and requests', badge: '', icon: 'help' },
    ],
  },
]

const searchableItems = userNav.flatMap((section) =>
  section.items.map((item) => ({
    ...item,
    section: section.label,
    keywords: `${section.label} ${item.label} ${item.detail}`.toLowerCase(),
  }))
)

function isPublicUserPath(pathname: string) {
  return publicUserPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function isActive(pathname: string, href: string) {
  if (href === '/user') {
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

  if (name === 'settings') {
    return (
      <svg {...commonProps}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.72l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }

  if (name === 'activity') {
    return (
      <svg {...commonProps}>
        <path d="M3 12h4l3 8 4-16 3 8h4" />
      </svg>
    )
  }

  if (name === 'user') {
    return (
      <svg {...commonProps}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }

  if (name === 'shield') {
    return (
      <svg {...commonProps}>
        <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
  }

  if (name === 'bell') {
    return (
      <svg {...commonProps}>
        <path d="M10.3 21a2 2 0 0 0 3.4 0" />
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      </svg>
    )
  }

  if (name === 'help') {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.1 9a3 3 0 1 1 5.8 1c-.4 1.3-1.9 1.8-2.5 2.8" />
        <path d="M12 17h.01" />
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

export default function UserAccountLayout({ children, user }: UserAccountLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHeaderProfileOpen, setIsHeaderProfileOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const displayName = user?.displayName || user?.username || 'Member'
  const userEmail = user?.email || 'User'
  const userInitial = displayName.slice(0, 1).toUpperCase()
  const filteredItems = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase()

    if (!normalizedTerm) {
      return searchableItems
    }

    return searchableItems.filter((item) => item.keywords.includes(normalizedTerm))
  }, [searchTerm])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isSearchShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'

      if (isSearchShortcut) {
        event.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchOpen(true)
      }

      if (event.key === 'Escape') {
        setIsSearchOpen(false)
        searchInputRef.current?.blur()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextItem = filteredItems[0]

    if (!nextItem) {
      return
    }

    setIsSearchOpen(false)
    setSearchTerm('')
    router.push(nextItem.href)
  }

  function openSearchResult(href: string) {
    setIsSearchOpen(false)
    setSearchTerm('')
    router.push(href)
  }

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
                <p className="text-xs text-slate-500 dark:text-slate-400">User Account</p>
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

              {userNav.map((section) => (
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
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{displayName}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                  </div>
                </div>
                {isCollapsed && (
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                    {userInitial}
                  </div>
                )}
                <AccountLogoutButton variant="sidebar" redirectTo="/user/login" />
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
              <form onSubmit={handleSearchSubmit} className="relative block w-full max-w-xl">
                <span className="sr-only">Search user workspace</span>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setIsSearchOpen(true)
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  placeholder="Search pages and account actions..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 pr-16 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:focus:bg-slate-950"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-semibold text-slate-400 dark:border-slate-700 dark:bg-slate-950">
                  Ctrl K
                </span>
                {isSearchOpen && (
                  <div className="absolute left-0 right-0 top-full z-40 mt-2 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
                    {filteredItems.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => openSearchResult(item.href)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-300">
                          <SidebarIcon name={item.icon} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-slate-950 dark:text-white">{item.label}</span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{item.section} - {item.detail}</span>
                        </span>
                      </button>
                    ))}
                    {filteredItems.length === 0 && (
                      <div className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                        No account pages match that search.
                      </div>
                    )}
                  </div>
                )}
              </form>
              <div className="flex items-center gap-2">
                <Link
                  href="/user/notifications"
                  aria-label="Notification preferences"
                  title="Notification preferences"
                  className={`relative grid h-10 w-10 place-items-center rounded-lg border transition ${
                    isActive(pathname, '/user/notifications')
                      ? 'border-slate-200 bg-white text-slate-950 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <SidebarIcon name="bell" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsHeaderProfileOpen((value) => !value)}
                    aria-expanded={isHeaderProfileOpen}
                    aria-haspopup="menu"
                    className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 transition hover:bg-white hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    {userInitial}
                  </button>

                  {isHeaderProfileOpen && (
                    <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30">
                      <div className="flex items-center gap-3 rounded-md px-3 py-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
                          {userInitial}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{displayName}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                        </div>
                      </div>
                      <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                      <Link
                        href="/user"
                        onClick={() => setIsHeaderProfileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/user/settings"
                        onClick={() => setIsHeaderProfileOpen(false)}
                        className="block rounded-md px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                      >
                        Account settings
                      </Link>
                      <div className="my-1 border-t border-slate-200 dark:border-slate-800" />
                      <AccountLogoutButton variant="menu" redirectTo="/user/login" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
      </div>
    </div>
  )
}
