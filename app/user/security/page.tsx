import { cookies } from 'next/headers'
import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountSecurityForm from '@/components/AccountSecurityForm'
import AccountSessionsPanel from '@/components/AccountSessionsPanel'
import {
  ACCOUNT_SESSION_COOKIE,
  hashAccountSessionToken,
  requireMemberUser,
} from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Security | InteropMed',
  description: 'Manage security settings for your InteropMed user account.',
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

export default async function UserSecurityPage() {
  const user = await requireMemberUser('/user/security')
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(ACCOUNT_SESSION_COOKIE)?.value
  const currentSessionHash = rawToken ? hashAccountSessionToken(rawToken) : null
  const now = new Date()

  const account = await prisma.authUser.findUnique({
    where: { id: user.id },
    select: {
      email: true,
      lastLoginAt: true,
      updatedAt: true,
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          sessionTokenHash: true,
          createdAt: true,
          expiresAt: true,
        },
      },
      passwordResetTokens: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
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

  const activeSessions = account.sessions.filter((session) => session.expiresAt > now)
  const otherActiveSessions = activeSessions.filter((session) => session.sessionTokenHash !== currentSessionHash)
  const latestResetToken = account.passwordResetTokens[0]

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Security' }]} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <AccountSecurityForm />
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Session history</p>
                    <h2 className="mt-2 text-2xl font-bold">Recent sessions</h2>
                  </div>
                  <Link href="/user/activity" className="w-fit rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                    View activity
                  </Link>
                </div>
                <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
                  {account.sessions.map((session) => {
                    const isCurrent = session.sessionTokenHash === currentSessionHash
                    const isActive = session.expiresAt > now

                    return (
                      <div key={session.id} className="grid gap-3 p-4 md:grid-cols-[1fr_auto] md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950 dark:text-white">
                              {isCurrent ? 'Current browser session' : 'Account session'}
                            </p>
                            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              isActive
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {isActive ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Created {formatDateTime(session.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                          Expires {formatDateTime(session.expiresAt)}
                        </p>
                      </div>
                    )
                  })}
                  {account.sessions.length === 0 && (
                    <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
                      No session records are currently stored.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <AccountSessionsPanel otherSessionCount={otherActiveSessions.length} />
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Recovery</p>
                <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">Password reset</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Generate a one-time reset link if you cannot use your current password.
                </p>
                {latestResetToken && (
                  <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                    <p className="font-semibold text-slate-950 dark:text-white">
                      Latest reset {latestResetToken.usedAt ? 'completed' : latestResetToken.expiresAt > now ? 'pending' : 'expired'}
                    </p>
                    <p className="mt-1 text-slate-600 dark:text-slate-300">
                      Requested {formatDateTime(latestResetToken.createdAt)}
                    </p>
                  </div>
                )}
                <Link href="/account/reset-password" className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                  Reset password
                </Link>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Security notes</p>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li>Member accounts cannot access admin publishing or user management.</li>
                  <li>Password changes are hashed before storage.</li>
                  <li>Revoking sessions removes stored session records for other browsers.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
