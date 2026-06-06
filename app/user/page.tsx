import Link from 'next/link'
import AccountBreadcrumb from '@/components/AccountBreadcrumb'
import { requireMemberUser } from '@/lib/account-auth'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'User Account | InteropMed',
  description: 'InteropMed user account dashboard.',
}

export default async function UserAccountPage() {
  const user = await requireMemberUser('/user')

  return (
    <main className="bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="py-4 md:py-6">
        <div className="mx-auto">
          <AccountBreadcrumb items={[{ label: 'User account' }]} />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Signed in as</p>
              <h1 className="mt-3 text-3xl font-bold">{user.displayName || user.username}</h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                This is the member account workspace. Admin tools, content publishing, taxonomies, and user management live in the separate admin system.
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
                  <p className="mt-2 text-lg font-bold capitalize">{user.role}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Email</p>
                  <p className="mt-2 break-words text-lg font-bold">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Account actions</p>
              <div className="mt-5 grid gap-3">
                <Link href="/user/profile" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  View profile
                </Link>
                <Link href="/user/security" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Security
                </Link>
                <Link href="/user/notifications" className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-400 hover:text-teal-700 dark:border-slate-800 dark:text-slate-300 dark:hover:border-teal-500 dark:hover:text-teal-300">
                  Notifications
                </Link>
                <Link href="/studio" className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-200">
                  Open Studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
