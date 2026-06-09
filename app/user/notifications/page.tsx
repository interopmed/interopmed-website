import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import { requireMemberUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Notifications | InteropMed',
  description: 'Review InteropMed account and interoperability notifications.',
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

function toneClass(tone: 'amber' | 'emerald' | 'sky' | 'slate' | 'teal') {
  if (tone === 'emerald') {
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
  }

  if (tone === 'sky') {
    return 'bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300'
  }

  if (tone === 'teal') {
    return 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-300'
  }

  if (tone === 'amber') {
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
  }

  return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
}

function supportTone(status: string): 'amber' | 'emerald' | 'sky' | 'slate' {
  if (status === 'responded') {
    return 'emerald'
  }

  if (status === 'reviewed') {
    return 'sky'
  }

  if (status === 'archived') {
    return 'slate'
  }

  return 'amber'
}

export default async function UserNotificationsPage() {
  const user = await requireMemberUser('/user/notifications')
  const now = new Date()

  const [account, preferences, supportRequests] = await Promise.all([
    prisma.authUser.findUnique({
      where: { id: user.id },
      select: {
        username: true,
        email: true,
        displayName: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
          },
        },
        passwordResetTokens: {
          orderBy: { createdAt: 'desc' },
          take: 6,
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
      take: 10,
      select: {
        id: true,
        topic: true,
        message: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ])

  if (!account) {
    return null
  }

  const displayName = account.displayName || account.username
  const enabledPreferenceCount = [
    preferences.accountUpdates,
    preferences.productNotes,
    preferences.supportReplies,
    preferences.securityAlerts,
    preferences.weeklyDigest,
  ].filter(Boolean).length

  const notifications = [
    ...(account.lastLoginAt
      ? [{
          id: 'last-login',
          category: 'Security',
          title: 'Successful workspace sign-in',
          body: `${displayName} signed in to the protected InteropMed member workspace.`,
          href: '/user/security',
          action: 'Review sessions',
          tone: 'teal' as const,
          at: account.lastLoginAt,
        }]
      : []),
    {
      id: 'profile-updated',
      category: 'Account',
      title: 'Account profile updated',
      body: `Profile details for ${account.email} were saved and are available for support routing.`,
      href: '/user/settings',
      action: 'Open settings',
      tone: 'slate' as const,
      at: account.updatedAt,
    },
    {
      id: 'preference-updated',
      category: 'Preferences',
      title: 'Notification preferences saved',
      body: `${enabledPreferenceCount} of 5 notification channels are enabled for account, security, support, release, and digest updates.`,
      href: '/user/settings',
      action: 'Manage preferences',
      tone: 'sky' as const,
      at: preferences.updatedAt,
    },
    ...supportRequests.map((request) => ({
      id: `support-${request.id}`,
      category: request.topic.toLowerCase().includes('fhir') || request.topic.toLowerCase().includes('hl7')
        ? 'FHIR/HL7 support'
        : 'Support',
      title: request.status === 'responded'
        ? 'Support request received a response'
        : request.status === 'reviewed'
          ? 'Support request is under review'
          : 'Support request received',
      body: `${request.topic}: ${request.message}`,
      href: '/user/support',
      action: 'View request',
      tone: supportTone(request.status),
      at: request.updatedAt > request.createdAt ? request.updatedAt : request.createdAt,
    })),
    ...account.sessions.map((session) => ({
      id: `session-${session.id}`,
      category: 'Session',
      title: session.expiresAt > now ? 'Account session created' : 'Account session expired',
      body: session.expiresAt > now
        ? `A browser session is active until ${formatDateTime(session.expiresAt)}.`
        : `A browser session expired on ${formatDateTime(session.expiresAt)}.`,
      href: '/user/security',
      action: 'Review access',
      tone: session.expiresAt > now ? 'emerald' as const : 'slate' as const,
      at: session.createdAt,
    })),
    ...account.passwordResetTokens.map((token) => ({
      id: `reset-${token.id}`,
      category: 'Recovery',
      title: token.usedAt ? 'Password reset completed' : token.expiresAt > now ? 'Password reset link issued' : 'Password reset link expired',
      body: token.usedAt
        ? `A password reset was completed on ${formatDateTime(token.usedAt)}.`
        : token.expiresAt > now
          ? `A reset link is available until ${formatDateTime(token.expiresAt)}.`
          : `A reset link expired on ${formatDateTime(token.expiresAt)}.`,
      href: '/user/security',
      action: 'Review recovery',
      tone: token.usedAt ? 'emerald' as const : token.expiresAt > now ? 'amber' as const : 'slate' as const,
      at: token.usedAt || token.createdAt,
    })),
    {
      id: 'account-created',
      category: 'Account',
      title: 'InteropMed account created',
      body: `${displayName} can access member resources for FHIR, HL7 v2, API, implementation, and support workflows.`,
      href: '/user',
      action: 'Open dashboard',
      tone: 'teal' as const,
      at: account.createdAt,
    },
  ].sort((a, b) => b.at.getTime() - a.at.getTime())

  const unreadLikeCount = notifications.filter((notification) => {
    const ageMs = now.getTime() - notification.at.getTime()
    return ageMs < 1000 * 60 * 60 * 24 * 7
  }).length
  const supportCount = notifications.filter((notification) => notification.category.includes('Support') || notification.category.includes('FHIR')).length
  const securityCount = notifications.filter((notification) => notification.category === 'Security' || notification.category === 'Session' || notification.category === 'Recovery').length

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Notifications' }]} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Received notifications</p>
                  <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">InteropMed inbox</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Account, security, support, and interoperability workflow notifications generated from your actual workspace activity.
                  </p>
                </div>
                <Link href="/user/settings" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Preferences
                </Link>
              </div>

              <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {notifications.map((notification) => (
                  <div key={notification.id} className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${toneClass(notification.tone)}`}>
                          {notification.category}
                        </span>
                        <p className="font-semibold text-slate-950 dark:text-white">{notification.title}</p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(notification.at)}</p>
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{formatRelative(notification.at)}</p>
                      <Link href={notification.href} className="text-sm font-semibold text-teal-700 hover:text-teal-800 dark:text-teal-300 dark:hover:text-teal-200">
                        {notification.action}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Inbox summary</p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent</p>
                    <p className="mt-2 text-2xl font-bold">{unreadLikeCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Last 7 days</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Support</p>
                    <p className="mt-2 text-2xl font-bold">{supportCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Request updates</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Security</p>
                    <p className="mt-2 text-2xl font-bold">{securityCount}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Access events</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Preferences moved</p>
                <h2 className="mt-2 text-xl font-bold">Manage delivery in Settings</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Email preference controls now live with your account settings. This page is reserved for notifications you have received.
                </p>
                <Link href="/user/settings" className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                  Open settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
