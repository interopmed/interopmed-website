import { cookies } from 'next/headers'
import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import {
  ACCOUNT_SESSION_COOKIE,
  hashAccountSessionToken,
  requireMemberUser,
} from '@/lib/account-auth'
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
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ACCOUNT_SESSION_COOKIE)?.value
  const currentSessionHash = rawToken ? hashAccountSessionToken(rawToken) : null
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
  const currentSession = account.sessions.find((session) => session.sessionTokenHash === currentSessionHash)
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

  const profileDetails = [
    { label: 'Username', value: account.username },
    { label: 'Email', value: account.email },
    { label: 'Role', value: account.role },
    { label: 'Joined', value: formatDate(account.createdAt) },
    { label: 'Last updated', value: formatDateTime(account.updatedAt) },
    { label: 'Last login', value: account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'No login recorded' },
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

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-5">
              <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="h-36 bg-[linear-gradient(135deg,#0f172a_0%,#115e59_48%,#0f766e_100%)] dark:bg-[linear-gradient(135deg,#020617_0%,#134e4a_52%,#0f172a_100%)]" aria-hidden="true" />
                <div className="px-5 pb-5 md:px-6">
                  <div className="-mt-14 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                      <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-4 border-white bg-slate-950 text-4xl font-bold text-white shadow-sm dark:border-slate-900 dark:bg-white dark:text-slate-950">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 sm:pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="truncate text-3xl font-bold text-white md:text-4xl">{displayName}</h1>
                          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                            account.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-2 max-w-2xl text-base font-semibold text-slate-700 dark:text-slate-200">
                          Interoperability implementation member
                        </p>
                        <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">{account.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/user/settings" className="inline-flex w-fit rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                        Edit profile
                      </Link>
                      <Link href="/user/support" className="inline-flex w-fit rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                        Message support
                      </Link>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
                    {[
                      { label: 'Profile strength', value: `${profileCompletion}%`, detail: 'Ready for collaboration' },
                      { label: 'Authored insights', value: articles.length, detail: 'Published or drafted work' },
                      { label: 'Open requests', value: openSupportCount, detail: 'Support conversations' },
                      { label: 'Active sessions', value: activeSessions.length, detail: 'Current access points' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                        <p className="mt-2 text-2xl font-bold">{item.value}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">About</p>
                    <h2 className="mt-2 text-2xl font-bold">Professional summary</h2>
                  </div>
                  <Link href="/user/settings" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    Update summary
                  </Link>
                </div>
                <p className="mt-5 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {displayName} uses this account to coordinate implementation support, standards documentation, security review, and authored interoperability insights across the InteropMed workspace.
                </p>
                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">Primary contact</p>
                    <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{account.email}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">Joined</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatDate(account.createdAt)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm font-bold text-slate-950 dark:text-white">Last login</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'No login recorded'}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Expertise</p>
                    <h2 className="mt-2 text-2xl font-bold">Interoperability focus areas</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      The profile links account activity to implementation resources used across clinical data exchange workflows.
                    </p>
                  </div>
                  <Link href="/implementation" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    Implementation
                  </Link>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {interoperabilityProfile.map((item) => (
                    <Link key={item.href} href={item.href} className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500 dark:hover:bg-slate-900">
                      <span className="block text-sm font-bold text-slate-950 dark:text-white">{item.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</span>
                      <span className="mt-3 block text-sm font-semibold text-teal-700 group-hover:text-teal-800 dark:text-teal-300 dark:group-hover:text-teal-200">
                        Open resource
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Activity</p>
                    <h2 className="mt-2 text-2xl font-bold">Authored insights</h2>
                  </div>
                  <Link href="/studio" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    Open Studio
                  </Link>
                </div>
                <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {articles.map((article) => (
                    <article key={article.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-950 dark:text-white">{article.title}</h3>
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${statusClassName(article.status)}`}>
                            {article.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          {article.type} - {article.category} - Updated {formatDateTime(article.updatedAt)}
                        </p>
                      </div>
                      <Link href={`/insights/${article.slug}`} className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
                        View insight
                      </Link>
                    </article>
                  ))}
                  {articles.length === 0 && (
                    <div className="p-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      No authored insights are linked to this member account yet.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Profile strength</p>
                  <p className="text-sm font-bold text-teal-700 dark:text-teal-300">{profileCompletion}%</p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-teal-600" style={{ width: `${profileCompletion}%` }} />
                </div>
                <div className="mt-5 space-y-3">
                  {profileChecks.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">{item.label}</span>
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

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Contact information</p>
                <div className="mt-5 space-y-4">
                  {profileDetails.map((detail) => (
                    <div key={detail.label}>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{detail.label}</p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">{detail.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Security</p>
                <h2 className="mt-2 text-xl font-bold">Current access</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {currentSession
                    ? `This browser session expires ${formatDateTime(currentSession.expiresAt)}.`
                    : 'The current session is authenticated.'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {activeSessions.length} active session{activeSessions.length === 1 ? '' : 's'} are recorded.
                </p>
                <Link href="/user/security" className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                  Manage security
                </Link>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Support</p>
                    <h2 className="mt-2 text-xl font-bold">Recent requests</h2>
                  </div>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {interoperabilitySupportCount} focused
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {supportRequests.slice(0, 3).map((request) => (
                    <div key={request.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-slate-950 dark:text-white">{request.topic}</p>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${statusClassName(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{request.message}</p>
                    </div>
                  ))}
                  {supportRequests.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      No support requests are linked to this profile yet.
                    </div>
                  )}
                </div>
                <Link href="/user/support" className="mt-5 inline-flex rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Open support
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </section>
    </main>
  )
}
