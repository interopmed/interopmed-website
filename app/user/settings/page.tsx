import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import AccountSettingsForm from '@/components/AccountSettingsForm'
import { requireMemberUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Settings | InteropMed',
  description: 'Manage your InteropMed user account settings.',
}

export default async function UserSettingsPage() {
  const user = await requireMemberUser('/user/settings')

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Settings' }]} />
          <AccountSettingsForm user={user} />
        </div>
      </section>
    </main>
  )
}
