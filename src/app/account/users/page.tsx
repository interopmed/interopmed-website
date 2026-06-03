import Link from 'next/link'
import { redirect } from 'next/navigation'
import AccountUserCreateForm from '@/components/AccountUserCreateForm'
import AccountLogoutButton from '@/components/AccountLogoutButton'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { requireAccountUser } from '@/lib/account-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Account Users | InteropMed',
  description: 'Create and review real InteropMed account users.',
}

async function getAuthUsers() {
  try {
    return await prisma.authUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })
  } catch (error) {
    console.error('Error loading account users:', error)
    return []
  }
}

function formatDate(value: Date | null) {
  if (!value) {
    return 'Never'
  }

  return value.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function AccountUsersPage() {
  const accountUser = await requireAccountUser('/account/users')

  if (accountUser.role !== 'admin') {
    redirect('/account')
  }

  const users = await getAuthUsers()

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-white py-16 dark:bg-slate-950 md:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="max-w-4xl">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-teal-600 dark:text-teal-400">
                  Account users
                </p>
                <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-950 dark:text-white md:text-5xl">
                  Real usernames, real passwords, real sessions.
                </h1>
                <p className="text-lg leading-8 text-slate-600 dark:text-slate-300">
                  Manage the database-backed users who can sign into the InteropMed account area and launch Studio.
                </p>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Current admin: {accountUser.displayName ?? accountUser.username}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-500 hover:text-teal-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-teal-400 dark:hover:text-teal-300"
                >
                  Back to dashboard
                </Link>
                <AccountLogoutButton />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16 dark:bg-slate-900">
          <div className="mx-auto grid max-w-7xl gap-8 px-6 lg:grid-cols-[0.9fr_1.1fr]">
            <AccountUserCreateForm />

            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
              <h2 className="mb-4 text-2xl font-bold text-slate-950 dark:text-white">Existing users</h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950 dark:text-white">
                          {user.displayName || user.username}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          @{user.username} / {user.email}
                        </p>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>{user.role}</p>
                        <p>{user.isActive ? 'active' : 'inactive'}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300 md:grid-cols-2">
                      <p>Created: {formatDate(user.createdAt)}</p>
                      <p>Last login: {formatDate(user.lastLoginAt)}</p>
                    </div>
                  </article>
                ))}
                {users.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No auth users found yet.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
