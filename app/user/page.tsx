import { cookies } from 'next/headers'
import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountPostFeed from '@/components/AccountPostFeed'
import {
  ACCOUNT_SESSION_COOKIE,
  hashAccountSessionToken,
  requireMemberUser,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Account | InteropMed',
  description: 'InteropMed user account home.',
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

const interoperabilityTracks = [
  {
    href: '/documentation/fhir-implementation',
    label: 'Resources',
    title: 'Resource mapping',
    detail: 'Review resource modeling, profile alignment, and implementation guide patterns.',
  },
  {
    href: '/documentation/getting-started',
    label: 'Messages',
    title: 'Message intake',
    detail: 'Prepare ADT, ORM, ORU, and interface migration workflows for validation.',
  },
  {
    href: '/api-reference',
    label: 'Contracts',
    title: 'Service contracts',
    detail: 'Inspect endpoints for patient, record, taxonomy, insight, and account workflows.',
  },
  {
    href: '/compliance',
    label: 'Trust',
    title: 'Security posture',
    detail: 'Review access controls, privacy expectations, and implementation safeguards.',
  },
]

export default async function UserAccountPage() {
  const user = await requireMemberUser('/user')
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ACCOUNT_SESSION_COOKIE)?.value
  const currentSessionHash = rawToken ? hashAccountSessionToken(rawToken) : null
  const now = new Date()

  const [account, preferences, supportRequests, authoredArticleCount, posts] = await Promise.all([
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
    prisma.userPost.findMany({
      where: { status: 'published' },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        content: true,
        topic: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
          },
        },
        comments: {
          where: { status: 'published' },
          orderBy: { createdAt: 'asc' },
          take: 8,
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                username: true,
                displayName: true,
                role: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
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
  const interoperabilitySupportCount = supportRequests.filter((request) =>
    request.topic.toLowerCase().includes('fhir') ||
    request.topic.toLowerCase().includes('hl7') ||
    request.message.toLowerCase().includes('fhir') ||
    request.message.toLowerCase().includes('hl7')
  ).length
  const profileChecks = [
    Boolean(account.displayName),
    Boolean(account.email),
    account.isActive,
    enabledNotificationCount >= 3,
  ]
  const profileCompletion = Math.round((profileChecks.filter(Boolean).length / profileChecks.length) * 100)
  const latestResetToken = account.passwordResetTokens[0]
  const serializedPosts = posts.map((post) => ({
    id: post.id,
    content: post.content,
    topic: post.topic,
    visibility: post.visibility,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    author: post.author,
    comments: post.comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: comment.author,
    })),
    commentCount: post._count.comments,
  }))
  const currentFeedUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  }

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
      href: '/user/settings',
      title: 'Notification settings',
      detail: `${enabledNotificationCount} of 5 email preferences are enabled.`,
      action: 'Manage preferences',
    },
    {
      href: '/user/support',
      title: 'FHIR/HL7 support',
      detail: openSupportCount > 0
        ? `${openSupportCount} support request${openSupportCount === 1 ? '' : 's'} open, ${interoperabilitySupportCount} interoperability-focused.`
        : 'Route mapping, validation, interface, and implementation questions.',
      action: 'Request guidance',
    },
    {
      href: '/implementation',
      title: 'Implementation guide',
      detail: 'Plan clinical data exchange workflows across services, standards, interfaces, and operations.',
      action: 'Review guide',
    },
    {
      href: '/shin',
      title: 'Network architecture',
      detail: 'Explore shared health information network patterns and interoperability layers.',
      action: 'View architecture',
    },
  ]

  return (
    <main className="bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="py-4 md:py-6">
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account' }]} />

          <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="h-16 bg-slate-950 dark:bg-slate-900" aria-hidden="true" />
                <div className="px-5 pb-5 text-center">
                  <div className="mx-auto -mt-9 grid h-18 w-18 place-items-center rounded-full border-4 border-white bg-slate-950 text-2xl font-bold text-white shadow-sm dark:border-slate-900 dark:bg-white dark:text-slate-950">
                    {displayName.slice(0, 1).toUpperCase()}
                  </div>
                  <h1 className="mt-3 truncate text-xl font-bold text-slate-950 dark:text-white">{displayName}</h1>
                  <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">{account.email}</p>
                  <div className="mt-4 border-y border-slate-200 py-3 text-left dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Profile strength</p>
                      <p className="text-sm font-bold text-teal-700 dark:text-teal-300">{profileCompletion}%</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Authored insights</p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{authoredArticleCount}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Open requests</p>
                      <p className="text-sm font-bold text-slate-950 dark:text-white">{openSupportCount}</p>
                    </div>
                  </div>
                  <Link href="/user/profile" className="mt-4 inline-flex w-full justify-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    View profile
                  </Link>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Professional presence</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className="h-full rounded-full bg-teal-600" style={{ width: `${profileCompletion}%` }} />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Keep profile details, alerts, and support context current so collaborators understand your implementation work.
                </p>
                <Link href="/user/settings" className="mt-4 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
                  Improve profile
                </Link>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Quick links</p>
                <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
                  {[
                    { href: '/user/notifications', label: 'Notifications', value: `${enabledNotificationCount} enabled` },
                    { href: '/user/activity', label: 'Activity', value: `${activity.length} updates` },
                    { href: '/user/support', label: 'Support', value: openSupportCount ? `${openSupportCount} open` : 'Ready' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="flex items-center justify-between gap-3 py-3 text-sm transition first:pt-0 last:pb-0 hover:text-teal-700 dark:hover:text-teal-300">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                      <span className="text-xs font-semibold text-slate-400">{item.value}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:hidden">
                <div className="h-24 bg-slate-950 dark:bg-slate-900" aria-hidden="true" />
                <div className="border-b border-slate-200 px-5 pb-5 dark:border-slate-800 md:px-6">
                  <div className="-mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-white bg-slate-950 text-3xl font-bold text-white shadow-sm dark:border-slate-900 dark:bg-white dark:text-slate-950">
                        {displayName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 sm:pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="truncate text-3xl font-bold">{displayName}</h1>
                          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                            {account.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-sm text-slate-600 dark:text-slate-300">{account.email}</p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-300">
                          <span><span className="font-bold text-slate-950 dark:text-white">{profileCompletion}%</span> profile</span>
                          <span><span className="font-bold text-slate-950 dark:text-white">{activeSessions.length}</span> session{activeSessions.length === 1 ? '' : 's'}</span>
                          <span><span className="font-bold text-slate-950 dark:text-white">{authoredArticleCount}</span> insight{authoredArticleCount === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/user/profile" className="inline-flex w-fit items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                        View profile
                      </Link>
                      <Link href="/user/settings" className="inline-flex w-fit items-center rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                        Edit
                      </Link>
                      <Link href="/studio" className="inline-flex w-fit items-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                        Open workspace
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Profile</p>
                    <p className="mt-2 text-2xl font-bold">{profileCompletion}%</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Completion score</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Sessions</p>
                    <p className="mt-2 text-2xl font-bold">{activeSessions.length}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Active browsers</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Requests</p>
                    <p className="mt-2 text-2xl font-bold">{interoperabilitySupportCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Specialist help</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Insights</p>
                    <p className="mt-2 text-2xl font-bold">{authoredArticleCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Insights authored</p>
                  </div>
                </div>
              </div>

              <AccountPostFeed currentUser={currentFeedUser} initialPosts={serializedPosts} />

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Workspace feed</p>
                    <h2 className="mt-2 text-2xl font-bold">Latest signals</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      A social-style stream of account, support, standards, and security activity from your InteropMed workspace.
                    </p>
                  </div>
                  <Link href="/user/activity" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    Full feed
                  </Link>
                </div>
                <div className="mt-6 space-y-4">
                  {activity.slice(0, 4).map((event) => (
                    <article key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex gap-3">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-white dark:text-slate-950">
                          {displayName.slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950 dark:text-white">{displayName}</p>
                            <span className="text-sm text-slate-400">posted an update</span>
                            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                              {event.label}
                            </span>
                          </div>
                          <h3 className="mt-2 text-base font-bold text-slate-950 dark:text-white">{event.title}</h3>
                          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.detail}</p>
                          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-200 pt-3 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
                            <span>{formatRelative(event.at)}</span>
                            <span>{enabledNotificationCount} alert paths</span>
                            <span>{openSupportCount} open requests</span>
                            <span>{activeSessions.length} active sessions</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Interoperability focus</p>
                    <h2 className="mt-2 text-2xl font-bold">Standards workflow center</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                      Use this account area to move from implementation questions into concrete standards work: resource modeling, interface planning, service contracts, and compliance review.
                    </p>
                  </div>
                  <Link href="/documentation" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    Documentation
                  </Link>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {interoperabilityTracks.map((track) => (
                    <Link key={track.href} href={track.href} className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-400 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:hover:border-teal-500 dark:hover:bg-slate-900">
                      <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm dark:bg-slate-900 dark:text-slate-300">
                        {track.label}
                      </span>
                      <span className="mt-3 block text-base font-bold text-slate-950 dark:text-white">{track.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-slate-300">{track.detail}</span>
                      <span className="mt-3 block text-sm font-semibold text-teal-700 group-hover:text-teal-800 dark:text-teal-300 dark:group-hover:text-teal-200">
                        Open track
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Workspace readiness</p>
                      <h2 className="mt-2 text-2xl font-bold">Interop readiness</h2>
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
                      { label: 'Standards alerts', done: enabledNotificationCount >= 3, value: `${enabledNotificationCount}/5 notification paths enabled` },
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
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Secure exchange</p>
                      <h2 className="mt-2 text-2xl font-bold">Access and trust</h2>
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
                          : 'No other active sessions are recorded for this workspace.'}
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
                        Last login: {account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'No login recorded'} for protected standards resources
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
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Network</p>
                <h2 className="mt-2 text-xl font-bold">Standards circle</h2>
                <div className="mt-5 space-y-3">
                  {[
                    ['Resources', 'Profiles and workflow modeling'],
                    ['Messages', 'Message intake and interface migration'],
                    ['Network', 'Architecture and operations'],
                    ['Compliance', 'Trust, access, and privacy posture'],
                  ].map(([label, detail]) => (
                    <div key={label} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-xs font-bold text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                        {label.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{label}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Interop actions</p>
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
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Standards alerts</p>
                <p className="mt-3 text-3xl font-bold">{enabledNotificationCount}/5</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Email paths enabled for account, security, support, product, and digest updates. Last saved {formatRelative(preferences.updatedAt)}.
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs font-semibold">
                  {[
                    ['Account', preferences.accountUpdates],
                    ['Security', preferences.securityAlerts],
                    ['Support', preferences.supportReplies],
                    ['Releases', preferences.productNotes],
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
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Implementation support</p>
                    <h2 className="mt-2 text-xl font-bold">FHIR/HL7 requests</h2>
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
                      No implementation requests yet. Use support for profiles, message mapping, service contracts, or compliance questions.
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
