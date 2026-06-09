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
  title: 'User Account | InteropMed',
  description: 'InteropMed user account dashboard.',
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function formatRelative(value: Date) {
  const diffMs = Date.now() - value.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))

  if (diffMinutes < 1) {
    return 'Just now'
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours} hr ago`
  }

  const diffDays = Math.floor(diffHours / 24)

  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  return formatDateTime(value)
}

function statusTone(status: string) {
  if (status === 'responded') {
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

export default async function UserAccountPage() {
  const user = await requireMemberUser('/user')
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ACCOUNT_SESSION_COOKIE)?.value
  const currentSessionHash = rawToken ? hashAccountSessionToken(rawToken) : null
  const now = new Date()

  const [account, preferences, supportRequests, authoredArticleCount] = await Promise.all([
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
        passwordResetTokens: {
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
            usedAt: true,
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
      take: 3,
      select: {
        id: true,
        topic: true,
        status: true,
        message: true,
        createdAt: true,
      },
    }),
    prisma.article.count({
      where: { accountAuthorId: user.id },
    }),
  ])

  if (!account) {
    return null
  }

  const displayName = account.displayName || account.username
  const activeSessions = account.sessions.filter((session) => session.expiresAt > now)
  const otherActiveSessions = activeSessions.filter((session) => session.sessionTokenHash !== currentSessionHash)
  const currentSession = account.sessions.find((session) => session.sessionTokenHash === currentSessionHash)
  const enabledNotificationCount = [
    preferences.accountUpdates,
    preferences.productNotes,
    preferences.supportReplies,
    preferences.securityAlerts,
    preferences.weeklyDigest,
  ].filter(Boolean).length
  const openSupportCount = supportRequests.filter((request) => request.status === 'new' || request.status === 'reviewed').length
  const profileChecks = [
    Boolean(account.displayName),
    Boolean(account.email),
    account.isActive,
    enabledNotificationCount >= 3,
  ]
  const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100)
  const latestResetToken = account.passwordResetTokens[0]

  const activity = [
    ...(account.lastLoginAt
      ? [{
          id: 'last-login',
          label: 'Login',
          title: 'Successful sign-in',
          detail: `${displayName} opened the member workspace.`,
          at: account.lastLoginAt,
        }]
      : []),
    {
      id: 'profile-updated',
      label: 'Profile',
      title: 'Profile details saved',
      detail: `${account.email} is the account email on file.`,
      at: account.updatedAt,
    },
    ...account.sessions.map((session) => ({
      id: `session-${session.id}`,
      label: session.expiresAt > now ? 'Session' : 'Expired',
      title: session.sessionTokenHash === currentSessionHash ? 'Current browser session' : 'Account session recorded',
      detail: session.expiresAt > now
        ? `Active until ${formatDateTime(session.expiresAt)}.`
        : `Expired on ${formatDateTime(session.expiresAt)}.`,
      at: session.createdAt,
    })),
    ...account.passwordResetTokens.map((token) => ({
      id: `reset-${token.id}`,
      label: token.usedAt ? 'Recovery' : token.expiresAt > now ? 'Pending' : 'Expired',
      title: token.usedAt ? 'Password reset completed' : 'Password reset requested',
      detail: token.usedAt
        ? `Reset completed on ${formatDateTime(token.usedAt)}.`
        : `Reset link expires on ${formatDateTime(token.expiresAt)}.`,
      at: token.usedAt || token.createdAt,
    })),
    ...supportRequests.map((request) => ({
      id: `support-${request.id}`,
      label: 'Support',
      title: request.topic,
      detail: request.message,
      at: request.createdAt,
    })),
    {
      id: 'account-created',
      label: 'Account',
      title: 'Account created',
      detail: `${displayName} joined as a ${account.role} user.`,
      at: account.createdAt,
    },
  ].sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, 6)

  const quickActions = [
    {
      href: '/user/profile',
      title: 'Profile',
      detail: account.displayName ? 'Identity details are present.' : 'Add a display name for a complete profile.',
      action: account.displayName ? 'View profile' : 'Complete profile',
    },
    {
      href: '/user/security',
      title: 'Security',
      detail: otherActiveSessions.length > 0
        ? `${otherActiveSessions.length} other active session${otherActiveSessions.length === 1 ? '' : 's'} recorded.`
        : 'Password and session controls are available.',
      action: 'Review access',
    },
    {
      href: '/user/notifications',
      title: 'Notifications',
      detail: `${enabledNotificationCount} of 5 email preferences are enabled.`,
      action: 'Manage preferences',
    },
    {
      href: '/user/support',
      title: 'Support',
      detail: openSupportCount > 0
        ? `${openSupportCount} support request${openSupportCount === 1 ? '' : 's'} open.`
        : 'Create and track account support requests.',
      action: 'Open support',
    },
  ]

  return (
    <main className="bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="py-4 md:py-6">
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account' }]} />

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-950 text-lg font-bold text-white dark:bg-white dark:text-slate-950">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Member dashboard</p>
                        <h1 className="mt-1 truncate text-3xl font-bold">{displayName}</h1>
                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{account.email}</p>
                      </div>
                    </div>
                    <Link href="/studio" className="inline-flex w-fit items-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                      Open Studio
                    </Link>
                  </div>
                </div>

                <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Profile</p>
                    <p className="mt-2 text-2xl font-bold">{profileCompletion}%</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Completion score</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sessions</p>
                    <p className="mt-2 text-2xl font-bold">{activeSessions.length}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Active browsers</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Support</p>
                    <p className="mt-2 text-2xl font-bold">{openSupportCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Open requests</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Content</p>
                    <p className="mt-2 text-2xl font-bold">{authoredArticleCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Studio articles</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Workspace readiness</p>
                      <h2 className="mt-2 text-2xl font-bold">Account health</h2>
                    </div>
                    <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-6 space-y-3">
                    {[
                      { label: 'Display name', done: Boolean(account.displayName), value: account.displayName || 'Missing' },
                      { label: 'Email', done: Boolean(account.email), value: account.email },
                      { label: 'Account access', done: account.isActive, value: account.role },
                      { label: 'Notification coverage', done: enabledNotificationCount >= 3, value: `${enabledNotificationCount}/5 enabled` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{item.label}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{item.value}</p>
                        </div>
                        <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-semibold ${
                          item.done
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
                        }`}>
                          {item.done ? 'Ready' : 'Needs update'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Security</p>
                      <h2 className="mt-2 text-2xl font-bold">Current access</h2>
                    </div>
                    <Link href="/user/security" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                      Manage
                    </Link>
                  </div>
                  <div className="mt-6 space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Current session</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {currentSession ? `Expires ${formatDateTime(currentSession.expiresAt)}` : 'Session cookie is active'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {otherActiveSessions.length > 0
                          ? `${otherActiveSessions.length} other active session${otherActiveSessions.length === 1 ? '' : 's'} can be revoked.`
                          : 'No other active sessions are recorded.'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recovery</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                        {latestResetToken
                          ? latestResetToken.usedAt
                            ? 'Latest reset completed'
                            : latestResetToken.expiresAt > now
                              ? 'Reset link pending'
                              : 'Latest reset expired'
                          : 'No reset requests recorded'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Last login: {account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'No login recorded'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Recent activity</p>
                    <h2 className="mt-2 text-2xl font-bold">Account timeline</h2>
                  </div>
                  <Link href="/user/activity" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    View all
                  </Link>
                </div>
                <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {activity.map((event) => (
                    <div key={event.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950 dark:text-white">{event.title}</p>
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                            {event.label}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.detail}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatDateTime(event.at)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{formatRelative(event.at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Quick actions</p>
                <div className="mt-5 grid gap-3">
                  {quickActions.map((item) => (
                    <Link key={item.href} href={item.href} className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500 dark:hover:bg-slate-900">
                      <span className="block text-sm font-bold text-slate-950 dark:text-white">{item.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{item.detail}</span>
                      <span className="mt-3 block text-sm font-semibold text-teal-700 group-hover:text-teal-800 dark:text-teal-300 dark:group-hover:text-teal-200">{item.action}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Notifications</p>
                <p className="mt-3 text-3xl font-bold">{enabledNotificationCount}/5</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Preferences enabled. Last saved {formatRelative(preferences.updatedAt)}.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    ['Account', preferences.accountUpdates],
                    ['Security', preferences.securityAlerts],
                    ['Support', preferences.supportReplies],
                    ['Product', preferences.productNotes],
                    ['Digest', preferences.weeklyDigest],
                  ].map(([label, enabled]) => (
                    <span key={String(label)} className={`rounded-md px-2.5 py-2 ${
                      enabled
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Support</p>
                    <h2 className="mt-2 text-xl font-bold">Recent requests</h2>
                  </div>
                  <Link href="/user/support" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    New
                  </Link>
                </div>
                <div className="mt-5 space-y-3">
                  {supportRequests.map((request) => (
                    <div key={request.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold text-slate-950 dark:text-white">{request.topic}</p>
                        <span className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold capitalize ${statusTone(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{request.message}</p>
                    </div>
                  ))}
                  {supportRequests.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      No support requests have been opened from this account.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
