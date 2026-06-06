import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import { requireMemberUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Activity | InteropMed',
  description: 'Review recent InteropMed user account activity.',
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

export default async function UserActivityPage() {
  const user = await requireMemberUser('/user/activity')

  const account = await prisma.authUser.findUnique({
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
        take: 10,
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
        },
      },
      passwordResetTokens: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          expiresAt: true,
          usedAt: true,
        },
      },
    },
  })

  if (!account) {
    return null
  }

  const now = new Date()
  const activeSessions = account.sessions.filter((session) => session.expiresAt > now)
  const expiredSessions = account.sessions.filter((session) => session.expiresAt <= now)
  const displayName = account.displayName || account.username

  const activity = [
    ...(account.lastLoginAt
      ? [{
          id: 'last-login',
          title: 'Successful login',
          body: `${displayName} signed in to the member workspace.`,
          at: account.lastLoginAt,
          status: 'Account',
        }]
      : []),
    {
      id: 'profile-updated',
      title: 'Account profile updated',
      body: `Profile details for ${account.email} were saved.`,
      at: account.updatedAt,
      status: 'Profile',
    },
    ...account.sessions.map((session) => ({
      id: `session-${session.id}`,
      title: session.expiresAt > now ? 'Active session created' : 'Session expired',
      body: session.expiresAt > now
        ? `A browser session is active until ${formatDateTime(session.expiresAt)}.`
        : `A previous session expired on ${formatDateTime(session.expiresAt)}.`,
      at: session.createdAt,
      status: session.expiresAt > now ? 'Active' : 'Expired',
    })),
    ...account.passwordResetTokens.map((token) => ({
      id: `reset-${token.id}`,
      title: token.usedAt ? 'Password reset completed' : 'Password reset requested',
      body: token.usedAt
        ? `A reset token was used on ${formatDateTime(token.usedAt)}.`
        : `A reset token was issued and expires on ${formatDateTime(token.expiresAt)}.`,
      at: token.usedAt || token.createdAt,
      status: token.usedAt ? 'Used' : token.expiresAt > now ? 'Pending' : 'Expired',
    })),
    {
      id: 'account-created',
      title: 'Account created',
      body: `${displayName} was added as a ${account.role} user.`,
      at: account.createdAt,
      status: account.isActive ? 'Active' : 'Inactive',
    },
  ].sort((a, b) => b.at.getTime() - a.at.getTime())

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Activity' }]} />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Activity</p>
              <h1 className="mt-3 text-3xl font-bold">Recent account events</h1>
              <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                {activity.map((event) => (
                  <div key={event.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-950 dark:text-white">{event.title}</p>
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                          {event.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{event.body}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateTime(event.at)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{formatRelative(event.at)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Session summary</p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Active</p>
                    <p className="mt-2 text-2xl font-bold">{activeSessions.length}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recent expired</p>
                    <p className="mt-2 text-2xl font-bold">{expiredSessions.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Last login</p>
                <p className="mt-3 text-lg font-bold">
                  {account.lastLoginAt ? formatDateTime(account.lastLoginAt) : 'No login recorded'}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Activity is generated from account records, sessions, and password reset events stored in the database.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
