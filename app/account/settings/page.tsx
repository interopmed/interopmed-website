import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountSettingsForm from '@/components/AccountSettingsForm'
import { requireAdminUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Settings | InteropMed',
  description: 'Manage your InteropMed account settings.',
}

export default async function AccountSettingsPage() {
  const accountUser = await requireAdminUser('/account/settings')

  return (
    <main className="bg-slate-50 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'Settings' }]} />
          <AccountSettingsForm user={accountUser} />
        </div>
      </section>
    </main>
  )
}
