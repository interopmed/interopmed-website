import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountSettingsForm from '@/components/AccountSettingsForm'
import ProfilePhotoManager from '@/components/ProfilePhotoManager'
import { requireAdminUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Settings | InteropMed',
  description: 'Manage your InteropMed account settings.',
}

export default async function AccountSettingsPage() {
  const accountUser = await requireAdminUser('/account/settings')
  const settingsUser = await prisma.authUser.findUniqueOrThrow({
    where: { id: accountUser.id },
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
  })
  const serializedSettingsUser = {
    ...settingsUser,
    displayNameChangedAt: settingsUser.displayNameChangedAt?.toISOString() || null,
    publicHandleChangedAt: settingsUser.publicHandleChangedAt?.toISOString() || null,
  }

  return (
    <main className="bg-slate-50 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'Settings' }]} />
          <div className="space-y-5">
            <ProfilePhotoManager
              displayName={settingsUser.displayName || settingsUser.publicHandle}
              initialImageUrl={settingsUser.profileImage}
            />
            <AccountSettingsForm user={serializedSettingsUser} />
          </div>
        </div>
      </section>
    </main>
  )
}
