import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountNotificationPreferencesForm from '@/components/AccountNotificationPreferencesForm'
import AccountSettingsForm from '@/components/AccountSettingsForm'
import ProfilePhotoManager from '@/components/ProfilePhotoManager'
import { requireMemberUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Settings | InteropMed',
  description: 'Manage your InteropMed user account settings.',
}

export default async function UserSettingsPage() {
  const user = await requireMemberUser('/user/settings')
  const [settingsUser, preferences] = await Promise.all([
    prisma.authUser.findUniqueOrThrow({
      where: { id: user.id },
      select: {
        username: true,
        publicHandle: true,
        email: true,
        displayName: true,
        profileImage: true,
        displayNameChangedAt: true,
        publicHandleChangedAt: true,
        role: true,
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
  ])

  const serializedSettingsUser = {
    ...settingsUser,
    displayNameChangedAt: settingsUser.displayNameChangedAt?.toISOString() || null,
    publicHandleChangedAt: settingsUser.publicHandleChangedAt?.toISOString() || null,
  }

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Settings' }]} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-5">
              <ProfilePhotoManager
                displayName={settingsUser.displayName || settingsUser.publicHandle}
                initialImageUrl={settingsUser.profileImage}
              />
              <AccountSettingsForm user={serializedSettingsUser} />
              <AccountNotificationPreferencesForm preferences={preferences} />
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Settings center</p>
              <h2 className="mt-2 text-xl font-bold">Account and notification preferences</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Profile details and email delivery rules are managed here. The notifications page now shows messages and account events you have received.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
