import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import { requireMemberUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Profile | InteropMed',
  description: 'View your InteropMed user profile.',
}

export default async function UserProfilePage() {
  const user = await requireMemberUser('/user/profile')
  const displayName = user.displayName || user.username

  return (
    <main className="bg-slate-100 py-4 text-slate-950 dark:bg-slate-950 dark:text-white md:py-6">
      <section>
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account', href: '/user' }, { label: 'Profile' }]} />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-slate-950 text-xl font-bold text-white dark:bg-white dark:text-slate-950">
                  {displayName.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Profile</p>
                  <h1 className="mt-1 truncate text-3xl font-bold">{displayName}</h1>
                  <p className="mt-2 break-words text-sm text-slate-600 dark:text-slate-300">{user.email}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Username</p>
                  <p className="mt-2 break-words text-lg font-bold">{user.username}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
                  <p className="mt-2 text-lg font-bold capitalize">{user.role}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Account status</p>
              <div className="mt-5 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between gap-3">
                  <span>Access</span>
                  <span className="rounded-md bg-emerald-50 px-2 py-1 font-semibold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">Active</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Workspace</span>
                  <span className="font-semibold text-slate-950 dark:text-white">Member</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Studio access</span>
                  <span className="font-semibold text-slate-950 dark:text-white">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
