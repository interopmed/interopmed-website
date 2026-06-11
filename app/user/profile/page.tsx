import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import ProfessionalSocialMedia from '@/components/ProfessionalSocialMedia'
import ProfileAIChat from '@/components/ProfileAIChat'
import { requireMemberUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Profile | InteropMed',
  description: 'View your InteropMed user profile.',
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(value)
}

function statusClassName(status: string) {
  if (status === 'published' || status === 'responded') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
  }

  if (status === 'reviewed') {
    return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
  }

  if (status === 'archived') {
    return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  }

  return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
}

export default async function UserProfilePage() {
  const user = await requireMemberUser('/user/profile')
  const now = new Date()

  const [account, preferences, supportRequests, articles] = await Promise.all([
    prisma.authUser.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            sessionTokenHash: true,
            createdAt: true,
            expiresAt: true,
          },
        },
      },
    }),
    prisma.authNotificationPreference.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
      select: {
        accountUpdates: true,
        productNotes: true,
        supportReplies: true,
        securityAlerts: true,
        weeklyDigest: true,
        updatedAt: true,
      },
    }),
    prisma.contactMessage.findMany({
      where: {
        email: user.email,
        source: 'user_support_page',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        topic: true,
        status: true,
        message: true,
        createdAt: true,
      },
    }),
    prisma.article.findMany({
      where: { accountAuthorId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        category: true,
        status: true,
        updatedAt: true,
      },
    }),
  ])

  if (!account) {
    return null
  }

  const displayName = account.displayName || account.username
  const activeSessions = account.sessions.filter((session) => session.expiresAt > now)
  const enabledNotificationCount = [
    preferences.accountUpdates,
    preferences.productNotes,
    preferences.supportReplies,
    preferences.securityAlerts,
    preferences.weeklyDigest,
  ].filter(Boolean).length
  const interoperabilitySupportCount = supportRequests.filter((request) =>
    request.topic.toLowerCase().includes('fhir') ||
    request.topic.toLowerCase().includes('hl7') ||
    request.message.toLowerCase().includes('fhir') ||
    request.message.toLowerCase().includes('hl7')
  ).length
  const openSupportCount = supportRequests.filter((request) => request.status === 'new' || request.status === 'reviewed').length
  const profileChecks = [
    { label: 'Display name', done: Boolean(account.displayName), value: account.displayName || 'Missing' },
    { label: 'Email', done: Boolean(account.email), value: account.email },
    { label: 'Active access', done: account.isActive, value: account.isActive ? 'Enabled' : 'Disabled' },
    { label: 'Standards alerts', done: enabledNotificationCount >= 3, value: `${enabledNotificationCount}/5 enabled` },
    { label: 'Security history', done: account.sessions.length > 0, value: `${account.sessions.length} recent session${account.sessions.length === 1 ? '' : 's'}` },
  ]
  const profileCompletion = Math.round((profileChecks.filter((item) => item.done).length / profileChecks.length) * 100)

  const sidebarHighlights = [
    { label: 'Member since', value: formatDate(account.createdAt) },
    { label: 'Last active', value: account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'No login recorded' },
    { label: 'Notifications', value: `${enabledNotificationCount}/5 enabled` },
  ]

  const interoperabilityProfile = [
    {
      label: 'Resources',
      detail: 'Resource modeling, validation, profiles, and implementation guide review.',
      href: '/documentation/fhir-implementation',
    },
    {
      label: 'Messages',
      detail: 'ADT, ORM, ORU, interface migration, and message intake support.',
      href: '/documentation/getting-started',
    },
    {
      label: 'Service contracts',
      detail: 'Patient, record, taxonomy, insight, and account workflow endpoints.',
      href: '/api-reference',
    },
    {
      label: 'Compliance',
      detail: 'Security, privacy, access, and operational trust posture.',
      href: '/compliance',
    },
  ]

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Profile' }]} />

          <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)_340px]">
            {/* Left Sidebar - Profile Card */}
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start xl:order-first">
              {/* Profile Card - LinkedIn Style */}
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="h-20 bg-[linear-gradient(135deg,#0f172a_0%,#0f766e_100%)]" aria-hidden="true" />
                <div className="px-5 pb-5 text-center">
                  <div className="mx-auto -mt-10 grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-slate-950 text-2xl font-bold text-white shadow-sm dark:border-slate-900 dark:bg-white dark:text-slate-950">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <h2 className="mt-3 truncate text-lg font-bold text-slate-950 dark:text-white">{displayName}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">Implementation Member</p>
                  <p className="mt-1 break-words text-xs text-slate-500 dark:text-slate-400">{account.email}</p>
                  
                  <div className="mt-4 grid grid-cols-3 gap-2 border-y border-slate-200 py-3 dark:border-slate-800">
                    <div>
                      <p className="text-base font-bold text-slate-950 dark:text-white">{profileCompletion}%</p>
                      <p className="text-[11px] font-semibold text-slate-400">Profile</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-950 dark:text-white">{articles.length}</p>
                      <p className="text-[11px] font-semibold text-slate-400">Posts</p>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-950 dark:text-white">{activeSessions.length}</p>
                      <p className="text-[11px] font-semibold text-slate-400">Sessions</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid gap-2">
                    <Link href="/user/settings" className="inline-flex justify-center rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:hover:bg-teal-500">
                      Edit profile
                    </Link>
                    <Link href="/user/settings" className="inline-flex justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      Connect
                    </Link>
                  </div>
                </div>
              </section>

              {/* Professional Social Media */}
              <ProfessionalSocialMedia displayName={displayName} profiles={[]} />

              {/* Profile Completeness */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Profile completeness</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-teal-600" style={{ width: `${profileCompletion}%` }} />
                </div>
                <div className="mt-5 space-y-3">
                  {profileChecks.slice(0, 4).map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950">
                      <span className="min-w-0 truncate font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                        item.done
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                      }`}>
                        {item.done ? 'Ready' : 'Needed'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Interests */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Interests</p>
                <h2 className="mt-2 text-xl font-bold">Clinical Focus</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {interoperabilityProfile.slice(0, 2).map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            </aside>

            {/* Center - Main Feed */}
            <div className="space-y-5 xl:order-2">
              {/* Professional Summary */}
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">About</p>
                  <h2 className="mt-2 text-2xl font-bold">Professional summary</h2>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {displayName} coordinates implementation support, standards documentation, security review, and authored interoperability insights across the InteropMed workspace. Member since {formatDate(account.createdAt)}.
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Primary contact</p>
                    <p className="mt-2 break-words text-sm font-semibold text-slate-950 dark:text-white">{account.email}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Active since</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{formatDate(account.createdAt)}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Activity</p>
                    <h2 className="mt-2 text-2xl font-bold">Posts & Insights</h2>
                  </div>
                  <Link href="/studio" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    Write post
                  </Link>
                </div>
                <div className="mt-6 space-y-4">
                  {articles.map((article) => (
                    <article key={article.id} className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-teal-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex gap-3 flex-1 min-w-0">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                            {displayName.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-950 dark:text-white">{displayName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(article.updatedAt)}</p>
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${statusClassName(article.status)}`}>
                          {article.status}
                        </span>
                      </div>
                      <h3 className="mt-3 font-bold text-slate-950 dark:text-white">{article.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {article.type} • {article.category}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <div className="flex gap-4">
                          <button className="flex items-center gap-1 transition hover:text-teal-600 dark:hover:text-teal-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2 1m2-1L12 3m2 1v2.5" />
                            </svg>
                            Like
                          </button>
                          <button className="flex items-center gap-1 transition hover:text-teal-600 dark:hover:text-teal-400">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Comment
                          </button>
                        </div>
                        <Link href={`/insights/${article.slug}`} className="font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
                          View
                        </Link>
                      </div>
                    </article>
                  ))}
                  {articles.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-950">
                      <p className="text-sm text-slate-600 dark:text-slate-300">No posts yet. Start by creating an insight!</p>
                      <Link href="/studio" className="mt-3 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                        Create first post
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Right Sidebar - Stats & Trust */}
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start xl:order-last">
              {/* Overview Stats */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Overview</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">CONNECTIONS</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">24</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Growing network</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">PROFILE VIEWS</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">142</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Last 90 days</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-950">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">ENGAGEMENT</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{supportRequests.length}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Support interactions</p>
                  </div>
                </div>
              </section>

              {/* Trust Status */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Trust status</p>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600 dark:text-slate-300">Account status</span>
                    <span className={`rounded-md px-2 py-1 text-xs font-semibold ${account.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {sidebarHighlights.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-3">
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
                      <span className="max-w-[170px] text-right text-sm font-semibold text-slate-950 dark:text-white">{item.value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/user/security" className="mt-5 inline-flex w-full justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Security settings
                </Link>
              </section>

              {/* Care Team Support */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Support</p>
                    <h2 className="mt-2 text-lg font-bold">Recent help</h2>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {interoperabilitySupportCount} focused
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  {supportRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 truncate text-xs font-semibold text-slate-950 dark:text-white">{request.topic}</p>
                        <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold capitalize ${statusClassName(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">{request.message}</p>
                    </div>
                  ))}
                </div>
                <Link href="/user/support" className="mt-4 inline-flex w-full justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  View all requests
                </Link>
              </section>

              {/* Expertise */}
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Expertise</p>
                <h2 className="mt-2 text-lg font-bold">Focus areas</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  {interoperabilityProfile.slice(0, 4).map((item) => (
                    <Link key={item.href} href={item.href} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </section>

      {/* AI Chat Widget */}
      <ProfileAIChat />
    </main>
  )
}
