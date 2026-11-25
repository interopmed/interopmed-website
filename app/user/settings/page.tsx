import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountNotificationPreferencesForm from '@/components/AccountNotificationPreferencesForm'
import AccountSettingsForm from '@/components/AccountSettingsForm'
import ProfilePhotoManager from '@/components/ProfilePhotoManager'
import ApiKeyManager from '@/components/ApiKeyManager'
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
    <main className="min-h-full py-2">
      <div className="mx-auto max-w-6xl">
        <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Settings' }]} />
        
        <div className="mt-4 grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <ProfilePhotoManager
              displayName={settingsUser.displayName || settingsUser.publicHandle}
              initialImageUrl={settingsUser.profileImage}
            />
            <AccountSettingsForm user={serializedSettingsUser} />
            <AccountNotificationPreferencesForm preferences={preferences} />
            <ApiKeyManager />
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 dark:backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </span>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Settings center</p>
              </div>
              <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Account and preferences</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Profile details and email delivery rules are managed here. The notifications page now shows messages and account events you have received.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
