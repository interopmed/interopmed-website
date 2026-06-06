import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountNotificationPreferencesForm from '@/components/AccountNotificationPreferencesForm'
import { requireMemberUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Notifications | InteropMed',
  description: 'Manage InteropMed user notification preferences.',
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

export default async function UserNotificationsPage() {
  const user = await requireMemberUser('/user/notifications')

  const preferences = await prisma.authNotificationPreference.upsert({
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
  })

  const enabledCount = [
    preferences.accountUpdates,
    preferences.productNotes,
    preferences.supportReplies,
    preferences.securityAlerts,
    preferences.weeklyDigest,
  ].filter(Boolean).length

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Notifications' }]} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <AccountNotificationPreferencesForm preferences={preferences} />
            <div className="space-y-5">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Preference status</p>
                <p className="mt-3 text-3xl font-bold">{enabledCount}/5</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Notification types currently enabled.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Last saved</p>
                <p className="mt-3 text-sm font-bold leading-6">{formatDateTime(preferences.updatedAt)}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  These settings are stored with your InteropMed account and follow you across browsers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
